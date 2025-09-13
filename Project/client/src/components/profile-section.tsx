import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";

export default function ProfileSection() {
  return (
    <section id="profile" className="py-20 bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-arcade text-primary text-2xl md:text-4xl mb-6" data-testid="text-profile-title">YOUR PROFILE</h2>
          <p className="text-xl text-muted-foreground">Customize your Bridgen experience</p>
        </div>
        
        <div className="bg-card rounded-lg p-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Picture & Avatar */}
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-primary rounded-full flex items-center justify-center text-6xl" data-testid="img-profile-avatar">
                👻
              {/* You can replace the '👻' with a user's profile picture or initials */}
              </div>
              <h3 className="font-arcade text-primary text-sm mb-4">CHOOSE AVATAR</h3>
              <div className="flex justify-center space-x-2 mb-6">
                <button className="w-12 h-12 bg-pac-yellow rounded-full flex items-center justify-center text-xl hover:glow" data-testid="button-avatar-pacman">🟡</button>
                <button className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-xl hover:glow" data-testid="button-avatar-ghost">👻</button>
                <button className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center text-xl hover:glow" data-testid="button-avatar-demon">👹</button>
                <button className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-xl hover:glow" data-testid="button-avatar-wizard">🧙</button>
              </div>
              <Button className="arcade-button bg-primary text-primary-foreground px-6 py-2 rounded-full font-arcade text-xs" data-testid="button-upload-photo">
                UPLOAD PHOTO
              </Button>
            </div>
            
            {/* Skills & Interests */}
            <div className="lg:col-span-2">
              <div className="grid gap-6">
                {/* Skills You Can Teach */}
                <div>
                  <h3 className="font-arcade text-secondary text-sm mb-3">SKILLS YOU CAN TEACH</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm" data-testid="tag-skill-cooking">Cooking</span>
                    <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm" data-testid="tag-skill-gardening">Gardening</span>
                    <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm" data-testid="tag-skill-history">History</span>
                    <button className="bg-background text-foreground px-3 py-1 rounded-full text-sm border border-border hover:border-secondary" data-testid="button-add-teach-skill">
                      <Plus className="w-3 h-3 mr-1 inline" />Add Skill
                    </button>
                  </div>
                </div>
                
                {/* Skills You're Learning */}
                <div>
                  <h3 className="font-arcade text-accent text-sm mb-3">SKILLS YOU'RE LEARNING</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm" data-testid="tag-learning-social-media">Social Media</span>
                    <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm" data-testid="tag-learning-photography">Photography</span>
                    <button className="bg-background text-foreground px-3 py-1 rounded-full text-sm border border-border hover:border-accent" data-testid="button-add-learning-skill">
                      <Plus className="w-3 h-3 mr-1 inline" />Add Interest
                    </button>
                  </div>
                </div>
                
                {/* Stories & Badges */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-arcade text-primary text-sm mb-3">STORIES SHARED</h3>
                    <div className="text-2xl font-bold text-primary" data-testid="text-stories-count">7</div>
                    <p className="text-sm text-muted-foreground">Total stories published</p>
                  </div>
                  <div>
                    <h3 className="font-arcade text-destructive text-sm mb-3">BADGES EARNED</h3>
                    <div className="flex space-x-2" data-testid="container-badges">
                      <div className="text-2xl" title="First Story">🍒</div>
                      <div className="text-2xl" title="Helpful Mentor">🍓</div>
                      <div className="text-2xl" title="Active Learner">🍊</div>
                      <div className="text-2xl" title="Community Builder">🍎</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="arcade-button w-full mt-8 bg-primary text-primary-foreground py-3 rounded-full font-arcade text-sm" data-testid="button-edit-profile">
                <Edit className="w-4 h-4 mr-2" />
                EDIT PROFILE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
