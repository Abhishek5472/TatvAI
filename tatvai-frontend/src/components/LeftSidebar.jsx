import React from "react";
import { Home, Layers, Bookmark, Settings } from "lucide-react";

export default function LeftSidebar({ onNavigate, onSettings, bookmarks, onClearBookmarks, onRemoveBookmark }){
  return (
    <div className="big-panel p-5 h-[78vh] flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Home size={18} className="text-[#6b4f3f]" />
          <h3 className="font-bold text-lg">Navigation</h3>
        </div>

        <nav className="flex flex-col gap-3 text-sm">
          <button onClick={()=> onNavigate("news")} className="text-left hover:text-[#6b4f3f]">News Feed</button>
          <button onClick={()=> onNavigate("discover")} className="text-left hover:text-[#6b4f3f]">Discover</button>
          <button onClick={onSettings} className="text-left hover:text-[#6b4f3f]">Settings</button>
        </nav>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">Bookmarks</h4>
          <button onClick={onClearBookmarks} className="text-xs text-red-500">Clear</button>
        </div>

        {(!bookmarks || bookmarks.length===0) ? (
          <p className="text-xs text-gray-500">No bookmarks yet.</p>
        ) : (
          <ul className="space-y-2 max-h-40 overflow-y-auto text-sm">
            {bookmarks.map((b, idx) => (
              <li key={idx} className="flex items-start justify-between gap-2">
                <div className="text-sm">{b.title || b}</div>
                <div className="flex gap-2">
                  <button className="text-xs text-blue-600" onClick={()=> window.open(b.url,"_blank")}>Open</button>
                  <button className="text-xs text-red-500" onClick={()=> onRemoveBookmark(idx)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
