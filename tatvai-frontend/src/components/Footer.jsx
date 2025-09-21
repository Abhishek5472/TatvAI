import React from "react";
export default function Footer(){
  return (
    <footer className="mt-8 py-6 text-center text-xs text-gray-600">
      © {new Date().getFullYear()} TatvAI • AI × Culture × Verified News • Prototype for Hackathon
    </footer>
  );
}
