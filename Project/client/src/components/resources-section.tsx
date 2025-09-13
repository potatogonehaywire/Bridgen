import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function ResourcesSection() {
  return (
    <section id="resources" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-arcade text-primary text-2xl md:text-4xl mb-6" data-testid="text-resources-title">LEARN AND EXPLORE</h2>
          <p className="text-xl text-muted-foreground">Your guide to getting the most out of Bridgen</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQs */}
          <div className="bg-card rounded-lg p-8 border-2 border-primary" data-testid="card-faqs">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">❓</div>
              <h3 className="font-arcade text-primary text-lg mb-4">FAQS</h3>
            </div>
            
            <div className="space-y-4">
              <div className="border-b border-border pb-4">
                <h4 className="text-foreground font-medium mb-2">How do I join a mentorship circle?</h4>
                <p className="text-sm text-muted-foreground">Click on Features, then Mentorship Circles, and browse available groups that match your interests.</p>
              </div>
              <div className="border-b border-border pb-4">
                <h4 className="text-foreground font-medium mb-2">Is Bridgen safe for seniors?</h4>
                <p className="text-sm text-muted-foreground">Yes! We have strict verification, moderation, and privacy controls to ensure a safe environment.</p>
              </div>
              <div>
                <h4 className="text-foreground font-medium mb-2">Can I use voice chat?</h4>
                <p className="text-sm text-muted-foreground">Absolutely! We support both text and voice messaging for comfortable communication.</p>
              </div>
            </div>
            
            <Button className="arcade-button w-full mt-6 bg-primary text-primary-foreground py-3 rounded-full font-arcade text-sm" data-testid="button-view-all-faqs">
              VIEW ALL FAQS
            </Button>
          </div>
          
          {/* Video Tutorials */}
          <div className="bg-card rounded-lg p-8 border-2 border-secondary" data-testid="card-video-tutorials">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎥</div>
              <h3 className="font-arcade text-secondary text-lg mb-4">VIDEO TUTORIALS</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-background rounded p-4 flex items-center space-x-3">
                <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
                  <Play className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <h4 className="text-foreground font-medium">Getting Started Guide</h4>
                  <p className="text-xs text-muted-foreground">5 minutes</p>
                </div>
              </div>
              
              <div className="bg-background rounded p-4 flex items-center space-x-3">
                <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
                  <Play className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <h4 className="text-foreground font-medium">Creating Your Profile</h4>
                  <p className="text-xs text-muted-foreground">3 minutes</p>
                </div>
              </div>
              
              <div className="bg-background rounded p-4 flex items-center space-x-3">
                <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
                  <Play className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <h4 className="text-foreground font-medium">Using Chat Features</h4>
                  <p className="text-xs text-muted-foreground">7 minutes</p>
                </div>
              </div>
            </div>
            
            <Button className="arcade-button w-full mt-6 bg-secondary text-secondary-foreground py-3 rounded-full font-arcade text-sm" data-testid="button-watch-tutorials">
              WATCH TUTORIALS
            </Button>
          </div>
          
          {/* Community Guidelines */}
          <div className="bg-card rounded-lg p-8 border-2 border-accent" data-testid="card-community-guidelines">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="font-arcade text-accent text-lg mb-4">COMMUNITY GUIDELINES</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-muted-foreground">Be respectful and kind to all community members</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-muted-foreground">Share knowledge and experiences openly</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-muted-foreground">Maintain privacy and confidentiality</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-muted-foreground">Report inappropriate behavior</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-muted-foreground">Have fun and learn together!</p>
              </div>
            </div>
            
            <Button className="arcade-button w-full mt-6 bg-accent text-accent-foreground py-3 rounded-full font-arcade text-sm" data-testid="button-read-guidelines">
              READ FULL GUIDELINES
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
