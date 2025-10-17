export default function VocabBoostLogo({ size = 72 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Icône cercle + livre + fusée */}
      <div
        className="flex items-center justify-center rounded-full shadow-md shrink-0"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #3B82F6, #22C55E)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="white"
        >
          {/* Livre simplifié */}
          <path d="M4 4h7v16H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm16 0h-7v16h7a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z" />
          {/* Fusée stylisée */}
          <path d="M12 8c1.5-1.5 4-1.5 5.5 0s1.5 4 0 5.5c-.5.5-1 .9-1.5 1.1l-.5 2.4-1.9-.8c-.6.1-1.2.1-1.8-.1-1.5-1.5-1.5-4 0-5.6z" />
        </svg>
      </div>

      {/* Texte responsive et mobile-first */}
      <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-wide text-white drop-shadow-lg whitespace-nowrap">
        Vocab<span className="text-[#22C55E]">Boost</span>
      </span>
    </div>
  );
}
