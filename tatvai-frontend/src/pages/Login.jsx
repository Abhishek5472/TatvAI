// src/pages/Login.jsx
import React from 'react';

// Re-usable Google Logo component
const GoogleLogo = () => (
  <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 9.692C34.522 5.882 29.574 3.5 24 3.5C13.484 3.5 5 11.984 5 22.5S13.484 41.5 24 41.5c10.516 0 19-8.484 19-19c0-1.333-.133-2.633-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691c-1.122 2.36-1.806 4.956-1.806 7.809s.684 5.448 1.806 7.809l-5.011 3.882C.057 30.638 0 26.69 0 22.5s.057-8.138 1.295-11.691l5.011 3.882z"></path>
    <path fill="#4CAF50" d="M24 41.5c5.574 0 10.522-1.882 14.192-5.808l-5.65-4.37c-1.833 1.233-4.14 1.95-6.542 1.95c-5.223 0-9.66-3.51-11.238-8.203l-5.12 3.96C9.66 35.99 16.27 41.5 24 41.5z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.16-4.087 5.571l5.65 4.37c3.357-3.127 5.48-7.678 5.48-12.941c0-1.333-.133-2.633-.389-3.917z"></path>
  </svg>
);

// We pass the onLogin prop from App.jsx
export default function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative" style={{ background: 'var(--bg)' }}>
      {/* Re-using your decorative elements for a consistent feel */}
      <img src="/assets/mandala.svg" alt="Decoration" className="app-mandala-bottom-left" />
      <img src="/assets/mandala.svg" alt="Decoration" className="app-mandala-top-right" />
      <img src="/assets/mandala.svg" alt="Decoration" className="app-mandala-top-left" />
      <img src="/assets/mandala.svg" alt="Decoration" className="app-mandala-bottom-right" />
      <div className="top-curve-border"></div>
      <div className="bottom-curve-border"></div>

      <div className="text-center p-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          <img src="/assets/title.png" alt="TatvAI Logo" className="w-24 h-24 rounded-full" />
          <img src="/assets/name_title.png" alt="TatvAI Name" className="h-16" />
        </div>

        <h1 className="text-2xl font-semibold text-[--text] mb-2">Welcome to TatvAI</h1>
        <p className="text-gray-600 mb-10">Sign in to continue to your personalized news feed.</p>

        <button
          onClick={onLogin}
          className="inline-flex items-center justify-center px-6 py-3 bg-white rounded-lg shadow-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <GoogleLogo />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}