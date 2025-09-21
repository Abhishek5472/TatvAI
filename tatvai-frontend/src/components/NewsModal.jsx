import React from "react";

export default function NewsModal({ article, onClose }){
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full overflow-auto relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600">✖</button>
        {article.urlToImage && <img src={article.urlToImage} alt={article.title} className="w-full h-60 object-cover rounded-t-xl" />}
        <div className="p-6">
          <h2 className="text-2xl font-bold">{article.title}</h2>
          <p className="text-gray-700 mt-3">{article.content || article.description}</p>

          <div className="mt-4 flex gap-3">
            <button className="px-3 py-2 bg-[var(--accent)] rounded text-black">Summarize</button>
            <button className="px-3 py-2 bg-[var(--accent)] rounded text-black">Predict</button>
            <button className="px-3 py-2 border rounded">Translate</button>
            <button className="px-3 py-2 border rounded">Listen</button>
            <a className="ml-auto text-sm text-blue-600" href={article.url || "#"} target="_blank" rel="noreferrer">Open original</a>
          </div>
        </div>
      </div>
    </div>
  );
}
