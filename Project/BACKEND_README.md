# Bridges Between Generations - Backend API

A comprehensive backend system for connecting different generations through skill sharing, mentorship, and community building.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based auth with secure password hashing
- **Skill Management** - Comprehensive skill taxonomy and user skill profiles
- **Smart Matching Algorithm** - AI-powered skill matching between teachers and learners
- **Gamification System** - XP, levels, badges, and streaks to encourage engagement
- **Real-time Chat** - WebSocket-powered chat rooms for community interaction
- **Video Meeting Rooms** - Virtual meeting management and scheduling
- **Health Tracking Integration** - Support for fitness devices and activity monitoring

### Technical Stack
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: Socket.IO for WebSocket connections
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Zod schemas for type-safe API validation

## 📁 Project Structure

```
server/
├── auth.ts                 # Authentication middleware and utilities
├── db.ts                   # Database connection and configuration
├── index.ts                # Main server entry point
├── init-db.ts             # Database initialization with sample data
├── routes/
│   ├── index.ts           # Route aggregation and mounting
│   ├── auth.ts            # Authentication endpoints
│   ├── users.ts           # User management
│   ├── skills.ts          # Skill catalog management
│   ├── skill-matches.ts   # Matching algorithm and requests
│   ├── gamification.ts    # XP, levels, badges system
│   ├── meeting-rooms.ts   # Virtual meeting management
│   └── tracking-devices.ts # Health device integration
├── websockets/
│   └── chat.ts            # Real-time chat system
└── shared/
    └── schema.ts          # Database schema and type definitions
```

## 🔧 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current authenticated user
- `POST /logout` - User logout

### Users (`/api/users`)
- `GET /:id` - Get user profile with skills
- `PUT /:id` - Update user profile (authenticated)
- `POST /:id/skills` - Add skill to user profile
- `PUT /:id/skills/:skillId` - Update user skill
- `DELETE /:id/skills/:skillId` - Remove skill from profile

### Skills (`/api/skills`)
- `GET /` - List all skills (with search and category filters)
- `GET /:id` - Get specific skill details
- `POST /` - Create new skill (authenticated)
- `PUT /:id` - Update skill (authenticated)
- `DELETE /:id` - Delete skill (authenticated)

### Skill Matching (`/api/skill-matches`)
- `GET /:userId` - Get skill matches for user
- `POST /` - Create skill match request
- `PUT /:matchId` - Update match status (accept/reject)
- `GET /percentiles` - Get matching statistics

### Gamification (`/api/gam`)
- `GET /state/:userId` - Get user's gamification state
- `POST /earn` - Award XP/points to user
- `GET /leaderboard` - Get top users leaderboard
- `GET /badges` - List available badges
- `GET /badges/:userId` - Get user's earned badges
- `POST /streak/:userId` - Update daily login streak

### Meeting Rooms (`/api/meeting-rooms`)
- `GET /` - List active meeting rooms
- `GET /:id` - Get specific room details
- `POST /` - Create new meeting room
- `POST /:roomId/join` - Join meeting room
- `POST /:roomId/leave` - Leave meeting room
- `PUT /:id` - Update room (host only)
- `DELETE /:id` - Deactivate room (host only)

### Tracking Devices (`/api/tracking-devices`)
- `GET /user/:userId` - Get user's devices
- `POST /` - Register new device
- `PUT /:id` - Update device settings
- `DELETE /:id` - Remove device
- `POST /:deviceId/sync` - Sync activity data
- `GET /user/:userId/activities` - Get activity history
- `GET /user/:userId/summary` - Get activity summary

## 🔄 Real-time Features

### WebSocket Chat System
- **Authentication**: Token-based auth for WebSocket connections
- **Room Management**: Join/leave chat rooms with user presence
- **Message History**: Persistent chat history with database storage
- **Typing Indicators**: Real-time typing status
- **System Messages**: Automated notifications and announcements

