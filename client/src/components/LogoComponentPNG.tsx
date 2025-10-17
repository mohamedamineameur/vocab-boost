export default function VocabBoostLogoPNG({ size = "medium" }: { size?: "small" | "medium" | "large" }) {
  const sizeClasses = {
    small: "h-8 sm:h-10",
    medium: "h-10 sm:h-12 md:h-14",
    large: "h-14 sm:h-16 md:h-20"
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Logo PNG responsive */}
      <img
        src="/vocab-boost-logo.png"
        alt="Vocab Boost Logo"
        className={`${sizeClasses[size]} w-auto object-contain drop-shadow-lg`}
        loading="eager"
      />
    </div>
  );
}

