import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

// Use SQLite for local development
const sqlite = new Database(':memory:'); // In-memory database for demo
export const db = drizzle(sqlite, { schema });

// Initialize tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 1,
    badges TEXT DEFAULT '[]',
    skills TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS skill_matches (
    id TEXT PRIMARY KEY,
    requester_id TEXT,
    skill TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    room_id TEXT,
    user_id TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_skills (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    skill_id TEXT,
    proficiency_level INTEGER DEFAULT 1,
    want_to_teach BOOLEAN DEFAULT FALSE,
    want_to_learn BOOLEAN DEFAULT FALSE,
    years_experience INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Insert sample users with detailed profiles
  INSERT OR IGNORE INTO users (id, username, email, level, xp, streak, badges, skills) VALUES
  ('user1', 'Alice_Teacher', 'alice@example.com', 4, 2500, 7, '["First Steps", "Mentor"]', '["Math", "Science"]'),
  ('user2', 'Bob_Student', 'bob@example.com', 3, 1800, 3, '["Learning Path"]', '["Technology", "Art"]'),
  ('user3', 'Charlie_Expert', 'charlie@example.com', 5, 3200, 12, '["Streak Master", "Helping Hand"]', '["Language", "History"]'),
  ('user4', 'Diana_Learner', 'diana@example.com', 2, 850, 4, '["Welcome Badge"]', '["Cooking", "Gardening"]'),
  ('user5', 'Edward_Mentor', 'edward@example.com', 6, 4100, 15, '["Master Teacher", "Community Leader"]', '["Programming", "Mentoring"]');

  -- Insert complete skill list
  INSERT OR IGNORE INTO skills (id, name, category, description) VALUES
  -- Lifestyle & Home
  ('skill1', 'Gardening', 'Lifestyle', 'Growing plants and vegetables'),
  ('skill2', 'Cooking', 'Lifestyle', 'Culinary arts and techniques'),
  ('skill3', 'Baking', 'Lifestyle', 'Baking breads, cakes, and pastries'),
  ('skill4', 'Home Improvement', 'Lifestyle', 'DIY home repairs and improvements'),
  ('skill5', 'Car Repair', 'Lifestyle', 'Vehicle maintenance and repair'),
  
  -- Arts & Creative
  ('skill6', 'Reading', 'Arts', 'Reading and book appreciation'),
  ('skill7', 'Writing', 'Arts', 'Creative and technical writing'),
  ('skill8', 'Drawing', 'Arts', 'Artistic drawing and sketching'),
  ('skill9', 'Painting', 'Arts', 'Painting with various mediums'),
  ('skill10', 'Sculpting', 'Arts', 'Three-dimensional art creation'),
  ('skill11', 'Music (Playing Instrument)', 'Arts', 'Playing musical instruments'),
  ('skill12', 'Singing', 'Arts', 'Vocal performance and techniques'),
  ('skill13', 'Dancing', 'Arts', 'Various dance styles and techniques'),
  ('skill14', 'Photography', 'Arts', 'Digital and film photography'),
  ('skill15', 'Videography', 'Arts', 'Video creation and editing'),
  ('skill16', 'Graphic Design', 'Arts', 'Visual design and digital art'),
  ('skill17', 'Animation', 'Arts', 'Creating animated content'),
  ('skill18', 'Creative Writing', 'Arts', 'Fiction and creative storytelling'),
  ('skill19', 'Poetry', 'Arts', 'Writing and performing poetry'),
  ('skill20', 'Calligraphy', 'Arts', 'Beautiful handwriting and lettering'),
  
  -- Technology & Programming
  ('skill21', 'Coding', 'Technology', 'General programming skills'),
  ('skill22', 'Web Development', 'Technology', 'Building websites and web applications'),
  ('skill23', 'Mobile App Development', 'Technology', 'Creating mobile applications'),
  ('skill24', 'Game Development', 'Technology', 'Creating video games'),
  
  -- Education & Academic
  ('skill25', 'Academics (General)', 'Education', 'General academic support'),
  ('skill26', 'History', 'Education', 'Historical knowledge and research'),
  ('skill27', 'Science', 'Education', 'Scientific knowledge and methods'),
  ('skill28', 'Mathematics', 'Education', 'Mathematical concepts and problem solving'),
  ('skill29', 'Literature', 'Education', 'Literary analysis and appreciation'),
  ('skill30', 'Foreign Languages', 'Education', 'Learning and teaching languages'),
  ('skill31', 'Tutoring', 'Education', 'Academic tutoring and support'),
  ('skill32', 'Mentoring', 'Education', 'Guidance and personal development'),
  
  -- Sports & Fitness
  ('skill33', 'Sports (Team)', 'Sports', 'Team-based athletic activities'),
  ('skill34', 'Sports (Individual)', 'Sports', 'Individual athletic pursuits'),
  ('skill35', 'Yoga', 'Sports', 'Yoga practice and instruction'),
  ('skill36', 'Meditation', 'Sports', 'Mindfulness and meditation techniques'),
  
  -- Outdoor Activities
  ('skill37', 'Hiking', 'Outdoor', 'Trail hiking and nature exploration'),
  ('skill38', 'Camping', 'Outdoor', 'Outdoor camping and survival skills'),
  ('skill39', 'Fishing', 'Outdoor', 'Fishing techniques and knowledge'),
  ('skill40', 'Bird Watching', 'Outdoor', 'Bird identification and observation'),
  ('skill41', 'Astronomy', 'Outdoor', 'Stargazing and celestial observation'),
  
  -- Games & Recreation
  ('skill42', 'Board Games', 'Recreation', 'Strategy and board game playing'),
  ('skill43', 'Card Games', 'Recreation', 'Various card game skills'),
  ('skill44', 'Puzzles', 'Recreation', 'Puzzle solving and creation'),
  
  -- Crafts & Handwork
  ('skill45', 'Knitting', 'Crafts', 'Knitting clothing and accessories'),
  ('skill46', 'Crocheting', 'Crafts', 'Crocheting techniques and patterns'),
  ('skill47', 'Sewing', 'Crafts', 'Sewing and tailoring skills'),
  ('skill48', 'Woodworking', 'Crafts', 'Traditional woodworking and carpentry'),
  ('skill49', 'Pottery', 'Crafts', 'Ceramic arts and pottery making'),
  
  -- Communication & Social
  ('skill50', 'Public Speaking', 'Communication', 'Effective presentation and speaking'),
  ('skill51', 'Storytelling', 'Communication', 'Narrative and oral storytelling'),
  ('skill52', 'Volunteering', 'Social', 'Community volunteer work'),
  ('skill53', 'Community Service', 'Social', 'Serving the local community'),
  ('skill54', 'Event Planning', 'Social', 'Organizing and coordinating events'),
  
  -- Health & Safety
  ('skill55', 'First Aid', 'Health', 'Emergency first aid and safety'),
  ('skill56', 'CPR', 'Health', 'Cardiopulmonary resuscitation training'),
  ('skill57', 'Animal Care', 'Health', 'Pet and animal care knowledge'),
  
  -- Finance & Life Skills
  ('skill58', 'Financial Literacy', 'Finance', 'Money management and budgeting'),
  ('skill59', 'Investing', 'Finance', 'Investment strategies and knowledge'),
  ('skill60', 'Genealogy', 'Research', 'Family history and genealogical research');

  -- Insert sample user skills (creating potential matches)
  INSERT OR IGNORE INTO user_skills (id, user_id, skill_id, proficiency_level, want_to_teach, want_to_learn, years_experience) VALUES
  -- Alice (Teacher) - wants to teach coding/web dev, learn cooking
  ('us1', 'user1', 'skill21', 8, TRUE, FALSE, 5),  -- Coding
  ('us2', 'user1', 'skill22', 7, TRUE, FALSE, 4),  -- Web Development
  ('us3', 'user1', 'skill2', 2, FALSE, TRUE, 0),   -- Cooking
  
  -- Bob (Student) - wants to learn coding, teach photography
  ('us4', 'user2', 'skill21', 3, FALSE, TRUE, 1),  -- Coding
  ('us5', 'user2', 'skill14', 6, TRUE, FALSE, 3),  -- Photography
  ('us6', 'user2', 'skill11', 4, FALSE, TRUE, 1),  -- Music
  
  -- Charlie (Expert) - wants to teach writing and music
  ('us7', 'user3', 'skill7', 9, TRUE, FALSE, 8),   -- Writing
  ('us8', 'user3', 'skill11', 7, TRUE, FALSE, 6),  -- Music
  ('us9', 'user3', 'skill21', 4, FALSE, TRUE, 2),  -- Coding
  
  -- Diana (Learner) - wants to learn many things, teach cooking/gardening
  ('us10', 'user4', 'skill2', 8, TRUE, FALSE, 10), -- Cooking
  ('us11', 'user4', 'skill1', 6, TRUE, FALSE, 5),  -- Gardening
  ('us12', 'user4', 'skill21', 1, FALSE, TRUE, 0), -- Coding
  ('us13', 'user4', 'skill58', 2, FALSE, TRUE, 0), -- Financial Literacy
  
  -- Edward (Mentor) - expert programmer, wants to teach and learn
  ('us14', 'user5', 'skill21', 10, TRUE, FALSE, 12), -- Coding
  ('us15', 'user5', 'skill22', 9, TRUE, FALSE, 10),  -- Web Development
  ('us16', 'user5', 'skill48', 3, FALSE, TRUE, 1),   -- Woodworking
  ('us17', 'user5', 'skill32', 9, TRUE, FALSE, 8);   -- Mentoring
`);
