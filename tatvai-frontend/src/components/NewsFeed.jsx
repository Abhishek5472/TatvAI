// src/components/NewsFeed.jsx
import React, { useState, useEffect } from "react";
import {
  fetchArticles,
  summarizeArticle,
  predictTrends,
  translateArticle,
} from "../services/api";

export default function NewsFeed({ onBookmark }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [aiResult, setAiResult] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchArticles()
      .then((data) => {
        if (Array.isArray(data?.events)) {
          setArticles(data.events);
        } else if (Array.isArray(data)) {
          setArticles(data); // fallback if API returns array
        }
      })
      .catch((err) => console.error("fetchArticles error", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSummarize = async (a) => {
    setAiResult("⏳ Summarizing...");
    const res = await summarizeArticle(a.snippet || a.title);
    setAiResult(res.result || "No summary available.");
  };

  const handlePredict = async (a) => {
    setAiResult("⏳ Predicting...");
    const res = await predictTrends(a.snippet || a.title);
    setAiResult(res.result || "No prediction available.");
  };

  const handleTranslate = async (a, lang = "hi") => {
    setAiResult("⏳ Translating...");
    const res = await translateArticle(a.snippet || a.title, lang);
    setAiResult(res.translated || "Translation failed.");
  };

  return (
    <div>
      <div className="mb-4">
        <div className="text-xl font-semibold text-[#3b2b1a]">
          Discover • Trending
        </div>
      </div>

      <div className="big-panel p-6">
        {loading ? (
          <p className="text-gray-500">Loading news...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(0, 9).map((a) => (
              <article
                key={a.id}
                className="p-3 bg-[#faf9f6] rounded-lg border hover:shadow transition cursor-pointer"
                onClick={() => {
                  setSelectedArticle(a);
                  setAiResult("");
                }}
              >
                {a.image ? (
                  <img
                    src={a.image}
                    alt={a.title}
                    className="w-full h-40 rounded-md mb-3 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-md mb-3 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}

                <h3 className="font-semibold text-[#5b3b1f]">{a.title}</h3>
                <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                  {a.snippet}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookmark?.(a.title);
                    }}
                    className="px-3 py-1 rounded-md bg-[#d4af37] text-black text-sm"
                  >
                    Bookmark
                  </button>
                </div>

                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                  <span>{a.source || "Source"}</span>
                  <a
                    href={a.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600"
                  >
                    Read →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal for expanded article */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-2 text-[#5b3b1f]">
              {selectedArticle.title}
            </h2>

            {selectedArticle.image && (
              <img
                src={selectedArticle.image}
                alt=""
                className="rounded mb-4 max-h-64 object-cover w-full"
              />
            )}

            <p className="text-gray-700 mb-4">
              {selectedArticle.snippet || "No description available."}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => handleSummarize(selectedArticle)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                Summarize
              </button>
              <button
                onClick={() => handlePredict(selectedArticle)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
              >
                Predict
              </button>
              <button
                onClick={() => handleTranslate(selectedArticle, "hi")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
              >
                Translate (Hindi)
              </button>
            </div>

            {aiResult && (
              <div className="p-3 border rounded bg-gray-50 text-sm whitespace-pre-line">
                {aiResult}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
