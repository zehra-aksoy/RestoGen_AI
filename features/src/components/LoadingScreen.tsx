"use client";

import { useEffect, useState } from "react";

const QUOTES = [
  "Tabağındaki son lokma, dünyadaki bir açın hakkıdır.",
  "Gıdayı korumak; toprağı, suyu ve geleceği korumaktır.",
  "Dünyada üretilen gıdanın 1/3'ü hiç yenmiyor. Bugün bunu beraber değiştirelim!",
  "Mutfakta tasarruf, bereketin en büyük anahtarıdır.",
  "Sıfır atık, şefin en büyük sanatıdır.",
];

export function LoadingScreen({ isLoading }: { isLoading: boolean }) {
  const [quote, setQuote] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      setVisible(true);
    } else {
      // Small delay to allow fade out animation to play
      const timer = setTimeout(() => {
        setVisible(false);
      }, 500); // matches transition duration
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // If we are not loading and fade out is complete, remove from DOM
  if (!visible && !isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md transition-opacity duration-500 ease-in-out ${
        isLoading ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center max-w-xl text-center p-8">
        {/* Minimal emerald green animation */}
        <div className="relative flex items-center justify-center mb-8 w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-sage/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-sage border-t-transparent animate-spin"></div>
          <div className="w-6 h-6 bg-sage rounded-full animate-pulse shadow-lg shadow-sage/50"></div>
        </div>

        {/* Random Quote */}
        <p className="text-2xl md:text-3xl font-medium text-ink tracking-tight leading-relaxed mb-6">
          &ldquo;{quote}&rdquo;
        </p>

        {/* Subtext */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sage animate-ping"></div>
          <p className="text-sm text-ink-muted italic tracking-wide">
            Şef, veriler analiz edilirken dünyayı kurtarıyoruz...
          </p>
        </div>
      </div>
    </div>
  );
}
