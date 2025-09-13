import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Users, Target, Star, MessageCircle } from "lucide-react";

interface SkillMatch {
  teacherId: string;
  learnerId: string;
  skillId: string;
  skillName: string;
  compatibilityScore: number;
  teacherProficiency: number;
  learnerInterest: number;
  teacherExperience: number;
}

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

interface SkillMatchingSectionProps {
  currentUserId: string;
}

export default function SkillMatchingSection({ currentUserId }: SkillMatchingSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get skill matches for current user
  const { data: matches = [], isLoading } = useQuery<SkillMatch[]>({
    queryKey: [`/api/skill-matches/${currentUserId}`],
    enabled: !!currentUserId,
  });

  // Create match request mutation
  const createMatchMutation = useMutation({
    mutationFn: async (match: { teacherId: string; learnerId: string; skillId: string }) => {
      const response = await fetch('/api/skill-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(match),
      });
      if (!response.ok) throw new Error('Failed to create match');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Match Request Sent!",
        description: "We'll notify you when the other person responds.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/skill-matches/${currentUserId}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send match request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRequestMatch = (match: SkillMatch) => {
    createMatchMutation.mutate({
      teacherId: match.teacherId,
      learnerId: match.learnerId,
      skillId: match.skillId,
    });
  };

  if (!currentUserId) {
    return (
      <section id="skill-matching" className="py-20 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-arcade text-primary text-2xl md:text-4xl mb-6">SKILL MATCHING</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create a profile to discover skill-sharing opportunities!
          </p>
          <Button 
            onClick={() => window.location.href = '/profile'}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-arcade text-lg"
          >
            <Users className="w-5 h-5 mr-2" />
            CREATE PROFILE
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="skill-matching" className="py-20 bg-muted">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-arcade text-primary text-2xl md:text-4xl mb-6">SKILL MATCHING</h2>
          <p className="text-xl text-muted-foreground">
            Connect with others to teach and learn new skills
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-lg text-muted-foreground">Finding your perfect skill matches...</div>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">No matches found yet</h3>
            <p className="text-muted-foreground mb-6">
              Add skills to your profile to find learning and teaching opportunities!
            </p>
            <Button 
              onClick={() => window.location.href = '/profile'}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full"
            >
              Update Profile
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {matches.slice(0, 6).map((match, index) => (
                <Card key={`${match.teacherId}-${match.learnerId}-${match.skillId}`} className="bg-card hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{match.skillName}</span>
                      <Badge variant="secondary" className="ml-2">
                        {Math.round(match.compatibilityScore)}% match
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {match.teacherId === currentUserId 
                        ? "Someone wants to learn from you!"
                        : "Found a potential teacher!"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Teacher Level:
                        </span>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < match.teacherProficiency / 2 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>Experience:</span>
                        <span className="font-medium">{match.teacherExperience} years</span>
                      </div>
                      
                      <Button 
                        onClick={() => handleRequestMatch(match)}
                        disabled={createMatchMutation.isPending}
                        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {match.teacherId === currentUserId ? "Accept Student" : "Request Teacher"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {matches.length > 6 && (
              <div className="text-center">
                <Button variant="outline" className="px-8">
                  View All {matches.length} Matches
                </Button>
              </div>
            )}
          </>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-card rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Ready to start learning?</h3>
          <p className="text-muted-foreground mb-6">
            Join our community of learners and teachers sharing knowledge across generations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/profile'}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full"
            >
              <Users className="w-4 h-4 mr-2" />
              Update My Skills
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/chat'}
              className="px-6 py-3 rounded-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Join Community Chat
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
