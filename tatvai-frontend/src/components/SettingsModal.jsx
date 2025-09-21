import React from "react";

export default function SettingsModal({ onClose }){
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600">✖</button>
        <h3 className="text-xl font-semibold mb-4">Settings</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <label className="block mb-1">Language</label>
            <select className="w-full border rounded px-2 py-1">
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Theme</label>
            <select className="w-full border rounded px-2 py-1">
              <option>TatvAI (Gold)</option>
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
