import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  words?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  words = ['Nexus Tech', 'Nexus VCF', 'Nexus Projects'],
  typingSpeed = 120,
  deletingSpeed = 60,
  pauseTime = 1800,
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex % words.length];

    let timer: NodeJS.Timeout;

    if (!isDeleting && currentText.length < currentWord.length) {
      // Typing forward letter by letter
      timer = setTimeout(() => {
        setCurrentText(currentWord.slice(0, currentText.length + 1));
      }, typingSpeed);
    } else if (!isDeleting && currentText.length === currentWord.length) {
      // Pause after completing full word
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);
    } else if (isDeleting && currentText.length > 0) {
      // Deleting letter by letter
      timer = setTimeout(() => {
        setCurrentText(currentWord.slice(0, currentText.length - 1));
      }, deletingSpeed);
    } else if (isDeleting && currentText.length === 0) {
      // Switch to next word
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <div className="inline-flex items-center px-4 py-1.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 shadow-purple-glow font-mono font-black text-lg sm:text-2xl tracking-wider">
      <span className="gradient-text drop-shadow-md">{currentText}</span>
      <span className="w-0.5 h-6 sm:h-7 bg-cyan-400 ml-1 inline-block animate-pulse shadow-cyan-glow"></span>
    </div>
  );
};
