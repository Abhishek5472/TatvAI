import React from "react";
import Mandala from "../assets/mandala.svg"; // 1. ADD this line to import the image

const HomePage = () => {
  return (
    // Your original container, NO CHANGES
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Your original header, NO CHANGES */}
      <header className="h-16 flex items-center justify-center bg-white shadow">
        <h1 className="text-3xl font-bold tracking-wider">TatvAI</h1>
      </header>

      {/* 2. MOVED the search bar here from the bottom */}
      <div className="w-2/3 mx-auto my-4">
        <input
          type="text"
          placeholder="Search news..."
          className="w-full px-4 py-3 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Your original main content wrapper, with added spacing */}
      <div className="flex flex-1 px-6 pb-6 gap-6">
        {/* Left Sidebar */}
        <aside className="w-1/6 bg-white/50 p-4 rounded-lg">
          {/* Your <LeftSidebar /> component will go here */}
          Left Sidebar
        </aside>

        {/* Middle Section */}
        {/* We use your 'big-panel' class and make it a flex container */}
        <main className="flex-1 flex flex-col big-panel p-6">
          <h2 className="text-2xl font-bold mb-4">Trending News</h2>
          
          {/* 3. MODIFIED the grid to be 2x3 (6 cards) */}
          <div className="grid grid-cols-2 gap-6 flex-1">
            {Array.from({ length: 6 }).map((_, i) => ( // Changed length from 9 to 6
              <div
                key={i}
                className="h-full w-full bg-white rounded-xl shadow hover:shadow-lg transition p-4"
                style={{ backgroundColor: 'var(--card-inner)' }}
              >
                Card {i + 1}
              </div>
            ))}
          </div>
          {/* The Search Bar is no longer here */}
        </main>

        {/* Right Sidebar */}
        <aside className="w-1/6 bg-white/50 p-4 rounded-lg">
          {/* Your <RightSidebar /> component will go here */}
          Right Sidebar
        </aside>
      </div>

      {/* 4. ADDED the Mandala images for decoration */}
      <img src={Mandala} alt="Mandala Decoration" className="app-mandala-left" />
      <img src={Mandala} alt="Mandala Decoration" className="app-mandala-right" />
    </div>
  );
};

export default HomePage;