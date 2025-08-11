import type { SubjectConfig, QuestType, AchievementTier, Resource, Template } from '../types';

export const defaultQuestTypes: QuestType[] = [
  { id: 'easy', name: 'Easy', duration: 15, xp: 10, emoji: '🌟' },
  { id: 'medium', name: 'Medium', duration: 30, xp: 25, emoji: '⚡' },
  { id: 'hard', name: 'Hard', duration: 60, xp: 50, emoji: '🏆' }
];

export const defaultAchievements: AchievementTier[] = [
  { id: 'first_step', name: 'First Step', emoji: '🌟', streakRequired: 0 },
  { id: 'on_fire', name: 'On Fire', emoji: '🔥', streakRequired: 3 },
  { id: 'power_user', name: 'Power User', emoji: '⚡', streakRequired: 7 },
  { id: 'champion', name: 'Champion', emoji: '🏆', streakRequired: 14 },
  { id: 'master', name: 'Master', emoji: '💎', streakRequired: 30 },
  { id: 'legend', name: 'Legend', emoji: '👑', streakRequired: 60 }
];

const japaneseResources: Resource[] = [
  { id: '1', title: 'Tae Kim — Complete Grammar Guide', url: 'https://www.guidetojapanese.org/learn/grammar', priority: 'H' },
  { id: '2', title: 'NHK Easy News — Real Japanese', url: 'https://www3.nhk.or.jp/news/easy/', priority: 'H' },
  { id: '3', title: 'Jisho — Ultimate Dictionary', url: 'https://jisho.org/', priority: 'H' },
  { id: '4', title: 'Anki — SRS Flashcards', url: 'https://apps.ankiweb.net/', priority: 'H' },
  { id: '5', title: 'WaniKani — Kanji Learning', url: 'https://www.wanikani.com/', priority: 'M' },
  { id: '6', title: 'Bunpro — Grammar SRS', url: 'https://bunpro.jp/', priority: 'M' },
  { id: '7', title: 'JapanesePod101 — Audio Lessons', url: 'https://www.japanesepod101.com/', priority: 'M' },
  { id: '8', title: 'Tangorin — Dictionary & Examples', url: 'https://tangorin.com/', priority: 'M' },
  { id: '9', title: 'Japanese Conjugation City', url: 'https://conjuguemos.com/verb/homework/40', priority: 'L' },
  { id: '10', title: 'ImmersionKit — Sentence Examples', url: 'https://www.immersionkit.com/', priority: 'L' },
  { id: '11', title: 'Japanese Subtitles Player', url: 'https://www.japanese-subtitles.com/', priority: 'L' },
  { id: '12', title: 'Kana Pro — Writing Practice', url: 'https://kana.pro/', priority: 'L' }
];

const programmingResources: Resource[] = [
  { id: '13', title: 'MDN Web Docs — The Bible', url: 'https://developer.mozilla.org/', priority: 'H' },
  { id: '14', title: 'freeCodeCamp — Full Curriculum', url: 'https://www.freecodecamp.org/learn', priority: 'H' },
  { id: '15', title: 'The Odin Project — Full Stack', url: 'https://www.theodinproject.com/', priority: 'H' },
  { id: '16', title: 'Exercism — Code Practice', url: 'https://exercism.org/', priority: 'H' },
  { id: '17', title: 'LeetCode — Algorithm Training', url: 'https://leetcode.com/', priority: 'M' },
  { id: '18', title: 'Codewars — Code Challenges', url: 'https://www.codewars.com/', priority: 'M' },
  { id: '19', title: 'JavaScript.info — Modern JS', url: 'https://javascript.info/', priority: 'M' },
  { id: '20', title: 'You Don\'t Know JS — Deep Dive', url: 'https://github.com/getify/You-Dont-Know-JS', priority: 'M' },
  { id: '21', title: 'Clean Code — Best Practices', url: 'https://github.com/ryanmcdermott/clean-code-javascript', priority: 'M' },
  { id: '22', title: 'Roadmap.sh — Career Paths', url: 'https://roadmap.sh/', priority: 'L' },
  { id: '23', title: 'Project Euler — Math Problems', url: 'https://projecteuler.net/', priority: 'L' },
  { id: '24', title: 'CSS Battle — CSS Challenges', url: 'https://cssbattle.dev/', priority: 'L' },
  { id: '25', title: 'Flexbox Froggy — CSS Game', url: 'https://flexboxfroggy.com/', priority: 'L' },
  { id: '26', title: 'Grid Garden — CSS Grid Game', url: 'https://cssgridgarden.com/', priority: 'L' }
];

