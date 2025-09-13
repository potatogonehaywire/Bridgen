import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import FeaturesSection from "@/components/features-section";

export default function Features() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-16">
        <FeaturesSection />
      </div>
      <Footer />
    </div>
  );
}
