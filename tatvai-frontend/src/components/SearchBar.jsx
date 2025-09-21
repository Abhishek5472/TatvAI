import React, { useState } from "react";
import curve from "../assets/curve.svg";

export default function SearchBar(){
  const [q, setQ] = useState("");
  return (
    <div className="relative">
      <div className="flex justify-center">
        <div className="w-full max-w-3xl relative">
          <input
            value={q}
            onChange={(e)=> setQ(e.target.value)}
            placeholder="Search news, topics or keywords..."
            className="w-full px-6 py-3 rounded-full shadow focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* curve positioned below input; width tuned to input */}
      <div className="curve-wrap">
        <img src={curve} alt="curve" className="curve-img" />
      </div>
    </div>
  );
}
