import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

export default function FollowUsSection() {
  return (
    <section id="follow-us" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-arcade text-primary text-2xl md:text-4xl mb-6" data-testid="text-follow-us-title">STAY CONNECTED</h2>
          <p className="text-xl text-muted-foreground">Join our growing community across all platforms</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Social Media */}
          <div className="text-center">
            <h3 className="font-arcade text-secondary text-lg mb-6">FOLLOW US</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button className="arcade-button bg-card text-foreground p-6 rounded-lg border-2 border-secondary hover:glow" data-testid="button-social-facebook">
                <div className="text-center">
                  <div className="text-3xl mb-2">📘</div>
                  <span className="text-sm">Facebook</span>
                </div>
              </Button>
              <Button className="arcade-button bg-card text-foreground p-6 rounded-lg border-2 border-secondary hover:glow" data-testid="button-social-twitter">
                <div className="text-center">
                  <div className="text-3xl mb-2">🐦</div>
                  <span className="text-sm">Twitter</span>
                </div>
              </Button>
              <Button className="arcade-button bg-card text-foreground p-6 rounded-lg border-2 border-secondary hover:glow" data-testid="button-social-instagram">
                <div className="text-center">
                  <div className="text-3xl mb-2">📷</div>
                  <span className="text-sm">Instagram</span>
                </div>
              </Button>
              <Button className="arcade-button bg-card text-foreground p-6 rounded-lg border-2 border-secondary hover:glow" data-testid="button-social-youtube">
                <div className="text-center">
                  <div className="text-3xl mb-2">📺</div>
                  <span className="text-sm">YouTube</span>
                </div>
              </Button>
            </div>
          </div>
          
          {/* Newsletter */}
          <div className="text-center">
            <h3 className="font-arcade text-accent text-lg mb-6">NEWSLETTER</h3>
            <div className="bg-card rounded-lg p-6" data-testid="card-newsletter">
              <div className="text-4xl mb-4">📧</div>
              <p className="text-muted-foreground mb-6">Get weekly updates, success stories, and tips</p>
              <div className="space-y-4">
                <Input 
                  type="email" 
                  placeholder="your.email@example.com" 
                  className="w-full p-3 rounded bg-background border border-border text-foreground text-lg focus:border-accent"
                  data-testid="input-newsletter-email"
                />
                <Button className="arcade-button w-full bg-accent text-accent-foreground py-3 rounded-full font-arcade text-sm" data-testid="button-newsletter-subscribe">
                  <Mail className="w-4 h-4 mr-2" />
                  SUBSCRIBE
                </Button>
              </div>
            </div>
          </div>
          
          {/* Community Stats */}
          <div className="text-center">
            <h3 className="font-arcade text-primary text-lg mb-6">COMMUNITY IMPACT</h3>
            <div className="bg-card rounded-lg p-6 space-y-6" data-testid="card-community-stats">
              <div>
                <div className="text-3xl font-bold text-primary mb-1" data-testid="text-stat-mentorship-hours">15,847</div>
                <p className="text-sm text-muted-foreground">Mentorship Hours</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary mb-1" data-testid="text-stat-stories-shared">3,291</div>
                <p className="text-sm text-muted-foreground">Stories Shared</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-1" data-testid="text-stat-projects-started">892</div>
                <p className="text-sm text-muted-foreground">Projects Started</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-destructive mb-1" data-testid="text-stat-countries-connected">47</div>
                <p className="text-sm text-muted-foreground">Countries Connected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
