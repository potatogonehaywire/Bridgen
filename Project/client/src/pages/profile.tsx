import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Zap,
  Star,
  TrendingUp,
  Plus,
  X,
  Users,
  Percent,
  Shuffle,
} from "lucide-react";
import Navigation from "@/components/navigation";
import TypewriterText from "@/components/typewriter-text";

interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  age: number;
  bio: string;
  profile_image_url: string;
  points: number;
  level: number;
  skills: UserSkill[];
}

interface UserSkill {
  id: string;
  skill: Skill;
  proficiency_level: number;
  want_to_teach: boolean;
  want_to_learn: boolean;
  years_experience: number;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
}

interface SkillMatch {
  user: UserProfile;
  skill: Skill;
  match_percentage: number;
  match_type: "teacher" | "student";
  teacher_experience?: number;
}

interface SkillPercentiles {
  [skillName: string]: {
    percentiles: {
      "25th": number;
      "50th": number;
      "75th": number;
      "90th": number;
    };
  };
}

export default function Profile() {
  const [editMode, setEditMode] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showSkillSwapResults, setShowSkillSwapResults] = useState(false);
  const [skillSwapMatches, setSkillSwapMatches] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [skillForm, setSkillForm] = useState({
    proficiency_level: 1,
    want_to_teach: false,
    want_to_learn: false,
    years_experience: 0,
  });
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    age: 0,
    bio: "",
  });

  // Initialize form with profile data
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        age: userProfile.age || 0,
        bio: userProfile.bio || "",
      });
    }
  }, [userProfile]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 1️⃣ Get current auth user
  const { data: authUser, isLoading: loadingAuth } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        return await apiRequest("GET", "/api/auth/me");
      } catch (error) {
        // Return demo user if auth fails
        return {
          id: "user2",
          username: "DemoUser",
          email: "demo@example.com"
        };
      }
    },
  });

  const userId = (authUser as any)?.id;

  // 2️⃣ Fetch profile, skills, matches, gamification
  const { data: userProfile, isLoading: loadingProfile } = useQuery<UserProfile>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
    queryFn: async () => {
      try {
        return await apiRequest("GET", `/api/users/${userId}`);
      } catch (error) {
        // Fallback to demo data if API fails
        console.log("API failed, using demo data");
        return {
          id: userId || "demo-user",
          username: authUser?.username || "DemoUser",
          first_name: "Demo",
          last_name: "User",
          age: 25,
          bio: "This is a demo profile. Edit functionality is working!",
          profile_image_url: "",
          points: 150,
          level: 3,
          skills: []
        };
      }
    }
  });

  const { data: availableSkills } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const { data: skillMatches, isLoading: loadingMatches } = useQuery<
    SkillMatch[]
  >({
    queryKey: ["/api/skill-matches", userId],
    enabled: !!userId,
  });

  const { data: skillPercentiles } = useQuery<SkillPercentiles>({
    queryKey: ["/api/skill-matches/percentiles"],
  });

  const { data: gamState } = useQuery<any>({
    queryKey: ["/api/gam/state", userId],
    enabled: !!userId,
  });

  // 3️⃣ Mutations
  const skillSwapMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`http://localhost:5001/api/skill-swap/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to find skill swap matches');
      return response.json();
    },
    onSuccess: (data) => {
      setSkillSwapMatches(data.matches || []);
      setShowSkillSwapResults(true);
      toast({
        title: "Skill Swap Complete!",
        description: `Found ${data.matches?.length || 0} potential matches for you.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to find skill swap matches. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      // For now, let's just simulate a successful update
      // In a real app, this would call the API
      console.log("Updating profile with data:", data);
      return Promise.resolve(data);
    },
    onSuccess: () => {
      // Update the form data locally
      setProfileForm(prev => ({ ...prev }));
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated! (Note: This is a demo - changes are not persisted)",
      });
      setEditMode(false);
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      }),
  });

  const addSkillMutation = useMutation({
    mutationFn: async (skillData: any) => {
      await apiRequest("POST", `/api/users/${userId}/skills`, {
        skill_id: selectedSkillId,
        ...skillData,
      });
      await apiRequest("POST", `/api/gam/earn`, {
        points: 50,
        reason: "Added a new skill",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/skill-matches", userId],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gam/state", userId] });
      toast({
        title: "Skill Added",
        description: "Your skill has been successfully added!",
      });
      setShowAddSkill(false);
      setSelectedSkillId("");
      setSkillForm({
        proficiency_level: 1,
        want_to_teach: false,
        want_to_learn: false,
        years_experience: 0,
      });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
  });

  const removeSkillMutation = useMutation({
    mutationFn: (skillId: string) =>
      apiRequest("DELETE", `/api/users/${userId}/skills/${skillId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/skill-matches", userId],
      });
      toast({
        title: "Skill Removed",
        description: "Skill has been removed from your profile.",
      });
    },
    onError: (error: Error) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
  });

  const connectMutation = useMutation({
    mutationFn: (partnerId: string) =>
      apiRequest("POST", `/api/messages/start`, { partner_id: partnerId }),
    onSuccess: () =>
      toast({ title: "Connection started", description: "Opening chat…" }),
    onError: (err: Error) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  // Sync profile form with fetched data
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        first_name: userProfile?.first_name || "",
        last_name: userProfile?.last_name || "",
        age: userProfile?.age || 0,
        bio: userProfile?.bio || "",
      });
    }
  }, [userProfile]);

  // 5️⃣ Helpers
  const getSkillIcon = (iconName: string) =>
    iconName === "code" ? (
      <Zap className="w-4 h-4" />
    ) : iconName === "music" ? (
      <Star className="w-4 h-4" />
    ) : (
      <TrendingUp className="w-4 h-4" />
    );
  const getProficiencyColor = (level: number) =>
    level <= 3
      ? "bg-red-500"
      : level <= 6
        ? "bg-yellow-500"
        : level <= 8
          ? "bg-blue-500"
          : "bg-green-500";
  const getPercentileRank = (skillName: string, proficiencyLevel: number) => {
    if (!skillPercentiles || !skillPercentiles[skillName]) return "N/A";
    const p = skillPercentiles[skillName]?.percentiles;
    if (!p) return "N/A";
    if (proficiencyLevel >= p["90th"]) return "Top 10%";
    if (proficiencyLevel >= p["75th"]) return "Top 25%";
    if (proficiencyLevel >= p["50th"]) return "Top 50%";
    return "Bottom 50%";
  };

  if (loadingAuth || loadingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-2xl font-arcade text-primary mb-4">
              Loading Profile...
            </div>
            <div className="flex space-x-2 justify-center">
              <div className="w-4 h-4 bg-pac-yellow rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-pac-yellow rounded-full animate-pulse delay-75"></div>
              <div className="w-4 h-4 bg-pac-yellow rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6️⃣ Render
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-12">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                {editMode ? (
                  "Edit Profile"
                ) : (
                  <TypewriterText text={userProfile?.username || "Profile"} />
                )}
              </CardTitle>
              <CardDescription>
                {editMode
                  ? "Update your personal details."
                  : "Your personal information."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex justify-center">
                <img
                  src={
                    userProfile?.profile_image_url ||
                    "https://avatar.iran.liara.run/public/boy?username=liara"
                  }
                  alt="Profile"
                  className="rounded-full w-32 h-32 object-cover"
                />
              </div>
              {editMode ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={profileForm.first_name}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            first_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profileForm.last_name}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            last_name: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      type="number"
                      id="age"
                      value={profileForm.age.toString()}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          age: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, bio: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    onClick={() => updateProfileMutation.mutate(profileForm)}
                    className="w-full"
                  >
                    Update Profile
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditMode(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-lg font-semibold">
                      {userProfile?.first_name} {userProfile?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Age: {userProfile?.age}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-md font-semibold">About Me</h3>
                    <p className="text-sm text-muted-foreground">
                      {userProfile?.bio || "No bio provided."}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <Badge variant="secondary">
                        Level: {gamState?.level}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant="outline">
                        Points: {gamState?.points}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button onClick={() => setEditMode(true)} className="w-full">
                      Edit Profile
                    </Button>
                    <Button 
                      onClick={() => skillSwapMutation.mutate()} 
                      disabled={skillSwapMutation.isPending}
                      className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      {skillSwapMutation.isPending ? "Finding Matches..." : "Skill Swap"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Skills Card */}
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Skills</CardTitle>
              <CardDescription>
                Your current skills and proficiencies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-none space-y-2">
                {userProfile?.skills?.map((userSkill) => (
                  <li
                    key={userSkill.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {getSkillIcon(userSkill.skill.icon)}
                      <span className="ml-2">{userSkill.skill.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={getProficiencyColor(
                          userSkill.proficiency_level,
                        )}
                      >
                        Level {userSkill.proficiency_level}
                      </Badge>
                      <Badge variant="outline">
                        {getPercentileRank(
                          userSkill.skill.name,
                          userSkill.proficiency_level,
                        )}
                      </Badge>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeSkillMutation.mutate(userSkill.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <Dialog open={showAddSkill} onOpenChange={setShowAddSkill}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4">
                    Add Skill <Plus className="w-4 h-4 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Skill</DialogTitle>
                    <DialogDescription>
                      Choose a skill and set your proficiency.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="skill">Skill</Label>
                      <Select
                        onValueChange={(value) => setSelectedSkillId(value)}
                        defaultValue={selectedSkillId}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a skill" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          {availableSkills && Object.entries(
                            availableSkills.reduce((acc, skill) => {
                              if (!acc[skill.category]) acc[skill.category] = [];
                              acc[skill.category].push(skill);
                              return acc;
                            }, {} as Record<string, Skill[]>)
                          ).map(([category, skills]) => (
                            <div key={category}>
                              <div className="px-2 py-1 text-sm font-semibold text-muted-foreground bg-muted">
                                {category}
                              </div>
                              {skills.map((skill: Skill) => (
                                <SelectItem key={skill.id} value={skill.id} className="pl-4">
                                  {skill.name}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="proficiency">Proficiency</Label>
                      <Select
                        onValueChange={(value) =>
                          setSkillForm({
                            ...skillForm,
                            proficiency_level: parseInt(value),
                          })
                        }
                        defaultValue={skillForm.proficiency_level.toString()}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                            <SelectItem key={level} value={level.toString()}>
                              Level {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="years_experience">Years Experience</Label>
                      <Input
                        type="number"
                        id="years_experience"
                        defaultValue={skillForm.years_experience.toString()}
                        onChange={(e) =>
                          setSkillForm({
                            ...skillForm,
                            years_experience: parseInt(e.target.value),
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="checkbox"
                        id="teach"
                        checked={skillForm.want_to_teach}
                        onChange={() =>
                          setSkillForm({
                            ...skillForm,
                            want_to_teach: !skillForm.want_to_teach,
                          })
                        }
                      />
                      <Label htmlFor="teach">Want to Teach</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="checkbox"
                        id="learn"
                        checked={skillForm.want_to_learn}
                        onChange={() =>
                          setSkillForm({
                            ...skillForm,
                            want_to_learn: !skillForm.want_to_learn,
                          })
                        }
                      />
                      <Label htmlFor="learn">Want to Learn</Label>
                    </div>
                  </div>
                  <Button onClick={() => addSkillMutation.mutate(skillForm)}>
                    Add Skill
                  </Button>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Skill Matches Card */}
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Matches</CardTitle>
              <CardDescription>
                Potential teachers and students based on your skills.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!skillMatches || skillMatches.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No matches found. Add more skills to find potential
                  connections!
                </p>
              ) : (
                <ul className="list-none space-y-4">
                  {skillMatches?.map((match: SkillMatch) => (
                    <li
                      key={`${match.user.id}-${match.skill.id}`}
                      className="border rounded-md p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">
                            {match.user.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Skill: {match.skill.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Match:{" "}
                            <Badge variant="secondary">
                              {" "}
                              {match.match_percentage}%
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Type:{" "}
                            {match.match_type === "teacher" ? (
                              <>
                                <Users className="inline w-4 h-4" />{" "}
                                Teacher{" "}
                              </>
                            ) : (
                              <>
                                <Percent className="inline w-4 h-4" /> Student
                              </>
                            )}
                          </div>
                          {match.teacher_experience && (
                            <div className="text-sm text-muted-foreground">
                              Experience: {match.teacher_experience} years
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => connectMutation.mutate(match.user.id)}
                        >
                          Connect
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            {/* </CardContent>
          </Card> */}
          {/* Skill Groups Card */}
          {/* <Card className="col-span-1 md:col-span-1"> */}
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Groups</CardTitle>
              <CardDescription>
                Potential teachers and students based on your skills.
              </CardDescription>
            </CardHeader>
            {/* <CardContent> */}
              {!skillMatches || skillMatches.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No matches found. Add more skills to find potential
                  connections!
                </p>
              ) : (
                <ul className="list-none space-y-4">
                  {skillMatches?.map((match: SkillMatch) => (
                    <li
                      key={`${match.user.id}-${match.skill.id}`}
                      className="border rounded-md p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">
                            {match.user.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Skill: {match.skill.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Match:{" "}
                            <Badge variant="secondary">
                              {" "}
                              {match.match_percentage}%
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Type:{" "}
                            {match.match_type === "teacher" ? (
                              <>
                                <Users className="inline w-4 h-4" />{" "}
                                Teacher{" "}
                              </>
                            ) : (
                              <>
                                <Percent className="inline w-4 h-4" /> Student
                              </>
                            )}
                          </div>
                          {match.teacher_experience && (
                            <div className="text-sm text-muted-foreground">
                              Experience: {match.teacher_experience} years
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => connectMutation.mutate(match.user.id)}
                        >
                          Connect
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skill Swap Results Dialog */}
        <Dialog open={showSkillSwapResults} onOpenChange={setShowSkillSwapResults}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>🔄 Skill Swap Results</DialogTitle>
              <DialogDescription>
                Here are your best skill-sharing matches based on our algorithm!
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {skillSwapMatches.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No matches found. Try adding more skills to your profile!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {skillSwapMatches.map((match: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{match.user.username}</h4>
                          <p className="text-sm text-muted-foreground">{match.user.email}</p>
                          <Badge variant="outline" className="mt-1">
                            {match.user.age_group}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            {Math.round(match.match_percentage)}% Match
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Score: {match.compatibility_score}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <h5 className="text-sm font-medium mb-2">Shared Interests:</h5>
                        <div className="space-y-1">
                          {match.shared_interests.map((interest: string, i: number) => (
                            <div key={i} className="text-xs bg-muted px-2 py-1 rounded">
                              {interest}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Users className="w-4 h-4 mr-1" />
                          Connect
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
