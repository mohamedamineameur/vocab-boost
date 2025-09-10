import React from "react";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-2xl w-full text-center transform transition duration-500 hover:scale-[1.02]">
        {/* Header */}
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-transparent bg-clip-text mb-6">
          Bienvenue 🚀
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-700 text-lg mb-8 leading-relaxed">
          Ceci est une page <span className="font-semibold text-purple-600">hyper stylée</span>  
          construite avec <span className="underline decoration-pink-400">React</span> et <span className="text-blue-600">Tailwind CSS v4</span>.
        </p>

        {/* Call-to-action */}
        <div className="flex justify-center gap-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:-translate-y-1 hover:scale-105">
            ✨ Commencer
          </button>
          <button className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold py-3 px-8 rounded-full transition-transform transform hover:-translate-y-1 hover:scale-105">
            📖 En savoir plus
          </button>
        </div>

        {/* Decorative section */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-tr from-pink-100 to-pink-200 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-pink-700 mb-2">🔥 Rapide</h3>
            <p className="text-gray-600">Un rendu ultra rapide grâce à Vite + React 19.</p>
          </div>
          <div className="p-6 bg-gradient-to-tr from-purple-100 to-purple-200 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-purple-700 mb-2">🎨 Stylé</h3>
            <p className="text-gray-600">Un design moderne et fluide avec Tailwind v4.</p>
          </div>
          <div className="p-6 bg-gradient-to-tr from-blue-100 to-blue-200 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-blue-700 mb-2">⚡ Flexible</h3>
            <p className="text-gray-600">Facile à personnaliser pour tous tes projets.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
