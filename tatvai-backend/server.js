// server.js - simple Express backend for TatvAI Phase 3
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Parser = require('rss-parser');
const stringSimilarity = require('string-similarity');
const schedule = require('node-schedule');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const DATA_FILE = path.join(__dirname, 'aggregated.json');
const NEWS_API_KEY = process.env.NEWS_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const rssParser = new Parser();

// A curated list of RSS feeds (start with 20-30 reputable sources)
// You should expand to many sources later
const RSS_SOURCES = [
  "https://rss.cnn.com/rss/edition.rss",
  "https://feeds.bbci.co.uk/news/rss.xml",
  "https://www.thehindu.com/news/feeder/default.rss",
  "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
  // add more feeds...
];

// Utility: normalize title for grouping
function normalizeTitle(t) {
  return (t || "").toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}

// Simple extractive summarizer fallback
function extractiveSummary(text, maxSentences = 3) {
  if(!text) return "";
  const sents = (text.match(/[^.!?]+[.!?]+/g) || [text]);
  return sents.slice(0, maxSentences).join(" ");
}

// Worker: aggregate NewsAPI + RSS and create grouped events
async function aggregateOnce() {
  try {
    let items = [];

    // 1) NewsAPI top-headlines (India + world)
    if (NEWS_API_KEY) {
      try {
        const newsUrl = `https://newsapi.org/v2/top-headlines?country=in&pageSize=50&apiKey=${NEWS_API_KEY}`;
        const res = await axios.get(newsUrl, { timeout: 10000 });
        if (Array.isArray(res.data?.articles)) {
          items = items.concat(res.data.articles.map(a => ({
            title: a.title,
            description: a.description || a.content,
            url: a.url,
            image: a.urlToImage,
            source: a.source?.name,
            publishedAt: a.publishedAt
          })));
        }
      } catch(e) {
        console.warn("NewsAPI fetch failed:", e.message);
      }
    }

    // 2) RSS sources
    for(const feedUrl of RSS_SOURCES) {
      try {
        const feed = await rssParser.parseURL(feedUrl);
        feed.items.slice(0, 20).forEach(it => {
          items.push({
            title: it.title,
            description: it.contentSnippet || it.content || it.summary,
            url: it.link,
            image: it.enclosure?.url || null,
            source: feed.title,
            publishedAt: it.pubDate
          });
        });
      } catch(e) {
        console.warn("RSS parse failed for", feedUrl, e.message);
      }
    }

    // Normalize & group by fuzzy title similarity
    const groups = [];
    const used = new Array(items.length).fill(false);

    for (let i=0;i<items.length;i++){
      if (used[i]) continue;
      const a = items[i];
      const normA = normalizeTitle(a.title);
      const group = { titles: [a.title], items:[a], sources: new Set([a.source || "unknown"]), url: a.url, image: a.image, publishedAt: a.publishedAt };
      used[i] = true;

      for (let j=i+1;j<items.length;j++){
        if (used[j]) continue;
        const b = items[j];
        const normB = normalizeTitle(b.title);
        const similarity = stringSimilarity.compareTwoStrings(normA, normB);
        // threshold: >= 0.55 similar
        if (similarity >= 0.55) {
          group.titles.push(b.title);
          group.items.push(b);
          group.sources.add(b.source || "unknown");
          used[j] = true;
          // keep earliest publishedAt as group time
          if (b.publishedAt && (!group.publishedAt || new Date(b.publishedAt) > new Date(group.publishedAt))) {
            group.publishedAt = b.publishedAt;
            group.url = b.url || group.url;
            group.image = b.image || group.image;
          }
        }
      }
      groups.push(group);
    }

    // Map groups to canonical events
    const events = groups.map(g => ({
      id: normalizeTitle(g.titles[0]).slice(0,40).replace(/\s+/g,'-') + "-" + Math.random().toString(36).slice(2,8),
      title: g.titles[0],
      snippet: g.items[0]?.description || "",
      image: g.image || null,
      url: g.url || null,
      sources: Array.from(g.sources),
      verifiedCount: g.sources.size,
      publishedAt: g.publishedAt || new Date().toISOString()
    }));

    // Save to file (simple persistence)
    await fs.writeFile(DATA_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), events }, null, 2), "utf8");
    console.log("Aggregated:", events.length, "events");
  } catch (err) {
    console.error("aggregateOnce failed", err);
  }
}

// Schedule aggregator to run every 5 minutes (or run manually)
schedule.scheduleJob('*/5 * * * *', () => {
  console.log("Running scheduled aggregation...");
  aggregateOnce();
});

// Also run at startup
aggregateOnce().catch(console.error);

// Endpoint: aggregated events (for frontend, paginated)
app.get('/api/articles', async (req, res) => {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8').catch(()=>null);
    const parsed = raw ? JSON.parse(raw) : { updatedAt: null, events: [] };
    // simple filtering by query
    const q = (req.query.q||"").toLowerCase();
    let ev = parsed.events || [];
    if (q) {
      ev = ev.filter(e => (e.title + " " + (e.snippet||"")).toLowerCase().includes(q));
    }
    // sort verified first then recency
    ev.sort((a,b)=> (b.verifiedCount - a.verifiedCount) || (new Date(b.publishedAt) - new Date(a.publishedAt)));
    res.json({ updatedAt: parsed.updatedAt, events: ev.slice(0, 50) });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: "failed to read aggregated data" });
  }
});

// AI summary endpoint: uses OpenAI if configured; fallback to extractive
app.post('/api/ai-summary', async (req, res) => {
  try {
    const { content, type } = req.body || {};
    if (!content) return res.status(400).json({ error: "missing content" });

    if (OPENAI_API_KEY) {
      // call Chat Completions (gpt-4o-mini or gpt-4.1) or text-davinci depending on availability
      const openaiUrl = "https://api.openai.com/v1/chat/completions";
      const prompt = type === "predictions"
        ? `Make 3 concise predictions about likely next developments for the following news:\n\n${content}\n\nReturn as short bullet points.`
        : `Summarize the following article in 4-6 sentences:\n\n${content}`;

      const response = await axios.post(openaiUrl, {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 450,
        temperature: 0.2
      }, { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } });

      const aiText = (response.data?.choices?.[0]?.message?.content) || (response.data?.choices?.[0]?.text) || "";
      return res.json({ result: aiText });
    }

    // fallback
    if (type === "predictions") {
      return res.json({ result: "• Stakeholders will watch developments\n• Further analysis and follow-ups will appear\n• Policy responses may follow" });
    }
    const summary = extractiveSummary(content, 3);
    return res.json({ result: summary });

  } catch (err) {
    console.error("ai-summary err", err?.response?.data || err.message);
    res.status(500).json({ error: "ai-summary failed" });
  }
});

// Simple translate proxy (LibreTranslate); beware of rate limits/CORS
app.post('/api/translate', async (req, res) => {
  try {
    const { text, target } = req.body || {};
    if (!text || !target) return res.status(400).json({ error: "missing fields" });
    // try libretranslate.de public instance
    try {
      const r = await axios.post("https://libretranslate.de/translate", { q: text, source: "en", target, format: "text" }, { headers: { "Content-Type": "application/json" }});
      return res.json({ translated: r.data.translatedText });
    } catch(e){
      console.warn("libretranslate failed", e.message);
      return res.json({ translated: text });
    }
  } catch(err){
    res.status(500).json({ error: "translate failed" });
  }
});

// health
app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=> console.log("TatvAI backend listening on", PORT));
