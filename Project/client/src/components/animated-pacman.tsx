import { useState, useEffect, useRef } from "react";

interface AnimatedPacmanProps {
  size?: number;
  speed?: number;
  className?: string;
  withDots?: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  autoMove?: boolean;
}

export default function AnimatedPacman({ 
  size = 70, 
  speed = 3, 
  className = "", 
  withDots = false,
  direction = 'right',
  autoMove = false 
}: AnimatedPacmanProps) {
  const [mouthOpen, setMouthOpen] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dots, setDots] = useState<{x: number, y: number, eaten: boolean}[]>([]);
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize dots if enabled
  useEffect(() => {
    if (withDots && containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const dotSpacing = 40;
      const newDots = [];

      for (let x = dotSpacing; x < containerWidth - size; x += dotSpacing) {
        for (let y = dotSpacing; y < containerHeight - size; y += dotSpacing) {
          newDots.push({ x, y, eaten: false });
        }
      }
      setDots(newDots);
    }
  }, [withDots, size]);

  // Mouth animation
  useEffect(() => {
    const interval = setInterval(() => {
      setMouthOpen(prev => !prev);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Auto movement
  useEffect(() => {
    if (!autoMove || !containerRef.current) return;

    const interval = setInterval(() => {
      setPosition(prev => {
        const container = containerRef.current;
        if (!container) return prev;

        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        let newX = prev.x;
        let newY = prev.y;

        switch (direction) {
          case 'right':
            newX = prev.x + speed;
            if (newX > containerWidth - size) newX = -size;
            break;
          case 'left':
            newX = prev.x - speed;
            if (newX < -size) newX = containerWidth;
            break;
          case 'up':
            newY = prev.y - speed;
            if (newY < -size) newY = containerHeight;
            break;
          case 'down':
            newY = prev.y + speed;
            if (newY > containerHeight - size) newY = -size;
            break;
        }

        return { x: newX, y: newY };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [autoMove, direction, speed, size]);

  // Check dot collisions
  useEffect(() => {
    if (!withDots) return;

    setDots(prevDots => 
      prevDots.map(dot => {
        if (dot.eaten) return dot;
        
        const distance = Math.sqrt(
          Math.pow(dot.x - position.x, 2) + Math.pow(dot.y - position.y, 2)
        );
        
        if (distance < size / 2) {
          setScore(prev => prev + 10);
          return { ...dot, eaten: true };
        }
        
        return dot;
      })
    );
  }, [position, withDots, size]);

  const getRotation = () => {
    switch (direction) {
      case 'left': return 'rotate(180deg)';
      case 'up': return 'rotate(-90deg)';
      case 'down': return 'rotate(90deg)';
      default: return 'rotate(0deg)';
    }
  };

  const getClipPath = () => {
    if (!mouthOpen) return 'none';
    
    switch (direction) {
      case 'left':
        return 'polygon(0% 74%, 56% 48%, 0% 21%, 0% 0%, 100% 0%, 100% 100%, 0% 100%)';
      case 'up':
        return 'polygon(74% 0%, 48% 56%, 21% 0%, 0% 0%, 0% 100%, 100% 100%, 100% 0%)';
      case 'down':
        return 'polygon(74% 100%, 48% 44%, 21% 100%, 0% 100%, 0% 0%, 100% 0%, 100% 100%)';
      default:
        return 'polygon(100% 74%, 44% 48%, 100% 21%, 100% 0%, 0% 0%, 0% 100%, 100% 100%)';
    }
  };

  if (withDots) {
    return (
      <div ref={containerRef} className={`relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden ${className}`} data-testid="pacman-game">
        {/* Score */}
        <div className="absolute top-4 left-4 text-pac-yellow font-arcade text-sm z-10">
          SCORE: {score}
        </div>
        
        {/* Dots */}
        {dots.map((dot, index) => (
          !dot.eaten && (
            <div
              key={index}
              className="absolute w-2 h-2 bg-pac-yellow rounded-full animate-pulse"
              style={{
                left: dot.x,
                top: dot.y,
              }}
            />
          )
        ))}
        
        {/* Pac-Man */}
        <div
          className="absolute transition-all duration-75 ease-linear"
          style={{
            left: position.x,
            top: position.y,
            width: size,
            height: size,
            transform: getRotation(),
          }}
          data-testid="animated-pacman"
        >
          <div
            className="absolute inset-0 bg-pac-yellow rounded-full transition-all duration-150"
            style={{
              clipPath: getClipPath()
            }}
          />
          {/* Eye */}
          <div 
            className="absolute bg-black rounded-full"
            style={{
              width: size * 0.12,
              height: size * 0.12,
              top: size * 0.25,
              left: size * 0.35
            }}
          />
          {/* Power pellet glow effect */}
          {mouthOpen && (
            <div 
              className="absolute inset-0 bg-pac-yellow rounded-full animate-ping opacity-20"
              style={{ animationDuration: '0.3s' }}
            />
          )}
        </div>
        
        {/* Game over message */}
        {dots.every(dot => dot.eaten) && dots.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="text-center text-pac-yellow font-arcade">
              <div className="text-2xl mb-2">LEVEL COMPLETE!</div>
              <div className="text-lg">Final Score: {score}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      data-testid="animated-pacman"
    >
      <div
        className="absolute inset-0 bg-pac-yellow rounded-full transition-all duration-150"
        style={{
          clipPath: getClipPath(),
          transform: getRotation(),
        }}
      />
      {/* Eye */}
      <div 
        className="absolute bg-black rounded-full"
        style={{
          width: size * 0.12,
          height: size * 0.12,
          top: size * 0.25,
          left: direction === 'left' ? size * 0.53 : size * 0.35,
          transform: getRotation(),
        }}
      />
      {/* Power glow effect */}
      {mouthOpen && (
        <div 
          className="absolute inset-0 bg-pac-yellow rounded-full animate-ping opacity-30"
          style={{ animationDuration: '0.5s' }}
        />
      )}
    </div>
  );
}