# Modular ADHD Learning RPG

A customizable, gamified learning tracker built for ADHD minds. Transform your learning journey into an engaging RPG experience with fully customizable subjects, achievements, and progress tracking.

## 🎯 Key Features

### Core ADHD-Friendly Experience
- **Instant Visual Feedback** - Celebrate every small win with animations and progress bars
- **Low-Friction Interaction** - Start studying with one click, add time with quick buttons
- **Streak Tracking** - Build momentum with visual streak counters and achievement levels
- **Daily Pips** - Micro-habits that add small amounts of progress throughout the day
- **Customizable Quest Types** - Different session types with varying XP rewards

### Revolutionary Modularity
- **Dynamic Subject Creation** - Add any subject from Guitar Practice to Advanced Physics
- **Template System** - Share and import complete learning configurations
- **Deep Customization** - Modify achievements, quest types, pip amounts, and more
- **Export/Import** - Backup your data and sync across devices

### Built-in Learning Paths
- **Classic Template** - Japanese, Programming, Math, Chemistry (original subjects)
- **Language Learning** - Structured vocabulary, grammar, and immersion practice
- **Custom Templates** - Create and share your own learning configurations

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to start your learning journey!

## 📱 Usage

### Your First Subject
1. Click "Create Your First Subject" or the "+" button
2. Follow the 5-step wizard:
   - **Basic Info** - Name, emoji, and theme color
   - **Quest Types** - Define study session types (Practice, Review, etc.)
   - **Achievements** - Set streak-based milestone rewards
   - **Settings** - Configure pip amounts and target hours
   - **Review** - Confirm and create

### Daily Learning Flow
1. **Start a Quest** - Timed study session with notes
2. **Quick Add** - Instantly log completed study time
3. **Daily Pips** - Click for micro-progress throughout the day
4. **Track Streaks** - Maintain momentum with consecutive study days

### Templates & Sharing
- **Apply Templates** - Use pre-built learning configurations
- **Export Templates** - Share your subject setup with others
- **Import Data** - Restore backups or migrate between devices

## 🎮 Gamification Elements

### Achievement System
- 6 tiers from "First Step" to "Legend"
- Unlocked by consecutive study days
- Visual progress with emoji rewards

### XP & Progress
- Earn XP for each study session
- Progress bars show advancement toward target hours
- Different quest types offer varying XP rewards

### Streaks & Momentum
- Daily streak tracking with flexible day counting
- Visual streak indicators (🔥 fire icons)
- Achievement unlocks based on streak milestones

## 🛠️ Technical Architecture

### Built With
- **React 19** + **TypeScript** - Modern, type-safe development
- **Vite** - Fast development and production builds
- **CSS Custom Properties** - Dynamic theming and responsive design
- **LocalStorage** - Client-side data persistence

### Key Design Principles
- **Component-Based** - Modular, reusable UI components
- **Type Safety** - Full TypeScript coverage for reliability
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support
- **Performance** - Optimized bundle size and lazy loading

### Data Structure
```typescript
interface SubjectConfig {
  id: string;
  name: string;
  emoji: string;
  color: string;
  achievements: AchievementTier[];
  questTypes: QuestType[];
  pipAmount: number;
  targetHours: number;
  resources: Resource[];
}
```

## 📂 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main learning overview
│   ├── SubjectCard.tsx  # Individual subject display
│   ├── SubjectCreator.tsx # Subject creation wizard
│   ├── QuestTimer.tsx   # Timed study sessions
│   ├── TemplateManager.tsx # Template system
│   └── ExportImport.tsx # Data management
├── hooks/              # Custom React hooks
│   └── useAppData.ts   # Central state management
├── types/              # TypeScript definitions
│   └── index.ts        # Core data types
├── utils/              # Utility functions
│   ├── defaults.ts     # Default configurations
│   └── storage.ts      # Data persistence
└── styles/             # CSS styling
    └── index.css       # Global styles & themes
```

## 🎨 Customization Examples

### Creating a Music Practice Subject
```javascript
{
  name: "Guitar Mastery",
  emoji: "🎸",
  color: "#ff6b35",
  questTypes: [
    { name: "Scales", duration: 15, xp: 10, emoji: "🎵" },
    { name: "Songs", duration: 30, xp: 25, emoji: "🎶" },
    { name: "Performance", duration: 45, xp: 40, emoji: "🎤" }
  ],
  pipAmount: 10, // 10 minutes per pip
  achievements: [
    { name: "First Chord", streakRequired: 0, emoji: "🎯" },
    { name: "Daily Player", streakRequired: 7, emoji: "🔥" },
    { name: "Musician", streakRequired: 30, emoji: "🏆" }
  ]
}
```

### Fitness Tracking Configuration
```javascript
{
  name: "Strength Training",
  emoji: "💪",
  questTypes: [
    { name: "Cardio", duration: 20, xp: 15, emoji: "🏃" },
    { name: "Weights", duration: 45, xp: 35, emoji: "🏋️" },
    { name: "Flexibility", duration: 15, xp: 10, emoji: "🧘" }
  ]
}
```

## 🎯 Success Stories

**"I've been struggling to maintain a consistent Japanese study routine for years. The modular system let me customize everything perfectly - different XP for kanji vs conversation practice, and the pip system helps me sneak in vocab throughout the day!"** - Sarah, Language Learner

**"As a music teacher, I exported my 'Piano Fundamentals' template and now all my students use the same achievement system. They love seeing their practice streaks grow!"** - Mike, Piano Instructor

## 📈 Roadmap

- [ ] **Mobile PWA** - Offline support and mobile installation
- [ ] **Goal System** - Time-based and session-based targets
- [ ] **Statistics Dashboard** - Advanced progress analytics
- [ ] **Resource Library** - Curated learning links per subject
- [ ] **Collaborative Templates** - Community template sharing
- [ ] **Integration APIs** - Connect with external learning platforms

## 💡 Philosophy

This app transforms learning from a chore into an adventure. By making subjects fully customizable, learners can create their perfect system without being constrained by rigid categories.

**Small steps > Zero days** - Every bit of progress counts, and the system celebrates all wins, no matter how small.

## 🤝 Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or creating new templates, your help makes this tool better for everyone.

## 📄 License

MIT License - Build amazing things with this foundation!

---

**Transform your learning journey. Start building your perfect study system today.**