const mathResources: Resource[] = [
  { id: '27', title: 'Khan Academy — Complete Math', url: 'https://www.khanacademy.org/math', priority: 'H' },
  { id: '28', title: 'Paul\'s Online Math Notes', url: 'https://tutorial.math.lamar.edu/', priority: 'H' },
  { id: '29', title: '3Blue1Brown — Visual Math', url: 'https://www.3blue1brown.com/', priority: 'H' },
  { id: '30', title: 'Brilliant — Interactive Learning', url: 'https://brilliant.org/', priority: 'M' },
  { id: '31', title: 'Desmos Graphing Calculator', url: 'https://www.desmos.com/calculator', priority: 'M' },
  { id: '32', title: 'Wolfram Alpha — Math Engine', url: 'https://www.wolframalpha.com/', priority: 'M' },
  { id: '33', title: 'MIT OpenCourseWare — Math', url: 'https://ocw.mit.edu/courses/mathematics/', priority: 'M' },
  { id: '34', title: 'Professor Leonard — Calculus', url: 'https://www.youtube.com/c/ProfessorLeonard', priority: 'L' },
  { id: '35', title: 'Patrickjmt — Math Videos', url: 'https://patrickjmt.com/', priority: 'L' },
  { id: '36', title: 'Symbolab — Step Solutions', url: 'https://www.symbolab.com/', priority: 'L' },
  { id: '37', title: 'Geogebra — Dynamic Math', url: 'https://www.geogebra.org/', priority: 'L' }
];

const chemistryResources: Resource[] = [
  { id: '38', title: 'Chemguide — Complete Chemistry', url: 'https://www.chemguide.co.uk/', priority: 'H' },
  { id: '39', title: 'Khan Academy — Chemistry', url: 'https://www.khanacademy.org/science/chemistry', priority: 'H' },
  { id: '40', title: 'PhET Interactive Simulations', url: 'https://phet.colorado.edu/en/simulations/filter?subjects=chemistry', priority: 'H' },
  { id: '41', title: 'Crash Course Chemistry', url: 'https://www.youtube.com/playlist?list=PL8dPuuaLjXtPHzzYuWy6fYEaX9mQQ8oGr', priority: 'M' },
  { id: '42', title: 'LibreTexts Chemistry', url: 'https://chem.libretexts.org/', priority: 'M' },
  { id: '43', title: 'ChemSpider — Chemical Database', url: 'https://www.chemspider.com/', priority: 'M' },
  { id: '44', title: 'NIST Chemistry WebBook', url: 'https://webbook.nist.gov/chemistry/', priority: 'M' },
  { id: '45', title: 'Tyler DeWitt — Chem Tutorials', url: 'https://www.youtube.com/c/tdewitt451', priority: 'L' },
  { id: '46', title: 'Organic Chemistry Portal', url: 'https://www.organic-chemistry.org/', priority: 'L' },
  { id: '47', title: 'ChemSketch — Drawing Tool', url: 'https://www.acdlabs.com/resources/free-chemistry-software-apps/chemsketch/', priority: 'L' }
];

// New expanded resource categories
const musicResources: Resource[] = [
  { id: '48', title: 'Musictheory.net — Complete Theory', url: 'https://www.musictheory.net/', priority: 'H' },
  { id: '49', title: 'Simply Piano — Learn Piano', url: 'https://www.simplypianoapp.com/', priority: 'H' },
  { id: '50', title: 'Yousician — Multi-Instrument', url: 'https://yousician.com/', priority: 'M' },
  { id: '51', title: 'JustinGuitar — Guitar Lessons', url: 'https://www.justinguitar.com/', priority: 'M' },
  { id: '52', title: 'Tenuto — Ear Training', url: 'https://www.musictheory.net/products/tenuto', priority: 'L' },
  { id: '53', title: 'IMSLP — Sheet Music Library', url: 'https://imslp.org/', priority: 'L' }
];

