import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Feature {
  title: string;
  description: string;
  content: string;
}

const featureData: Feature[] = [
  {
    "title": "Mentorship Circles",
    "description": "Guided small-group learning experiences where knowledge flows both ways.",
    "content": "Join intimate groups led by experienced mentors and peers. Share your expertise while learning from others in a collaborative, supportive environment."
  },
  {
    "title": "Skill Swaps",
    "description": "Teach what you know, learn what you don’t in our peer-to-peer exchanges.",
    "content": "Offer your skills to others and receive training in return. A flexible, community-driven way to grow your abilities while helping others grow theirs."
  },
  {
    "title": "Storytelling",
    "description": "A library of wisdom and personal experiences shared across generations.",
    "content": "Contribute your life stories, lessons, and insights to inspire and educate. Explore narratives from diverse backgrounds to broaden your perspective."
  },
  {
    "title": "Collaborative Projects",
    "description": "Join forces on creative and practical tasks that bridge generations.",
    "content": "Work together on meaningful initiatives — from art and design to problem-solving challenges — that combine the strengths of different age groups."
  },
  {
    "title": "Workshops",
    "description": "Structured, interactive events designed for collaborative learning.",
    "content": "Participate in hands-on sessions led by experts. Gain practical skills, exchange ideas, and leave with actionable knowledge you can apply immediately."
  },
  {
    "title": "Social Spaces",
    "description": "Safe, casual conversations in our welcoming community rooms.",
    "content": "Relax and connect with others in a friendly, inclusive setting. Build relationships, share interests, and enjoy open dialogue without pressure."
  },
];

const FeatureCard = ({ feature }: { feature: Feature }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Card >
        <DialogTrigger asChild>
          <Button variant="ghost" className="p-0 w-full h-full justify-start text-left">
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Button>
        </DialogTrigger>
      </Card>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{feature.title}</DialogTitle>
          <DialogDescription>
            {feature.content}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};


const Features = () => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {featureData.map((feature, index) => (
        <FeatureCard key={index} feature={feature} />
      ))}
    </div>
  );
};

export default Features;