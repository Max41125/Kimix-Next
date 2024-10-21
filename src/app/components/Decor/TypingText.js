import React, { useState, useEffect } from 'react';

const TypingText = ({ words, className }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(200); // Скорость анимации

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[currentWordIndex];
      if (isDeleting) {
        setDisplayedText((prev) => prev.slice(0, -1));
        setSpeed(100);
      } else {
        setDisplayedText((prev) => currentWord.slice(0, prev.length + 1));
        setSpeed(200);
      }

      if (!isDeleting && displayedText === currentWord) {
        setTimeout(() => setIsDeleting(true), 1000); // Задержка перед удалением
      } else if (isDeleting && displayedText === '') {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length); // Переход к следующему слову
      }
    };

    const timer = setTimeout(handleTyping, speed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentWordIndex, words, speed]);

  return (
    <span className={className}>
      {displayedText}
      <span className="blinking-cursor">|</span>
    </span>
  );
};

export default TypingText;
