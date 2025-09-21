import { Bookmark } from "lucide-react";
import mandala from "../assets/mandala.svg";
import title from "../assets/title.png";

function Discover() {
  const cards = [
    {
      title: "AI transforms rural classrooms",
      desc: "A concise AI-driven lesson delivery system is being piloted across villages.",
      img: "https://source.unsplash.com/400x200/?ai,education"
    },
    {
      title: "Sanskrit OCR gets boost",
      desc: "Researchers apply ML to digitize manuscripts for searchability.",
      img: "https://source.unsplash.com/400x200/?sanskrit,books"
    },
    {
      title: "Markets react to GenAI",
      desc: "Investors track generative AI trends across sectors.",
      img: "https://source.unsplash.com/400x200/?finance,technology"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <img src={title} alt="TatvAI Logo" className="h-20" />
        <h1 className="text-3xl font-bold mt-2">तत्त्वAI</h1>
        <button className="mt-3 bg-yellow-400 px-4 py-2 rounded-lg font-medium">
          Sign in with Google
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search news, topics or keywords..."
          className="w-2/3 px-4 py-2 border rounded-full shadow-sm"
        />
      </div>

      {/* Trending + Discover */}
      <div className="grid grid-cols-4 gap-6">
        {/* Left Section - Discover */}
        <div className="col-span-3">
          <h2 className="text-2xl font-bold mb-4">Discover • Trending</h2>
          <div className="grid grid-cols-3 gap-6">
            {cards.map((c, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-md">
                <img src={c.img} alt={c.title} className="w-full h-40 object-cover rounded-md" />
                <h3 className="mt-3 font-semibold">{c.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
                <button className="mt-3 flex items-center bg-yellow-400 px-3 py-1 rounded-md text-sm font-medium">
                  <Bookmark className="w-4 h-4 mr-1" /> Bookmark
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Trending */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-3">🔥 Trending</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {["AI", "Education", "Culture", "Policy", "Sports"].map((tag) => (
              <span key={tag} className="px-3 py-1 bg-yellow-100 text-sm rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="text-sm space-y-2">
            <li><a href="#" className="hover:underline">🌐 Global AI News</a></li>
            <li><a href="#" className="hover:underline">Startup Funding</a></li>
            <li><a href="#" className="hover:underline">Cultural Heritage</a></li>
          </ul>
        </div>
      </div>

      {/* Mandala Background */}
      <div className="absolute top-10 right-10 opacity-10">
        <img src={mandala} alt="Mandala Background" className="w-40" />
      </div>
    </div>
  );
}

export default Discover;
