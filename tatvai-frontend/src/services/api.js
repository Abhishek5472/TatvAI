// src/services/api.js
const API_BASE = "http://localhost:5000"; // backend server

export async function fetchArticles() {
  const res = await fetch(`${API_BASE}/api/articles`);
  return res.json();
}

export async function summarizeArticle(content) {
  const res = await fetch(`${API_BASE}/api/ai-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return res.json();
}

// src/services/api.js
export async function predictTrends(content) {
  const res = await fetch(`${API_BASE}/api/ai-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, type: "predictions" }),
  });
  return res.json();
}


export async function translateArticle(text, target) {
  const res = await fetch(`${API_BASE}/api/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target }),
  });
  return res.json();
}

