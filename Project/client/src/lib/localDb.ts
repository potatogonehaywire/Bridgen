// Local Storage Database for Demo Purposes
// This replaces the need for a backend API and authentication

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  age: number;
  bio: string;
  profile_image_url: string;
  points: number;
  level: number;
  email: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  proficiency_level: number;
  want_to_teach: boolean;
  want_to_learn: boolean;
  years_experience: number;
  skill: Skill; // Always populated
}

export interface SkillMatch {
  user: User;
  skill: Skill;
  match_percentage: number;
  match_type: "teacher" | "student";
  teacher_experience?: number;
}

class LocalDatabase {
  private getStorageKey(table: string): string {
    return `bridges_demo_${table}`;
  }

  private getFromStorage<T>(table: string): T[] {
    const data = localStorage.getItem(this.getStorageKey(table));
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage<T>(table: string, data: T[]): void {
    localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Initialize demo data
  initializeData(): void {
    // Check if already initialized
    if (localStorage.getItem(this.getStorageKey('initialized'))) {
      return;
    }

    // Demo users
    const users: User[] = [
      {
        id: "user1",
        username: "ElderWise",
        first_name: "Margaret",
        last_name: "Johnson",
        age: 72,
        bio: "Retired teacher with 40 years of experience. Love sharing knowledge!",
        profile_image_url: "https://avatar.iran.liara.run/public/girl?username=margaret",
        points: 350,
        level: 5,
        email: "margaret@example.com"
      },
      {
        id: "user2",
        username: "DemoUser",
        first_name: "Demo",
        last_name: "User",
        age: 25,
        bio: "This is a demo profile. Add skills and explore the features!",
        profile_image_url: "https://avatar.iran.liara.run/public/boy?username=demo",
        points: 150,
        level: 3,
        email: "demo@example.com"
      },
      {
        id: "user3",
        username: "TechYouth",
        first_name: "Alex",
        last_name: "Chen",
        age: 19,
        bio: "Computer science student eager to learn from experienced professionals.",
        profile_image_url: "https://avatar.iran.liara.run/public/boy?username=alex",
        points: 200,
        level: 2,
        email: "alex@example.com"
      }
    ];

    // Demo skills
    const skills: Skill[] = [
      // Technology
      { id: "skill1", name: "JavaScript", category: "Technology", description: "Programming language for web development", icon: "code" },
      { id: "skill2", name: "Python", category: "Technology", description: "Versatile programming language", icon: "code" },
      { id: "skill3", name: "React", category: "Technology", description: "Frontend JavaScript library", icon: "code" },
      { id: "skill4", name: "Node.js", category: "Technology", description: "JavaScript runtime for backend", icon: "code" },
      
      // Arts & Crafts
      { id: "skill5", name: "Painting", category: "Arts & Crafts", description: "Creating art with paints", icon: "palette" },
      { id: "skill6", name: "Knitting", category: "Arts & Crafts", description: "Creating fabric by interlocking loops", icon: "scissors" },
      { id: "skill7", name: "Photography", category: "Arts & Crafts", description: "Capturing moments through images", icon: "camera" },
      
      // Life Skills
      { id: "skill8", name: "Cooking", category: "Life Skills", description: "Preparing delicious meals", icon: "chef-hat" },
      { id: "skill9", name: "Gardening", category: "Life Skills", description: "Growing plants and vegetables", icon: "flower" },
      { id: "skill10", name: "Financial Planning", category: "Life Skills", description: "Managing money and investments", icon: "dollar-sign" },
      
      // Music
      { id: "skill11", name: "Piano", category: "Music", description: "Playing the piano", icon: "music" },
      { id: "skill12", name: "Guitar", category: "Music", description: "Playing acoustic and electric guitar", icon: "music" },
      { id: "skill13", name: "Singing", category: "Music", description: "Vocal performance and technique", icon: "music" },
      
      // Languages
      { id: "skill14", name: "Spanish", category: "Languages", description: "Speaking and writing in Spanish", icon: "globe" },
      { id: "skill15", name: "French", category: "Languages", description: "Speaking and writing in French", icon: "globe" },
      { id: "skill16", name: "German", category: "Languages", description: "Speaking and writing in German", icon: "globe" },
    ];

    // Demo user skills
    const userSkills: UserSkill[] = [
      // User2 (Demo User) skills
      { id: "us1", userId: "user2", skillId: "skill1", proficiency_level: 6, want_to_teach: false, want_to_learn: true, years_experience: 2 },
      { id: "us2", userId: "user2", skillId: "skill8", proficiency_level: 4, want_to_teach: true, want_to_learn: false, years_experience: 5 },
      
      // User1 (Elder) skills
      { id: "us3", userId: "user1", skillId: "skill8", proficiency_level: 9, want_to_teach: true, want_to_learn: false, years_experience: 35 },
      { id: "us4", userId: "user1", skillId: "skill6", proficiency_level: 8, want_to_teach: true, want_to_learn: false, years_experience: 25 },
      { id: "us5", userId: "user1", skillId: "skill11", proficiency_level: 7, want_to_teach: true, want_to_learn: false, years_experience: 15 },
      
      // User3 (Youth) skills
      { id: "us6", userId: "user3", skillId: "skill1", proficiency_level: 8, want_to_teach: true, want_to_learn: false, years_experience: 3 },
      { id: "us7", userId: "user3", skillId: "skill2", proficiency_level: 7, want_to_teach: false, want_to_learn: true, years_experience: 2 },
      { id: "us8", userId: "user3", skillId: "skill8", proficiency_level: 2, want_to_teach: false, want_to_learn: true, years_experience: 0 },
    ];

    // Save all data
    this.saveToStorage('users', users);
    this.saveToStorage('skills', skills);
    this.saveToStorage('userSkills', userSkills);
    localStorage.setItem(this.getStorageKey('initialized'), 'true');
  }

  // User methods
  getUser(id: string): User | null {
    const users = this.getFromStorage<User>('users');
    return users.find(u => u.id === id) || null;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getFromStorage<User>('users');
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    users[userIndex] = { ...users[userIndex], ...updates };
    this.saveToStorage('users', users);
    return users[userIndex];
  }

  // Skill methods
  getAllSkills(): Skill[] {
    return this.getFromStorage<Skill>('skills');
  }

  getSkill(id: string): Skill | null {
    const skills = this.getAllSkills();
    return skills.find(s => s.id === id) || null;
  }

  // User skill methods
  getUserSkills(userId: string): UserSkill[] {
    const userSkills = this.getFromStorage<UserSkill>('userSkills');
    const skills = this.getAllSkills();
    
    return userSkills
      .filter(us => us.userId === userId)
      .map(us => ({
        ...us,
        skill: skills.find(s => s.id === us.skillId)!
      }))
      .filter(us => us.skill); // Only return skills that exist
  }

  addUserSkill(userId: string, skillData: Omit<UserSkill, 'id' | 'userId' | 'skill'>): UserSkill {
    const userSkills = this.getFromStorage<UserSkill>('userSkills');
    const skill = this.getSkill(skillData.skillId);
    
    if (!skill) throw new Error("Skill not found");
    
    const newUserSkill: UserSkill = {
      id: this.generateId(),
      userId,
      ...skillData,
      skill
    };

    userSkills.push(newUserSkill);
    this.saveToStorage('userSkills', userSkills);
    return newUserSkill;
  }

  removeUserSkill(userId: string, userSkillId: string): boolean {
    const userSkills = this.getFromStorage<UserSkill>('userSkills');
    const filteredSkills = userSkills.filter(us => !(us.id === userSkillId && us.userId === userId));
    
    if (filteredSkills.length < userSkills.length) {
      this.saveToStorage('userSkills', filteredSkills);
      return true;
    }
    return false;
  }

  // Skill matching
  getSkillMatches(userId: string): SkillMatch[] {
    const currentUserSkills = this.getUserSkills(userId);
    const allUsers = this.getFromStorage<User>('users');
    const allUserSkills = this.getFromStorage<UserSkill>('userSkills');
    const allSkills = this.getAllSkills();
    
    const matches: SkillMatch[] = [];

    currentUserSkills.forEach(currentSkill => {
      // Find users who can teach what we want to learn
      if (currentSkill.want_to_learn) {
        const teachers = allUserSkills.filter(us => 
          us.userId !== userId && 
          us.skillId === currentSkill.skillId && 
          us.want_to_teach &&
          us.proficiency_level > currentSkill.proficiency_level
        );

        teachers.forEach(teacherSkill => {
          const teacher = allUsers.find(u => u.id === teacherSkill.userId);
          const skill = allSkills.find(s => s.id === teacherSkill.skillId);
          
          if (teacher && skill) {
            matches.push({
              user: teacher,
              skill,
              match_percentage: Math.min(95, 60 + (teacherSkill.proficiency_level - currentSkill.proficiency_level) * 5),
              match_type: "teacher",
              teacher_experience: teacherSkill.years_experience
            });
          }
        });
      }

      // Find users who want to learn what we can teach
      if (currentSkill.want_to_teach) {
        const students = allUserSkills.filter(us => 
          us.userId !== userId && 
          us.skillId === currentSkill.skillId && 
          us.want_to_learn &&
          us.proficiency_level < currentSkill.proficiency_level
        );

        students.forEach(studentSkill => {
          const student = allUsers.find(u => u.id === studentSkill.userId);
          const skill = allSkills.find(s => s.id === studentSkill.skillId);
          
          if (student && skill) {
            matches.push({
              user: student,
              skill,
              match_percentage: Math.min(95, 50 + (currentSkill.proficiency_level - studentSkill.proficiency_level) * 6),
              match_type: "student"
            });
          }
        });
      }
    });

    return matches.sort((a, b) => b.match_percentage - a.match_percentage);
  }

  // Gamification
  addPoints(userId: string, points: number): void {
    const user = this.getUser(userId);
    if (user) {
      const newPoints = user.points + points;
      const newLevel = Math.floor(newPoints / 100) + 1;
      this.updateUser(userId, { points: newPoints, level: newLevel });
    }
  }
}

// Export singleton instance
export const localDb = new LocalDatabase();

// Initialize on import
localDb.initializeData();
