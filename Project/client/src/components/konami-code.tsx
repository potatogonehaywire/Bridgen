import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
];

export default function KonamiCode() {
  const [sequence, setSequence] = useState<string[]>([]);
  const [activated, setActivated] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setSequence(prev => {
        const newSequence = [...prev, event.code].slice(-10);
        
        if (newSequence.length === KONAMI_CODE.length) {
          const isMatch = newSequence.every((key, index) => key === KONAMI_CODE[index]);
          if (isMatch) {
            setActivated(true);
            setTimeout(() => setActivated(false), 5000);
            // Play retro sound effect (simulate with console for now)
            console.log('🎵 KONAMI CODE ACTIVATED! 🎵');
            return [];
          }
        }
        
        return newSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!activated) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Confetti
        width={width}
        height={height}
        numberOfPieces={200}
        recycle={false}
        colors={['#FFFF00', '#0066FF', '#FF6600', '#FF0066']}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-arcade text-2xl animate-bounce">
          🎮 KONAMI CODE ACTIVATED! 🎮
        </div>
      </div>
    </div>
  );
}