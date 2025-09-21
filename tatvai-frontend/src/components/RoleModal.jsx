import React from "react";

export default function RoleModal({ onSelect }){
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl p-6 w-full max-w-md text-center">
        <h3 className="text-xl font-semibold mb-3">Welcome to TatvAI</h3>
        <p className="text-sm text-gray-600 mb-4">Choose how we'd personalize news for you:</p>
        <div className="flex flex-col gap-3">
          <button onClick={()=> onSelect("journalist")} className="py-2 rounded bg-[var(--accent)]">Journalist</button>
          <button onClick={()=> onSelect("student")} className="py-2 rounded bg-[var(--accent)]">Student</button>
          <button onClick={()=> onSelect("reader")} className="py-2 rounded bg-[var(--accent)]">General Reader</button>
        </div>
      </div>
    </div>
  );
}