### Supported Chat Events:
```javascript
// Client to Server
socket.emit('authenticate', token)
socket.emit('join_room', roomId)
socket.emit('send_message', { room, message })
socket.emit('typing_start', room)
socket.emit('typing_stop', room)
socket.emit('leave_room')

// Server to Client
socket.on('authenticated', userData)
socket.on('recent_messages', messages)
socket.on('new_message', messageData)
socket.on('user_typing', typingData)
socket.on('room_users', userList)
socket.on('system_message', systemMessage)
```

## 🎮 Gamification System

### XP & Levels
- **XP Calculation**: 100 XP per level with unlimited progression
- **Activity Rewards**: Different activities award varying XP amounts
- **Level Benefits**: Unlocks badges and recognition

### Badge System
- **Achievement Tracking**: Automatic badge awarding based on user actions
- **Custom Badges**: Support for custom achievement criteria
- **XP Rewards**: Badges provide additional XP bonuses

### Streak System
- **Daily Login Tracking**: Encourages consistent platform engagement
- **Bonus XP**: Streak multipliers for sustained activity
- **Reset Logic**: Fair handling of missed days

## 🧠 Smart Matching Algorithm

### Compatibility Scoring
```typescript
function calculateCompatibilityScore(
  teacherProficiency: number,
  learnerProficiency: number,
  teacherExperience: number
): number
```

### Factors Considered:
1. **Skill Gap**: Optimal 2-4 level difference between teacher and learner
2. **Experience Weight**: Years of experience provide compatibility bonus
3. **Mutual Interest**: Matching want-to-teach with want-to-learn preferences

### Match Types:
- **Teaching Matches**: Users wanting to teach matched with learners
- **Learning Matches**: Users wanting to learn matched with teachers
- **Bidirectional**: Support for users who both teach and learn

## 🏥 Health Tracking Integration

### Supported Device Types
- Fitbit, Garmin, Apple Watch, Terra API
- Custom device integrations via API

### Activity Types & XP Rewards
- **Steps**: 1 XP per 100 steps
- **Distance**: 10 XP per kilometer
- **Calories**: 1 XP per 10 calories burned
- **Sleep**: 20 XP per hour of sleep
- **Exercise Sessions**: 50 XP per session
- **Meditation**: 30 XP per session

## 🛡️ Security Features

### Authentication
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt with 12 salt rounds
- **Token Expiration**: Configurable token lifetime (default: 7 days)

### Authorization
- **Role-based Access**: Users can only modify their own data
- **Resource Protection**: Skill matches and meetings have proper ownership checks
- **Admin Capabilities**: Future support for admin roles

### Data Validation
- **Zod Schemas**: Type-safe validation for all API inputs
- **SQL Injection Protection**: Parameterized queries via Drizzle ORM
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Environment variables configured

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/bridges_db
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 📊 Database Schema

The system uses a PostgreSQL database with the following main tables:

- **users**: User profiles and authentication
- **skills**: Master skill catalog
- **user_skills**: User-skill relationships with proficiency levels
- **skill_matches**: Matching requests and status
- **badges**: Achievement definitions
- **user_badges**: User-earned badges
- **meeting_rooms**: Virtual meeting management
- **meeting_participants**: Meeting attendance tracking
- **chat_messages**: Persistent chat history
- **tracking_devices**: Health device registrations
- **activity_data**: Fitness and activity logs

## 🔮 Future Enhancements

### Planned Features
- **AI-Powered Recommendations**: Machine learning for better matching
- **Video Call Integration**: Built-in video calling with Zoom/Teams
- **Advanced Analytics**: Detailed engagement and learning progress metrics
- **Mobile API Optimization**: Enhanced endpoints for mobile apps
- **Notification System**: Push notifications for matches and messages
- **Content Management**: Learning resources and curriculum support

### Scalability Considerations
- **Caching Layer**: Redis for session and frequent data caching
- **Queue System**: Background job processing for notifications
- **Database Optimization**: Query optimization and indexing strategies
- **Load Balancing**: Horizontal scaling support for high traffic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes with tests
4. Submit a pull request with detailed description

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for bridging generations through technology and knowledge sharing.**
