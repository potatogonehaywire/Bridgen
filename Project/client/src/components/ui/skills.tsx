import { useState } from "react";

//  Raw skill list for dropdowns
export const skills = [
  "Gardening", "Cooking", "Baking", "Reading", "Writing", "Drawing", "Painting", "Sculpting",
  "Music (Playing Instrument)", "Singing", "Dancing", "Photography", "Videography", "Coding",
  "Web Development", "Mobile App Development", "Game Development", "Academics (General)",
  "History", "Science", "Mathematics", "Literature", "Foreign Languages", "Tutoring", "Mentoring",
  "Sports (Team)", "Sports (Individual)", "Yoga", "Meditation", "Hiking", "Camping", "Fishing",
  "Board Games", "Card Games", "Puzzles", "Knitting", "Crocheting", "Sewing", "Woodworking",
  "Pottery", "Calligraphy", "Graphic Design", "Animation", "Creative Writing", "Poetry",
  "Volunteering", "Community Service", "First Aid", "CPR", "Animal Care", "Event Planning",
  "Public Speaking", "Storytelling", "Astronomy", "Bird Watching", "Genealogy", "Home Improvement",
  "Car Repair", "Financial Literacy", "Investing",
];

// Structured skill entry for profile
export interface SkillEntry {
  name: string;
  proficiency: number; // 1–5
  yearsExperience: number;
  wantsToTeach: boolean;
  wantsToLearn: boolean;
}

export function useSkills() {
  const [skillEntries, setSkillEntries] = useState<SkillEntry[]>([]);

  const addSkill = (entry: SkillEntry) => {
    setSkillEntries((prev) => {
      const exists = prev.find((s) => s.name === entry.name);
      return exists
        ? prev.map((s) => (s.name === entry.name ? entry : s))
        : [...prev, entry];
    });
  };

  const removeSkill = (skillName: string) => {
    setSkillEntries((prev) => prev.filter((s) => s.name !== skillName));
  };

  return {
    skills,
    skillEntries,
    addSkill,
    removeSkill,
  };
}
