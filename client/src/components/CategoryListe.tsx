interface CategoryAttributes {
  id: string;
  name: string;
  description?: string;
  frTranslation?: string;
  esTranslation?: string;
  arTranslation?: string;
}

const colors = [
  "from-pink-500 to-red-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-purple-500 to-indigo-500",
  "from-yellow-500 to-orange-500",
  "from-teal-500 to-lime-500",
];

interface CategoryListProps {
  categories: CategoryAttributes[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 px-4">
      {categories.map((cat, index) => {
        const color = colors[index % colors.length]; // 🔁 couleur cyclique
        return (
          <div
            key={cat.id || index}
            className={`p-5 rounded-2xl shadow-lg bg-gradient-to-br ${color} text-white`}
          >
            <h2 className="text-xl font-bold mb-2">{cat.name}</h2>
            {cat.description && (
              <p className="text-sm mb-3 opacity-90">{cat.description}</p>
            )}

            <div className="space-y-1 text-sm">
              {cat.frTranslation && (
                <p>🇫🇷 <span className="font-medium">{cat.frTranslation}</span></p>
              )}
              {cat.esTranslation && (
                <p>🇪🇸 <span className="font-medium">{cat.esTranslation}</span></p>
              )}
              {cat.arTranslation && (
                <p>🇸🇦 <span className="font-medium">{cat.arTranslation}</span></p>
              )}
            </div>

          
          </div>
        );
      })}
    </div>
  );
}
