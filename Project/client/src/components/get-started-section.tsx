import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

export default function GetStartedSection() {
  return (
    <section id="get-started" className="py-20 bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-arcade text-primary text-2xl md:text-4xl mb-6" data-testid="text-get-started-title">START YOUR JOURNEY</h2>
        <p className="text-xl text-muted-foreground mb-12">Follow Pac-Man through your Bridgen adventure</p>
        
        {/* Interactive Onboarding Maze */}
        <div className="bg-card rounded-lg p-8 maze-pattern" data-testid="container-onboarding-maze">
          <div className="relative">
            {/* Maze Path */}
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl mb-2" data-testid="step-start">🟡</div>
                <p className="text-sm text-primary font-arcade">START</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pac-yellow rounded-full"></div>
                <div className="w-3 h-3 bg-pac-yellow rounded-full"></div>
                <div className="w-3 h-3 bg-pac-yellow rounded-full"></div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-xl mb-2" data-testid="step-join-circle">👥</div>
                <p className="text-xs text-secondary font-arcade">JOIN CIRCLE</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pac-yellow rounded-full"></div>
                <div className="w-3 h-3 bg-pac-yellow rounded-full"></div>
                <div className="w-3 h-3 bg-pac-yellow rounded-full"></div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-xl mb-2" data-testid="step-skill-swap">🔄</div>
                <p className="text-xs text-accent font-arcade">SKILL SWAP</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pac-yellow rounded-full"></div>
                <div className="w-3 h-3 bg-pac-yellow rounded-full"></div>
                <div className="w-3 h-3 bg-pac-yellow rounded-full"></div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center text-xl mb-2" data-testid="step-success">🏆</div>
                <p className="text-xs text-destructive font-arcade">SUCCESS!</p>
              </div>
            </div>
            
            {/* Steps Description */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <h4 className="font-arcade text-secondary text-sm mb-2">STEP 1: JOIN A CIRCLE</h4>
                <p className="text-sm text-muted-foreground">Find a mentorship group that matches your interests</p>
              </div>
              <div className="text-center">
                <h4 className="font-arcade text-accent text-sm mb-2">STEP 2: TRY A SKILL SWAP</h4>
                <p className="text-sm text-muted-foreground">Share your knowledge and learn something new</p>
              </div>
              <div className="text-center">
                <h4 className="font-arcade text-destructive text-sm mb-2">STEP 3: CELEBRATE SUCCESS</h4>
                <p className="text-sm text-muted-foreground">Earn badges and make meaningful connections</p>
              </div>
            </div>
          </div>
          
          <Button className="arcade-button bg-primary text-primary-foreground px-12 py-6 rounded-full font-arcade text-lg hover:glow" data-testid="button-begin-adventure">
            <Rocket className="w-5 h-5 mr-3" />
            BEGIN ADVENTURE
          </Button>
        </div>
      </div>
    </section>
  );
}