const fitnessResources: Resource[] = [
  { id: '54', title: 'Athlean-X — Science-Based Training', url: 'https://www.athleanx.com/', priority: 'H' },
  { id: '55', title: 'MyFitnessPal — Nutrition Tracking', url: 'https://www.myfitnesspal.com/', priority: 'H' },
  { id: '56', title: 'Strong App — Workout Tracking', url: 'https://strong.app/', priority: 'M' },
  { id: '57', title: 'Yoga with Adriene', url: 'https://www.youtube.com/c/yogawithadriene', priority: 'M' },
  { id: '58', title: 'Calisthenic Movement', url: 'https://www.calisthenic-movement.com/', priority: 'L' }
];

const languageResources: Resource[] = [
  { id: '59', title: 'Duolingo — Gamified Learning', url: 'https://www.duolingo.com/', priority: 'H' },
  { id: '60', title: 'Anki — SRS Flashcards', url: 'https://apps.ankiweb.net/', priority: 'H' },
  { id: '61', title: 'HelloTalk — Language Exchange', url: 'https://www.hellotalk.com/', priority: 'M' },
  { id: '62', title: 'Forvo — Pronunciation Dictionary', url: 'https://forvo.com/', priority: 'M' },
  { id: '63', title: 'Language Transfer — Audio Method', url: 'https://www.languagetransfer.org/', priority: 'L' }
];

const designResources: Resource[] = [
  { id: '64', title: 'Figma — Design Tool', url: 'https://www.figma.com/', priority: 'H' },
  { id: '65', title: 'Adobe Creative Suite', url: 'https://www.adobe.com/creativecloud.html', priority: 'H' },
  { id: '66', title: 'Dribbble — Design Inspiration', url: 'https://dribbble.com/', priority: 'M' },
  { id: '67', title: 'Unsplash — Free Photos', url: 'https://unsplash.com/', priority: 'M' },
  { id: '68', title: 'Coolors — Color Palettes', url: 'https://coolors.co/', priority: 'L' }
];

export const defaultSubjects: SubjectConfig[] = [
  {
    id: 'japanese',
    name: 'Japanese Dojo',
    emoji: '🇯🇵',
    color: '#d32f2f',
    achievements: defaultAchievements,
    questTypes: defaultQuestTypes,
    pipAmount: 5,
    targetHours: 8,
    resources: japaneseResources
  },
  {
    id: 'programming',
    name: 'Programming — Cyber',
    emoji: '💻',
    color: '#1976d2',
    achievements: defaultAchievements,
    questTypes: defaultQuestTypes,
    pipAmount: 5,
    targetHours: 8,
    resources: programmingResources
  },
  {
    id: 'math',
    name: 'Math — Wizardry',
    emoji: '📐',
    color: '#7b1fa2',
    achievements: defaultAchievements,
    questTypes: defaultQuestTypes,
    pipAmount: 5,
    targetHours: 8,
    resources: mathResources
  },
  {
    id: 'chemistry',
    name: 'Chemistry — Alchemy',
    emoji: '🧪',
    color: '#388e3c',
    achievements: defaultAchievements,
    questTypes: defaultQuestTypes,
    pipAmount: 5,
    targetHours: 8,
    resources: chemistryResources
  }
];

