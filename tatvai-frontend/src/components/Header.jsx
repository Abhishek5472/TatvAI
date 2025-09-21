import React from "react";

export default function Header(){
  return (
    <header className="flex flex-col items-center py-6">
      <div className="flex items-center gap-4">
        <img src="/src/assets/title.png" alt="TatvAI" className="w-28 h-28 rounded-full drop-shadow" />
        <div className="">
          <div className="text-3xl font-serif text-[#4a3622]">TatvAI</div>
          <div className="text-xs text-gray-600">AI · Culture · Verified News</div>
        </div>
      </div>
    </header>
  );
}
