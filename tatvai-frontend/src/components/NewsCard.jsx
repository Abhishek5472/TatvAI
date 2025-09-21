import React, { useState } from "react";
import NewsModal from "./NewsModal";
import { Bookmark } from "lucide-react";

export default function NewsCard({ article, onBookmark }){
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="p-2">
        <div
          className="bg-[var(--card-inner)] rounded-xl overflow-hidden shadow hover:shadow-lg transform hover:-translate-y-1 transition cursor-pointer"
        >
          {article.urlToImage ? (
            <img src={article.urlToImage} alt={article.title} className="w-full h-44 article-img" />
          ) : (
            <div className="w-full h-44 bg-gray-100 flex items-center justify-center">No image</div>
          )}

          <div className="p-4">
            <h3 className="font-semibold text-[#5b3b1f]">{article.title}</h3>
            <p className="text-sm text-gray-700 mt-2 line-clamp-3">{article.description}</p>

            <div className="mt-3 flex items-center gap-2">
              <button onClick={()=> { onBookmark?.(article); }} className="px-3 py-1 rounded bg-[var(--accent)] text-black text-sm flex items-center gap-2">
                <Bookmark size={14} /> Bookmark
              </button>

              <button onClick={()=> setOpen(true)} className="ml-auto text-sm text-blue-600">Open →</button>
            </div>
          </div>
        </div>
      </div>

      {open && <NewsModal article={article} onClose={()=> setOpen(false)} />}
    </>
  );
}