// Expanded subject templates for different domains
export const expandedSubjectTemplates: SubjectConfig[] = [
  {
    id: 'music_production',
    name: 'Music Mastery',
    emoji: '🎵',
    color: '#e91e63',
    achievements: defaultAchievements,
    questTypes: [
      { id: 'practice', name: 'Practice', duration: 30, xp: 20, emoji: '🎹' },
      { id: 'theory', name: 'Theory', duration: 20, xp: 15, emoji: '📚' },
      { id: 'composition', name: 'Create', duration: 45, xp: 35, emoji: '🎼' }
    ],
    pipAmount: 10,
    targetHours: 12,
    resources: musicResources
  },
  {
    id: 'fitness_journey',
    name: 'Fitness Journey',
    emoji: '💪',
    color: '#ff5722',
    achievements: [
      { id: 'beginner', name: 'First Workout', emoji: '🏃', streakRequired: 0 },
      { id: 'consistent', name: 'Getting Strong', emoji: '💪', streakRequired: 7 },
      { id: 'dedicated', name: 'Fitness Habit', emoji: '🔥', streakRequired: 21 },
      { id: 'beast_mode', name: 'Beast Mode', emoji: '🦾', streakRequired: 60 }
    ],
    questTypes: [
      { id: 'cardio', name: 'Cardio', duration: 30, xp: 25, emoji: '🏃' },
      { id: 'strength', name: 'Strength', duration: 45, xp: 35, emoji: '🏋️' },
      { id: 'flexibility', name: 'Stretch', duration: 15, xp: 10, emoji: '🧘' }
    ],
    pipAmount: 15,
    targetHours: 15,
    resources: fitnessResources
  },
  {
    id: 'creative_design',
    name: 'Design Studio',
    emoji: '🎨',
    color: '#9c27b0',
    achievements: defaultAchievements,
    questTypes: [
      { id: 'sketch', name: 'Sketching', duration: 20, xp: 15, emoji: '✏️' },
      { id: 'digital', name: 'Digital Art', duration: 45, xp: 35, emoji: '🖥️' },
      { id: 'study', name: 'Art Study', duration: 30, xp: 20, emoji: '👁️' }
    ],
    pipAmount: 8,
    targetHours: 10,
    resources: designResources
  },
  {
    id: 'language_immersion',
    name: 'Language Lab',
    emoji: '🌍',
    color: '#4caf50',
    achievements: defaultAchievements,
    questTypes: [
      { id: 'vocabulary', name: 'Vocabulary', duration: 15, xp: 10, emoji: '📝' },
      { id: 'conversation', name: 'Speaking', duration: 30, xp: 30, emoji: '💬' },
      { id: 'immersion', name: 'Immersion', duration: 60, xp: 40, emoji: '🎧' }
    ],
    pipAmount: 10,
    targetHours: 12,
    resources: languageResources
  }
];

export function createEmptySubjectConfig(): Partial<SubjectConfig> {
  return {
    name: '',
    emoji: '📚',
    color: '#1976d2',
    achievements: [...defaultAchievements],
    questTypes: [...defaultQuestTypes],
    pipAmount: 5,
    targetHours: 8,
    resources: []
  };
}

