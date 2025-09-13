import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
  cursorStyle?: 'blink' | 'pulse' | 'solid';
  retroSound?: boolean;
  speed?: number;
}

export default function TypewriterText({ 
  text, 
  delay = 100, 
  speed,
  className = "",
  onComplete,
  showCursor = true,
  cursorStyle = 'blink',
  retroSound = false
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursorChar, setShowCursorChar] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const effectiveDelay = speed || delay;

  // Cursor blinking effect
  useEffect(() => {
    if (!showCursor || isComplete) return;

    const interval = setInterval(() => {
      setShowCursorChar(prev => !prev);
    }, cursorStyle === 'blink' ? 530 : cursorStyle === 'pulse' ? 300 : 1000);

    return () => clearInterval(interval);
  }, [showCursor, cursorStyle, isComplete]);

  // Typewriter effect
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        // Retro typing sound effect (visual feedback)
        if (retroSound && text[currentIndex] !== ' ') {
          const flash = document.createElement('div');
          flash.style.position = 'fixed';
          flash.style.top = '0';
          flash.style.left = '0';
          flash.style.width = '100%';
          flash.style.height = '100%';
          flash.style.backgroundColor = 'rgba(255, 255, 0, 0.05)';
          flash.style.pointerEvents = 'none';
          flash.style.zIndex = '9999';
          document.body.appendChild(flash);
          setTimeout(() => flash.remove(), 30);
        }
      }, effectiveDelay + Math.random() * 20); // Add slight variation

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      if (onComplete) {
        setTimeout(onComplete, 500);
      }
    }
  }, [currentIndex, text, effectiveDelay, onComplete, isComplete, retroSound]);

  // Reset when text changes
  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  const getCursorClass = () => {
    if (!showCursor) return '';
    
    switch (cursorStyle) {
      case 'blink':
        return showCursorChar ? 'opacity-100' : 'opacity-0';
      case 'pulse':
        return 'animate-pulse';
      case 'solid':
        return 'opacity-100';
      default:
        return showCursorChar ? 'opacity-100' : 'opacity-0';
    }
  };

  const getCursorCharacter = () => {
    if (isComplete && cursorStyle !== 'solid') return '';
    return '|';
  };

  return (
    <span className={`inline-block relative ${className}`} data-testid="typewriter-text">
      <span className="font-arcade">
        {displayText}
      </span>
      {showCursor && (
        <span 
          className={`font-arcade text-pac-yellow transition-opacity duration-100 ${getCursorClass()}`}
          style={{ 
            textShadow: '0 0 10px rgba(255, 255, 0, 0.8)',
          }}
        >
          {getCursorCharacter()}
        </span>
      )}
      
      {/* Character typing effect */}
      {retroSound && !isComplete && currentIndex < text.length && (
        <span className="absolute -inset-1 bg-pac-yellow opacity-10 blur-sm animate-ping" />
      )}
    </span>
  );
}