import { Button } from "@/components/ui/button";
import { Play, Users } from "lucide-react";
import { Link } from "wouter";
import AnimatedPacman from "./animated-pacman";
import KonamiCode from "./konami-code";
import TypewriterText from "./typewriter-text";

export default function HeroSection() {
  return (
    <section id="home" className="relative bg-arcade-black min-h-screen flex items-center justify-center overflow-hidden">
      <KonamiCode />
      
      {/* Animated Pac-Man */}
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 pacman-move z-10">
        <AnimatedPacman size={80} />
      </div>
      
      {/* Dot Trail - positioned along pac man's path */}
      <div className="absolute top-1/2 left-20 transform -translate-y-1/2 z-0">
        <div className="w-4 h-4 bg-pac-yellow rounded-full dot-trail glow-dot" style={{animationDelay: '3s'}}></div>
      </div>
      <div className="absolute top-1/2 left-40 transform -translate-y-1/2 z-0">
        <div className="w-4 h-4 bg-ghost-orange rounded-full dot-trail glow-dot" style={{animationDelay: '4s'}}></div>
      </div>
      <div className="absolute top-1/2 left-60 transform -translate-y-1/2 z-0">
        <div className="w-4 h-4 bg-cherry-red rounded-full dot-trail glow-dot" style={{animationDelay: '5s'}}></div>
      </div>
      <div className="absolute top-1/2 left-80 transform -translate-y-1/2 z-0">
        <div className="w-4 h-4 bg-arcade-blue rounded-full dot-trail glow-dot" style={{animationDelay: '6s'}}></div>
      </div>
      <div className="absolute top-1/2 left-96 transform -translate-y-1/2 z-0">
        <div className="w-5 h-5 bg-pac-yellow rounded-full dot-trail power-pellet" style={{animationDelay: '7s'}}></div>
      </div>
      
      <div className="relative z-20 text-center max-w-4xl mx-auto px-4">
        <h1 className="font-arcade text-primary text-2xl md:text-4xl lg:text-6xl mb-8 leading-tight" data-testid="text-hero-title">
          CONNECTING GENERATIONS
        </h1>
        <h2 className="font-arcade text-secondary text-lg md:text-2xl lg:text-3xl mb-8" data-testid="text-hero-subtitle">
          <TypewriterText text="One Life Lesson at a Time" delay={150} />
        </h2>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto" data-testid="text-hero-description">
          Bridgen is a digital community where seniors and teens (14+) share wisdom, exchange skills, and grow together through mentorship, storytelling, and collaborative learning.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/gamification">
            <Button className="arcade-button bg-primary text-primary-foreground px-12 py-6 rounded-full font-arcade text-lg hover:glow" data-testid="button-get-started">
              <Play className="w-5 h-5 mr-3" />
              GET STARTED
            </Button>
          </Link>
          <Link href="/chat">
            <Button className="arcade-button bg-secondary text-secondary-foreground px-12 py-6 rounded-full font-arcade text-lg hover:glow" data-testid="button-follow-us">
              <Users className="w-5 h-5 mr-3" />
              JOIN CHAT
            </Button>
          </Link>
        </div>
        
        {/* Spotlight Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Link href="/features">
            <div className="bg-card border-2 border-primary rounded-lg p-6 text-center hover:glow transition-all arcade-button cursor-pointer" data-testid="card-mentorship-circles">
              <div className="text-4xl mb-4 pixel-sparkle">👥</div>
              <h3 className="font-arcade text-primary text-sm mb-2">MENTORSHIP CIRCLES</h3>
              <p className="text-muted-foreground text-lg">Guided small-group learning experiences</p>
            </div>
          </Link>
          <Link href="/features">
            <div className="bg-card border-2 border-secondary rounded-lg p-6 text-center hover:glow transition-all arcade-button cursor-pointer" data-testid="card-skill-swaps">
              <div className="text-4xl mb-4 pixel-sparkle">🔄</div>
              <h3 className="font-arcade text-secondary text-sm mb-2">SKILL SWAPS</h3>
              <p className="text-muted-foreground text-lg">Teach what you know, learn what you don't</p>
            </div>
          </Link>
          <Link href="/features">
            <div className="bg-card border-2 border-accent rounded-lg p-6 text-center hover:glow transition-all arcade-button cursor-pointer" data-testid="card-storytelling">
              <div className="text-4xl mb-4 pixel-sparkle">📚</div>
              <h3 className="font-arcade text-accent text-sm mb-2">STORYTELLING</h3>
              <p className="text-muted-foreground text-lg">A library of wisdom and experiences</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