export const builtInTemplates: Template[] = [
  {
    id: 'classic',
    name: 'Classic ADHD Learning',
    description: 'The original four subjects: Japanese, Programming, Math, and Chemistry with curated resources',
    category: 'Academic',
    author: 'ADHD Learning RPG',
    version: '2.0.0',
    subjects: defaultSubjects
  },
  {
    id: 'creative_powerhouse',
    name: 'Creative Powerhouse',
    description: 'Unleash your artistic potential with music, design, and creative practice',
    category: 'Creative',
    author: 'Creative Community',
    version: '1.0.0',
    subjects: [expandedSubjectTemplates[0], expandedSubjectTemplates[2]] // Music + Design
  },
  {
    id: 'wellness_warrior',
    name: 'Wellness Warrior',
    description: 'Mind and body optimization with fitness, languages, and personal growth',
    category: 'Wellness',
    author: 'Wellness Community',
    version: '1.0.0',
    subjects: [expandedSubjectTemplates[1], expandedSubjectTemplates[3]] // Fitness + Language
  },
  {
    id: 'polymath_path',
    name: 'Polymath Path',
    description: 'Renaissance learning across multiple disciplines for the curious mind',
    category: 'Comprehensive',
    author: 'Polymath Society',
    version: '1.0.0',
    subjects: [
      defaultSubjects[1], // Programming
      expandedSubjectTemplates[0], // Music
      {
        id: 'philosophy',
        name: 'Philosophy & Critical Thinking',
        emoji: '🧠',
        color: '#673ab7',
        achievements: defaultAchievements,
        questTypes: [
          { id: 'reading', name: 'Reading', duration: 45, xp: 35, emoji: '📚' },
          { id: 'reflection', name: 'Reflection', duration: 20, xp: 20, emoji: '🤔' },
          { id: 'discussion', name: 'Discussion', duration: 30, xp: 25, emoji: '💭' }
        ],
        pipAmount: 10,
        targetHours: 8,
        resources: [
          { id: 'stanford_phil', title: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/', priority: 'H' },
          { id: 'philosophy_tube', title: 'Philosophy Tube', url: 'https://www.youtube.com/c/thephilosophytube', priority: 'M' },
          { id: 'crash_course_phil', title: 'Crash Course Philosophy', url: 'https://www.youtube.com/playlist?list=PL8dPuuaLjXtNgK6MZucdYldNkMybYIHKR', priority: 'M' }
        ]
      }
    ]
  },
  {
    id: 'tech_innovator',
    name: 'Tech Innovator',
    description: 'Full-stack development with programming, design, and mathematical foundations',
    category: 'Technology',
    author: 'Tech Community',
    version: '1.0.0',
    subjects: [
      defaultSubjects[1], // Programming
      defaultSubjects[2], // Math
      expandedSubjectTemplates[2], // Design
      {
        id: 'data_science',
        name: 'Data Science & AI',
        emoji: '🤖',
        color: '#00bcd4',
        achievements: defaultAchievements,
        questTypes: [
          { id: 'analysis', name: 'Data Analysis', duration: 60, xp: 50, emoji: '📊' },
          { id: 'modeling', name: 'ML Modeling', duration: 90, xp: 70, emoji: '🧠' },
          { id: 'theory', name: 'Theory Study', duration: 30, xp: 25, emoji: '📚' }
        ],
        pipAmount: 15,
        targetHours: 20,
        resources: [
          { id: 'kaggle', title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', priority: 'H' },
          { id: 'fast_ai', title: 'Fast.ai', url: 'https://www.fast.ai/', priority: 'H' },
          { id: 'coursera_ml', title: 'Coursera ML Course', url: 'https://www.coursera.org/learn/machine-learning', priority: 'M' }
        ]
      }
    ]
  },
  {
    id: 'language_immersion',
    name: 'Language Immersion Pro',
    description: 'Deep dive into language learning with structured progression and cultural immersion',
    category: 'Languages',
    author: 'Polyglot Community',
    version: '2.0.0',
    subjects: [
      {
        id: 'target_language_core',
        name: 'Core Language Skills',
        emoji: '🌍',
        color: '#4caf50',
        achievements: [
          { id: 'first_words', name: 'First Words', emoji: '👋', streakRequired: 0 },
          { id: 'daily_learner', name: 'Daily Learner', emoji: '📅', streakRequired: 7 },
          { id: 'conversation_ready', name: 'Conversation Ready', emoji: '💬', streakRequired: 30 },
          { id: 'fluent_speaker', name: 'Fluent Speaker', emoji: '🗣️', streakRequired: 100 }
        ],
        questTypes: [
          { id: 'vocabulary', name: 'Vocabulary', duration: 15, xp: 10, emoji: '📝' },
          { id: 'grammar', name: 'Grammar', duration: 30, xp: 25, emoji: '📖' },
          { id: 'speaking', name: 'Speaking Practice', duration: 45, xp: 40, emoji: '🎤' }
        ],
        pipAmount: 10,
        targetHours: 15,
        resources: languageResources
      },
      {
        id: 'cultural_immersion',
        name: 'Cultural Immersion',
        emoji: '🎭',
        color: '#ff9800',
        achievements: defaultAchievements,
        questTypes: [
          { id: 'media', name: 'Media Consumption', duration: 60, xp: 30, emoji: '📺' },
          { id: 'reading', name: 'Native Reading', duration: 30, xp: 25, emoji: '📰' },
          { id: 'culture', name: 'Cultural Study', duration: 20, xp: 15, emoji: '🏛️' }
        ],
        pipAmount: 15,
        targetHours: 10,
        resources: [
          { id: 'netflix', title: 'Netflix (Target Language)', url: 'https://www.netflix.com/', priority: 'M' },
          { id: 'news', title: 'Local News Sites', url: 'https://www.bbc.com/', priority: 'M' },
          { id: 'culture_trip', title: 'Culture Trip', url: 'https://theculturetrip.com/', priority: 'L' }
        ]
      }
    ]
  }
];