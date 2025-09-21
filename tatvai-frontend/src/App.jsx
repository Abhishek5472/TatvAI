// src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, Settings, Bookmark as BookmarkIcon, Globe, Play } from "lucide-react";
import { NEWS_API_KEY } from "./config"; // put your NewsAPI key in src/config.js

// ADD THIS BLOCK
import { auth, db, loginWithGoogle } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import LoginPage from "./pages/Login";
import RoleModal from "./components/RoleModal";
// --- All of your existing functions and logic are kept exactly the same ---
// Optional Firebase sign-in (works only if you filled src/firebase.js)
let firebaseAuthImports = {};
try {
  // eslint-disable-next-line
  const fb = require("./firebase");
  firebaseAuthImports.auth = fb.auth;
  firebaseAuthImports.provider = fb.provider;
} catch (e) {
  // firebase not configured or not present; that's ok
  // console.log("Firebase not configured - sign in disabled in Placeholders");
}

/* -------------------------
   Helper utilities
   ------------------------- */
const clamp = (s, n = 100) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s || "");
const fmtTime = (t) => (t ? new Date(t).toLocaleString() : "");
const fallbackSummary = (text) => {
  if (!text) return "No text";
  const sents = (text.match(/[^\.!\?]+[\.!\?]+/g) || [text]);
  return sents.slice(0, 2).join(" ") + (sents.length > 2 ? " ..." : "");
};


/* -------------------------
   Main Component
   ------------------------- */
