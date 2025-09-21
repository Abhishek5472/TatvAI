import React from "react";

export default function RightSidebar(){
  const tags = ["AI","Education","Culture","Policy","Sports","Startup"];
  return (
    <div className="big-panel p-5 h-[78vh]">
      <h3 className="font-bold text-lg mb-3">Trending</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map(t => <span key={t} className="px-3 py-1 bg-[#f5f1e3] rounded-full text-xs">{t}</span>)}
      </div>

      <h4 className="font-semibold mb-2">Must Read</h4>
      <ul className="text-sm space-y-2 mb-4">
        <li>AI Ethics report highlights...</li>
        <li>Sanskrit manuscripts digitized...</li>
      </ul>

      <h4 className="font-semibold mb-2">Preferences</h4>
      <p className="text-xs text-gray-600">You can set language, domains and theme in settings.</p>
    </div>
  );
}
