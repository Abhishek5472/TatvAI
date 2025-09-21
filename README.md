# 📰 TatvAI – AI-Powered News Aggregation & Misinformation Combat Tool

TatvAI is an AI-driven news aggregation and synthesis platform designed to **combat misinformation** and help users consume reliable, credible news.  
The system collects news from multiple sources, groups similar stories, generates AI summaries, predicts future developments, and provides translations for accessibility.

---

## 🌟 Key Features

- 🔎 **News Aggregation** – Collects latest articles from **RSS feeds** and **NewsAPI**.  
- 🧩 **Deduplication & Grouping** – Groups similar stories using **fuzzy title similarity**.  
- 🤖 **AI-Powered Summaries** – Generates concise summaries using **OpenAI API** (fallback to extractive summarizer).  
- 📈 **Predictive Insights** – Provides AI-powered predictions on likely developments of news stories.  
- 🌍 **Translation** – Supports multilingual access with automatic translations (via LibreTranslate API).  
- 🔖 **Bookmarks** – Users can bookmark stories for later reading.  
- 🖥 **Modern UI** – Clean, responsive React frontend with interactive article modal.  

---

## 🛠 Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS (UI styling)
- Fetch API (API integration)

**Backend**
- Node.js + Express
- RSS Parser (news feeds)
- NewsAPI (optional, requires API key)
- OpenAI API (summaries, predictions)
- LibreTranslate (translation)
- Node-Schedule (periodic aggregation)

---

## 📂 Project Structure

TatvAI Project/
├── tatvai-frontend/ # React frontend
├── tatvai-backend/ # Node.js + Express backend
├── README.md # Project documentation
└── .gitignore


---

## ⚙️ Setup Instructions
in one terminal cd tatvai-frontend run => npm run dev
in another terminal tatvai-backend run => node server.js

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/TatvAI.git
cd TatvAI
