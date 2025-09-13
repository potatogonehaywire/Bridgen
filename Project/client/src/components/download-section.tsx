import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

export default function DownloadSection() {
  return (
    <section id="download" className="py-20 bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-arcade text-primary text-2xl md:text-4xl mb-6" data-testid="text-download-title">GET BRIDGEN ANYWHERE</h2>
        <p className="text-xl text-muted-foreground mb-12">Access your intergenerational community on any device</p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Mobile Apps */}
          <div className="bg-card rounded-lg p-8" data-testid="card-mobile-apps">
            <div className="text-5xl mb-4">📱</div>
            <h3 className="font-arcade text-secondary text-sm mb-4">MOBILE APP</h3>
            <p className="text-muted-foreground mb-6">Chat on the go with our mobile app</p>
            <div className="space-y-3">
              <Button className="arcade-button w-full bg-secondary text-secondary-foreground py-3 rounded-full font-arcade text-sm" data-testid="button-download-ios">
                🍎 iOS APP
              </Button>
              <Button className="arcade-button w-full bg-secondary text-secondary-foreground py-3 rounded-full font-arcade text-sm" data-testid="button-download-android">
                🤖 ANDROID APP
              </Button>
            </div>
          </div>
          
          {/* Desktop Apps */}
          <div className="bg-card rounded-lg p-8" data-testid="card-desktop-apps">
            <div className="text-5xl mb-4">💻</div>
            <h3 className="font-arcade text-primary text-sm mb-4">DESKTOP APP</h3>
            <p className="text-muted-foreground mb-6">Full featured experience for your computer</p>
            <div className="space-y-3">
              <Button className="arcade-button w-full bg-primary text-primary-foreground py-3 rounded-full font-arcade text-sm" data-testid="button-download-windows">
                🪟 WINDOWS
              </Button>
              <Button className="arcade-button w-full bg-primary text-primary-foreground py-3 rounded-full font-arcade text-sm" data-testid="button-download-mac">
                🍎 MAC OS
              </Button>
            </div>
          </div>
          
          {/* PDF Guide */}
          <div className="bg-card rounded-lg p-8" data-testid="card-pdf-guide">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="font-arcade text-accent text-sm mb-4">STARTER GUIDE</h3>
            <p className="text-muted-foreground mb-6">Printable guide for easy reference</p>
            <div className="space-y-3">
              <Button className="arcade-button w-full bg-accent text-accent-foreground py-3 rounded-full font-arcade text-sm" data-testid="button-download-pdf">
                <Download className="w-4 h-4 mr-2" />
                DOWNLOAD PDF
              </Button>
              <Button variant="outline" className="arcade-button w-full bg-background text-foreground py-3 rounded-full text-sm border border-border hover:border-accent" data-testid="button-print-guide">
                <Printer className="w-4 h-4 mr-2" />
                PRINT VERSION
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
