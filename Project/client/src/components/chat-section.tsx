import { Button } from "@/components/ui/button";
import { MessageSquare, TextSelection } from "lucide-react";

export default function ChatSection() {
  return (
    <section id="chat" className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-arcade text-primary text-2xl md:text-4xl mb-6" data-testid="text-chat-title">TALK AND CONNECT</h2>
          <p className="text-xl text-muted-foreground">Choose your conversation style</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coffee Rooms */}
          <div className="bg-card rounded-lg p-8 border-2 border-accent hover:glow transition-all" data-testid="card-coffee-rooms">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">☕</div>
              <h3 className="font-arcade text-accent text-sm mb-2">COFFEE ROOMS</h3>
              <p className="text-muted-foreground text-lg">Casual friendly chats about daily life</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-background rounded">
                <div className="w-8 h-8 bg-pac-yellow rounded-full flex items-center justify-center text-sm">👻</div>
                <div>
                  <p className="text-sm font-medium">Morning Coffee Chat</p>
                  <p className="text-xs text-muted-foreground">12 active</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-background rounded">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-sm">👻</div>
                <div>
                  <p className="text-sm font-medium">Weekend Plans</p>
                  <p className="text-xs text-muted-foreground">8 active</p>
                </div>
              </div>
            </div>
            
            <Button className="arcade-button w-full mt-6 bg-accent text-accent-foreground py-3 rounded-full font-arcade text-sm" data-testid="button-join-coffee-chat">
              JOIN CHAT
            </Button>
          </div>
          
          {/* Mentorship Rooms */}
          <div className="bg-card rounded-lg p-8 border-2 border-primary hover:glow transition-all" data-testid="card-mentorship-rooms">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="font-arcade text-primary text-sm mb-2">MENTORSHIP ROOMS</h3>
              <p className="text-muted-foreground text-lg">Focused discussions on skills and topics</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-background rounded">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm">🎓</div>
                <div>
                  <p className="text-sm font-medium">Technology Help</p>
                  <p className="text-xs text-muted-foreground">15 active</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-background rounded">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm">🎨</div>
                <div>
                  <p className="text-sm font-medium">Creative Arts</p>
                  <p className="text-xs text-muted-foreground">9 active</p>
                </div>
              </div>
            </div>
            
            <Button className="arcade-button w-full mt-6 bg-primary text-primary-foreground py-3 rounded-full font-arcade text-sm" data-testid="button-join-mentorship-room">
              JOIN ROOM
            </Button>
          </div>
          
          {/* Private Messaging */}
          <div className="bg-card rounded-lg p-8 border-2 border-secondary hover:glow transition-all" data-testid="card-private-messaging">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">💌</div>
              <h3 className="font-arcade text-secondary text-sm mb-2">PRIVATE MESSAGING</h3>
              <p className="text-muted-foreground text-lg">Simple, secure one-on-one conversations</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-background rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-sm">👤</div>
                  <div>
                    <p className="text-sm font-medium">Recent Messages</p>
                    <p className="text-xs text-muted-foreground">3 unread</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
              </div>
              
              <div className="text-center">
                <Button variant="outline" className="arcade-button text-sm bg-background text-foreground px-4 py-2 rounded border border-border hover:border-secondary" data-testid="button-enlarge-text">
                  <TextSelection className="w-4 h-4 mr-2" />
                  Enlarge Text
                </Button>
              </div>
            </div>
            
            <Button className="arcade-button w-full mt-6 bg-secondary text-secondary-foreground py-3 rounded-full font-arcade text-sm" data-testid="button-open-messages">
              OPEN MESSAGES
            </Button>
          </div>
        </div>
        
        {/* Topic Tags */}
        <div className="mt-12 text-center">
          <h3 className="font-arcade text-foreground text-lg mb-6">POPULAR TOPICS</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium" data-testid="tag-technology">#Technology</span>
            <span className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium" data-testid="tag-cooking">#Cooking</span>
            <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium" data-testid="tag-gardening">#Gardening</span>
            <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-medium" data-testid="tag-history">#History</span>
            <span className="bg-muted text-muted-foreground px-4 py-2 rounded-full text-sm font-medium" data-testid="tag-music">#Music</span>
          </div>
        </div>
      </div>
    </section>
  );
}
