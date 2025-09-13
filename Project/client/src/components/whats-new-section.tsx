import { Button } from "@/components/ui/button";

export default function WhatsNewSection() {
  return (
    <section id="whats-new" className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-arcade text-primary text-2xl md:text-4xl mb-6" data-testid="text-whats-new-title">WHAT'S NEW</h2>
          <p className="text-xl text-muted-foreground">Stay updated with the latest from our community</p>
        </div>
        
        {/* Game Level Map Style */}
        <div className="relative maze-pattern rounded-lg p-8">
          <div className="grid gap-6">
            {/* Date Filters */}
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <Button className="arcade-button bg-primary text-primary-foreground px-6 py-3 rounded-full font-arcade text-sm" data-testid="button-filter-today">
                TODAY
              </Button>
              <Button className="arcade-button bg-card text-foreground px-6 py-3 rounded-full font-arcade text-sm border border-border" data-testid="button-filter-week">
                THIS WEEK
              </Button>
              <Button className="arcade-button bg-card text-foreground px-6 py-3 rounded-full font-arcade text-sm border border-border" data-testid="button-filter-month">
                THIS MONTH
              </Button>
            </div>
            
            {/* News Items */}
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 border-l-4 border-primary" data-testid="card-news-success">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-arcade text-primary text-sm mb-2">🎉 SUCCESS STORY</h3>
                    <p className="text-lg text-foreground mb-2">Congratulations to Mary & Jordan for completing their art project!</p>
                    <p className="text-muted-foreground">2 hours ago</p>
                  </div>
                  <div className="text-2xl">🏆</div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-6 border-l-4 border-secondary" data-testid="card-news-workshop">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-arcade text-secondary text-sm mb-2">🚀 NEW WORKSHOP</h3>
                    <p className="text-lg text-foreground mb-2">Digital Photography Basics - Join this Thursday at 3 PM</p>
                    <p className="text-muted-foreground">1 day ago</p>
                  </div>
                  <div className="text-2xl">📸</div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-6 border-l-4 border-accent" data-testid="card-news-feature">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-arcade text-accent text-sm mb-2">✨ NEW FEATURE</h3>
                    <p className="text-lg text-foreground mb-2">Introducing Voice Messages in Chat Rooms</p>
                    <p className="text-muted-foreground">3 days ago</p>
                  </div>
                  <div className="text-2xl">🎙️</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
