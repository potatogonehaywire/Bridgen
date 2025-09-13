import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function AccessibilityToggle() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  const toggleAccessibility = () => {
    setIsHighContrast(!isHighContrast);
    document.body.classList.toggle('high-contrast');
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={toggleAccessibility}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-arcade text-xs hover:glow transition-all"
        data-testid="button-accessibility-toggle"
      >
        {isHighContrast ? (
          <>
            <EyeOff className="w-4 h-4 mr-2" />
            Normal View
          </>
        ) : (
          <>
            <Eye className="w-4 h-4 mr-2" />
            Clear View
          </>
        )}
      </Button>
    </div>
  );
}
