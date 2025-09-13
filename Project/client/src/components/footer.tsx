export default function Footer() {
  return (
    <footer className="bg-arcade-black text-foreground py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="font-arcade text-primary text-xl mb-4" data-testid="text-footer-logo">BRIDGEN</div>
            <p className="text-muted-foreground text-sm mb-4">Connecting generations through shared wisdom and learning.</p>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-pac-yellow rounded-full"></div>
              <div className="w-2 h-2 bg-pac-yellow rounded-full"></div>
              <div className="w-2 h-2 bg-pac-yellow rounded-full"></div>
              <div className="w-2 h-2 bg-pac-yellow rounded-full"></div>
              <div className="w-2 h-2 bg-pac-yellow rounded-full"></div>
            </div>
          </div>
          
          <div>
            <h3 className="font-arcade text-secondary text-sm mb-4">FEATURES</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="text-muted-foreground hover:text-secondary" data-testid="link-footer-mentorship">Mentorship Circles</a></li>
              <li><a href="#features" className="text-muted-foreground hover:text-secondary" data-testid="link-footer-skill-swaps">Skill Swaps</a></li>
              <li><a href="#features" className="text-muted-foreground hover:text-secondary" data-testid="link-footer-storytelling">Storytelling</a></li>
              <li><a href="#features" className="text-muted-foreground hover:text-secondary" data-testid="link-footer-workshops">Workshops</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-arcade text-accent text-sm mb-4">SUPPORT</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#resources" className="text-muted-foreground hover:text-accent" data-testid="link-footer-help">Help Center</a></li>
              <li><a href="#resources" className="text-muted-foreground hover:text-accent" data-testid="link-footer-tutorials">Video Tutorials</a></li>
              <li><a href="#resources" className="text-muted-foreground hover:text-accent" data-testid="link-footer-guidelines">Community Guidelines</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-accent" data-testid="link-footer-contact">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-arcade text-primary text-sm mb-4">LEGAL</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary" data-testid="link-footer-privacy">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary" data-testid="link-footer-terms">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary" data-testid="link-footer-cookies">Cookie Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary" data-testid="link-footer-accessibility">Accessibility</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground text-sm" data-testid="text-footer-copyright">
            © 2024 Bridgen. Made with ❤️ for connecting generations.
          </p>
          <div className="flex justify-center items-center mt-4 space-x-2">
            <span className="text-xs text-muted-foreground">Powered by</span>
            <div className="text-lg">🟡</div>
            <span className="text-xs text-muted-foreground">arcade nostalgia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