export default function App() {

  const [authLoading, setAuthLoading] = useState(true);
  // layout / nav
  const [page, setPage] = useState("news"); // news | discover
  const [showSettings, setShowSettings] = useState(false);

  // user & role
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("tatv_role") || "");

  // news state
  const [articles, setArticles] = useState([]); // array of article objects
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const refreshTimer = useRef(null);

  // modal / UI
  const [activeArticle, setActiveArticle] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tatv_bookmarks") || "[]");
    } catch { return []; }
  });
  const [language, setLanguage] = useState("en"); // for TTS / translate UI

  /* -------------------------
     News fetching
     ------------------------- */
  async function fetchNews(q = "") {
    setLoading(true);
    try {
      // prefer NewsAPI if key present
      if (NEWS_API_KEY && NEWS_API_KEY.length > 8) {
        const isSearch = q && q.trim().length > 0;
        const url = isSearch
          ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&pageSize=30&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
          : `https://newsapi.org/v2/top-headlines?country=in&pageSize=30&apiKey=${NEWS_API_KEY}`;

        const res = await axios.get(url, { timeout: 10000 });
        const list = Array.isArray(res.data?.articles) ? res.data.articles : [];
        const mapped = list.map((a, i) => ({
          id: a.url || `n-${i}`,
          title: a.title,
          description: a.description || a.content || "",
          urlToImage: a.urlToImage || `https://picsum.photos/seed/tatvai${i}/800/500`,
          url: a.url,
          content: a.content || a.description || "",
          source: a.source?.name,
          publishedAt: a.publishedAt,
        }));
        setArticles(mapped.slice(0, 30)); // keep a buffer
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }

      // fallback demo (picsum)
      const demo = Array.from({ length: 9 }).map((_, i) => ({
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
        content: "Detailed article content placeholder; in Phase-2 we will replace this with full article text when available.",
        source: "TatvAI Demo",
        publishedAt: new Date().toISOString()
      }));
      setArticles(demo);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("fetchNews error:", err);
      // fallback to demo on any error
      const demo = Array.from({ length: 9 }).map((_, i) => ({
        id: `demo-${i}`,
        title: `Demo story ${i + 1}`,
        description: `Demo snippet ${i + 1}`,
        urlToImage: `https://picsum.photos/seed/tatvai${i}/800/500`,
        url: "#",
        content: "Demo content",
        source: "TatvAI Demo",
        publishedAt: new Date().toISOString()
      }));
      setArticles(demo);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // initial load
    fetchNews();

    // auto refresh every 60s
    refreshTimer.current = setInterval(() => {
      fetchNews(query);
    }, 60_000);

    return () => clearInterval(refreshTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------
     Search handlers
     ------------------------- */
  async function onSearchSubmit(e) {
    e?.preventDefault?.();
    await fetchNews(query);
  }

  /* -------------------------
     Bookmarks
     ------------------------- */
  function addBookmark(article) {
    const found = bookmarks.find(b => b.url === article.url || b.id === article.id);
    if (found) return alert("Already bookmarked");
    const next = [article, ...bookmarks];
    setBookmarks(next);
    localStorage.setItem("tatv_bookmarks", JSON.stringify(next));
  }
  function removeBookmark(index) {
    const next = bookmarks.filter((_, i) => i !== index);
    setBookmarks(next);
    localStorage.setItem("tatv_bookmarks", JSON.stringify(next));
  }
  function clearBookmarks() {
    setBookmarks([]);
    localStorage.removeItem("tatv_bookmarks");
  }

  /* -------------------------
     Role & Login
     ------------------------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        setUser(firebaseUser); // Set the user state

        if (userDoc.exists() && userDoc.data().role) {
          // If they have a role saved in the database, use it
          setRole(userDoc.data().role);
        } else {
          // Otherwise, their role is empty, which will trigger the modal
          setRole(""); 
        }
      } else {
        // User is signed out
        setUser(null);
        setRole("");
      }
      setAuthLoading(false); // We're done checking, so we can show the page
    });
    
    // Cleanup function
    return () => unsubscribe();
  }, []);

  // Place this block after your other useEffect hooks
  useEffect(() => {
    // Prevent background scrolling when the modal is open
    if (user && !role) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function to restore scrolling if component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [user, role]);

  // This function is called when a user clicks a role in the modal
  const handleRoleSelect = async (selectedRole) => {
    if (!user) return; // Safety check
    try {
      // Save the selected role to the user's document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { role: selectedRole }, { merge: true });
      
      // Update the role in our app's state to unblur the page and hide the modal
      setRole(selectedRole);
    } catch (error) {
      console.error("Error saving role:", error);
      alert("Could not save your role. Please try again.");
    }
  };

  /* -------------------------
     Summarize / Predict / Translate / Listen
     ------------------------- */
  async function callSummarize(text) {
    if (!text) return "No text";
    // If backend exists at /api/ai-summary, call it
    try {
      const res = await axios.post("/api/ai-summary", { content: text, type: "summary" }, { timeout: 8000 });
      if (res.data?.result) return res.data.result;
      if (res.data?.summary) return res.data.summary;
    } catch (e) {
      // console.warn("ai-summary failed", e);
    }
    // fallback
    return fallbackSummary(text);
  }

  async function callPredict(text) {
    if (!text) return "No content";
    try {
      const res = await axios.post("/api/ai-summary", { content: text, type: "predictions" }, { timeout: 8000 });
      if (res.data?.result) return res.data.result;
    } catch (e) {
      // console.warn("ai-predict failed", e);
    }
    // fallback simple predictions
    return "• Stakeholders will monitor developments\n• Related industries may be impacted\n• Expect follow-ups in coming weeks";
  }

  async function callTranslate(text, target = "hi") {
    if (!text) return "";
    // try public LibreTranslate endpoint; may be rate / CORS limited
    try {
      const res = await axios.post("https://libretranslate.de/translate", {
        q: text,
        source: "en",
        target,
        format: "text"
      }, { headers: { "Content-Type": "application/json" }, timeout: 8000 });
      if (res.data?.translatedText) return res.data.translatedText;
    } catch (e) {
      // fallback - just return original
    }
    return text;
  }

  function speakText(text, lang = "en-US") {
    if (!("speechSynthesis" in window)) return alert("TTS not supported in this browser");
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  /* -------------------------
     UI pieces
     ------------------------- */

  // small reusable ArticleCard component inside this file (single-file deliverable)
  function ArticleCard({ a }) {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="rounded-xl overflow-hidden shadow-lg bg-[var(--card-inner)]"
      >
        <div className="w-full h-44 bg-gray-100">
          <img src={a.urlToImage} alt={a.title} className="w-full h-full object-cover article-img" />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-[#5b3b1f]">{clamp(a.title, 120)}</h3>
          <p className="text-sm text-gray-700 mt-2 line-clamp-3">{clamp(a.description || a.content, 180)}</p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => addBookmark(a)}
              className="px-3 py-1 rounded bg-[var(--accent)] text-black text-sm flex items-center gap-2"
            >
              <BookmarkIcon size={14} /> Bookmark
            </button>

            <button onClick={() => setActiveArticle(a)} className="ml-auto text-sm text-blue-600">Open →</button>
          </div>

          <div className="mt-2 text-xs text-gray-500 flex justify-between">
            <span>{a.source || "Source"}</span>
            <span>{fmtTime(a.publishedAt)}</span>
          </div>
        </div>
      </motion.div>
    );
  }


  // ==================================================================
  // ===== UI LAYOUT & JSX - THIS IS THE ONLY PART I HAVE CHANGED =====
  // ==================================================================
 // --- Conditional Rendering Logic ---
  
  if (authLoading) {
    // Show a simple loading screen while Firebase checks for a logged-in user
    return (
      
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p className="text-lg">Loading TatvAI...</p>
      </div>
    );
  }

  if (!user) {
    // If no user is found after checking, show the Login Page
    return <LoginPage onLogin={loginWithGoogle} />;
  }
  
  // If a user is logged in, show the main app
  return (
    // The main app is blurred if the user hasn't selected a role yet
    <>
    <div className={`min-h-screen w-full flex flex-col relative ${!role ? 'blur-sm pointer-events-none' : ''}`} style={{ background: "var(--bg)" }}>
      <div className="top-curve-border"></div>
      <div className="bottom-curve-border"></div>
      <img src="/src/assets/mandala.svg" alt="" className="app-mandala-left" />
      <img src="/src/assets/mandala.svg" alt="" className="app-mandala-right" />
      <img src="/src/assets/mandala.svg" alt="" className="app-mandala-top-left" />
      <img src="/src/assets/mandala.svg" alt="" className="app-mandala-bottom-right" />

      <header className="flex items-center justify-center p-4">
        <div className="flex items-center gap-4">
          <img src="/src/assets/tatvai-logo.png" alt="TatvAI Logo" className="w-35 h-35 rounded-full" />
          <img src="/src/assets/name_title.png" alt="TatvAI Name" className="h-16" />
        </div>
      </header>

      <div className="w-full max-w-4xl mx-auto px-4 my-4">
        <form onSubmit={onSearchSubmit} className="w-full">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Discover the truth..."
            className="w-full px-6 py-3 rounded-full shadow-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </form>
      </div>

      <main className="flex-1 grid grid-cols-[1fr_3fr_1fr] gap-6 px-6 pb-6">
          {/* ... Your entire main layout with sidebars and news grid ... */}
          {/* LEFT Sidebar */}
          <aside className="flex flex-col p-4 rounded-lg shadow-sm bg-white/50 h-full">
              <h3 className="font-semibold text-lg mb-4">Navigation</h3>
              <nav className="flex flex-col gap-3">
                  <button onClick={() => setPage("news")} className="text-left hover:text-[#6b4f3f]">News Feed</button>
                  <button onClick={() => setPage("discover")} className="text-left hover:text-[#6b4f3f]">Discover</button>
                  <button onClick={() => setShowSettings(true)} className="text-left hover:text-[#6b4f3f]">Settings</button>
              </nav>
          </aside>
          {/* CENTER */}
          <section className="big-panel p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-[#3b2b1a]">Trending News</h2>
                  <div className="text-sm text-gray-600">{loading ? "Loading…" : `${articles.length} available`}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                  {articles.slice(0, 6).map((a, idx) => (
                      <ArticleCard key={a.id || idx} a={a} />
                  ))}
              </div>
          </section>
          {/* RIGHT Sidebar */}
          <aside className="flex flex-col gap-6">
              <div className="big-panel p-5">
                  <h3 className="font-semibold text-lg mb-3">Trending</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                      {["AI", "Education", "Culture", "Policy", "Sports"].map(t => (
                          <button key={t} onClick={() => { setQuery(t); fetchNews(t); }} className="px-3 py-1 bg-[#f5f1e3] rounded-full text-sm">{t}</button>
                      ))}
                  </div>
                  <h4 className="font-semibold mb-2">Quick Links</h4>
                  <ul className="text-sm space-y-2 mb-4">
                      <li><a href="#" className="hover:underline">Global AI News</a></li>
                      <li><a href="#" className="hover:underline">Startup Funding</a></li>
                      <li><a href="#" className="hover:underline">Cultural Heritage</a></li>
                  </ul>
                  <div className="mt-6">
                      <h4 className="font-semibold mb-2">Audio / Language</h4>
                      <div className="flex gap-2 items-center">
                          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-2 py-1 border rounded text-sm">
                              <option value="en">English</option>
                              <option value="hi">Hindi</option>
                              <option value="mr">Marathi</option>
                          </select>
                      </div>
                  </div>
              </div>
              <div className="big-panel p-5">
                  <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Bookmarks</h4>
                      <button onClick={clearBookmarks} className="text-xs text-red-500">Clear</button>
                  </div>
                  {!bookmarks.length ? <p className="text-xs text-gray-500">No bookmarks yet.</p> : (
                      <ul className="space-y-2 max-h-40 overflow-y-auto">
                          {bookmarks.map((b, i) => (
                              <li key={i} className="flex items-start justify-between gap-2">
                                  <div className="text-sm">{b.title}</div>
                                  <div className="flex gap-2">
                                      {b.url && <button className="text-xs text-blue-600" onClick={() => window.open(b.url, "_blank")}>Open</button>}
                                      <button className="text-xs text-red-500" onClick={() => removeBookmark(i)}>Remove</button>
                                  </div>
                              </li>
                          ))}
                      </ul>
                  )}
              </div>
          </aside>
      </main>

      <footer className="py-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} TatvAI · AI × Culture × Verified News
      </footer>
      
      {/* Your original ArticleModal logic is here, but the RoleModal is now separate */}
      {activeArticle && ( <ArticleModal  /> )}
    </div>      

    {/* The Role Modal is shown here if user is logged in but has no role */}
    {user && !role && (
      <RoleModal onSelect={handleRoleSelect} />
    )}
  </>
    
  ); 
}