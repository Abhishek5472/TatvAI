import React, { useEffect, useState } from "react";
import NewsCard from "../components/NewsCard";
import axios from "axios";
import { NEWS_API_KEY } from "../config";

/* NewsFeed - shows a stable 3x3 grid. Uses NewsAPI if key present, otherwise demo placeholders.
   This is Phase-1: demo fallback enabled. Phase-2 will expand to real-time server side aggregation.
*/

function demoArticles(){
  return Array.from({length:9}).map((_,i)=>({
    id: `demo-${i}`,
    title: [
      "AI transforms rural classrooms",
      "Sanskrit OCR gets boost",
      "Markets react to GenAI",
      "Climate-smart farming pilot",
      "Local startup wins seed",
      "Cricket semis amaze fans",
      "Health diagnostics with AI",
      "Cultural archives digitized",
      "Policy forum on responsible AI"
    ][i],
    description: "Short snippet describing the story. Click to open full view.",
    urlToImage: `https://picsum.photos/seed/tatvai${i}/800/500`,
    url: "#",
    content: "Longer article content placeholder..."
  }));
}

export default function NewsFeed({ onBookmark }){
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load(){
    setLoading(true);
    try{
      if(typeof NEWS_API_KEY === "string" && NEWS_API_KEY.length > 8){
        // use NewsAPI top-headlines for India
        const url = `https://newsapi.org/v2/top-headlines?country=in&pageSize=30&apiKey=${NEWS_API_KEY}`;
        const res = await axios.get(url, { timeout: 8000 });
        const list = Array.isArray(res.data?.articles) ? res.data.articles.slice(0,9) : [];
        if(list.length) {
          setArticles(list.map((a,i)=>({
            id: a.url || `n-${i}`,
            title: a.title,
            description: a.description || a.content || "",
            urlToImage: a.urlToImage || `https://picsum.photos/seed/tatvai${i}/800/500`,
            url: a.url,
            content: a.content || ""
          })));
          setLoading(false); return;
        }
      }
      // fallback
      setArticles(demoArticles());
    } catch(err){
      console.error("news fetch err", err);
      setArticles(demoArticles());
    } finally { setLoading(false); }
  }

  useEffect(()=> {
    load();
  },[]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#3b2b1a]">Discover • Trending</h2>
        <div className="text-sm text-gray-600">{loading ? "Loading..." : `${articles.length} items`}</div>
      </div>

      <div className="big-panel p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a)=> <NewsCard key={a.id} article={a} onBookmark={onBookmark} />)}
        </div>
      </div>
    </div>
  );
}
