import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import WhatsNewSection from "@/components/whats-new-section";
import FeaturesSection from "@/components/features-section";
import ChatSection from "@/components/chat-section";
import ResourcesSection from "@/components/resources-section";
import ProfileSection from "@/components/profile-section";
import SkillMatchingSection from "@/components/skill-matching-section";
import DownloadSection from "@/components/download-section";
import FollowUsSection from "@/components/follow-us-section";
import GetStartedSection from "@/components/get-started-section";
import Footer from "@/components/footer";
import { useQuery } from "@tanstack/react-query";

// Type for the API response from /api/auth/me
type AuthUser = { 
  id: string; 
  username: string; 
  email: string; 
  first_name: string; 
  last_name: string; 
  age: number; 
  bio: string; 
  profile_image_url: string; 
  points: number; 
  level: number; 
};

export default function Home() {
  // Get current user for MatchMeSection
  const { data: auth } = useQuery<AuthUser>({
    queryKey: ["/api/auth/me"],
  });

  // Map AuthUser to UserProfile format expected by MatchMeSection
  const currentUser = auth ? {
    id: auth.id,
    username: auth.username,
    skills: ["Teaching", "Technology", "Communication"],
    availability: ["Weekends", "Evenings"],
    metadata: { points: auth.points, level: auth.level }
  } : {
    id: "demo-user",
    username: "DemoUser",
    skills: ["Teaching", "Technology", "Communication"],
    availability: ["Weekends", "Evenings"],
    metadata: {}
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />
      <HeroSection />
      <WhatsNewSection />
      <FeaturesSection />
      <ChatSection />
      <ResourcesSection />
      <ProfileSection />
      <SkillMatchingSection currentUserId={auth?.id || "user2"} />
      <DownloadSection />
      <FollowUsSection />
      <GetStartedSection />
      <Footer />
    </div>
  );
}
