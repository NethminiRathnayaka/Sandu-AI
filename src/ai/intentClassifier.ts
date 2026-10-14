export type SanduIntent =
  | 'flashcard'
  | 'quote'
  | 'fitness'
  | 'language'
  | 'settings'
  | 'help'
  | 'small-talk';

export interface ClassificationResult {
  intent: SanduIntent;
  confidence: number;
  extractedParams?: Record<string, any>;
}

// Multilingual keyword & pattern weights for on-device intent classification
const INTENT_RULES: Record<SanduIntent, { keywords: string[]; patterns: RegExp[] }> = {
  settings: {
    keywords: [
      'dark mode', 'light mode', 'theme', 'color', 'accent', 'font', 'settings',
      'switch mode', 'switch language', 'outfit',
      'අඳුරු මාදිලිය', 'ලා පැහැය', 'තේමාව', 'සැකසුම්',
      'தீம்', 'இருள்', 'வெளிச்சம்', 'அமைப்புகள்'
    ],
    patterns: [
      /switch\s+to\s+(dark|light)\s+mode/i,
      /change\s+language\s+(to\s+)?(english|sinhala|tamil)/i,
      /change\s+accent\s+to/i,
      /toggle\s+theme/i,
      /open\s+settings/i
    ]
  },
  help: {
    keywords: [
      'help', 'guide', 'faq', 'tour', 'how to use', 'shortcuts', 'features', 'onboarding',
      'how does', 'explain app',
      'උදව්', 'මඟපෙන්වීම', 'භාවිතය',
      'உதவி', 'சுற்றுப்பயணம்', 'வழிகாட்டி'
    ],
    patterns: [
      /how\s+do\s+i/i,
      /how\s+does\s+.+\s+work/i,
      /show\s+me\s+around/i,
      /what\s+can\s+you\s+do/i,
      /start\s+tour/i,
      /app\s+help/i
    ]
  },
  flashcard: {
    keywords: [
      'flashcard', 'card', 'quiz', 'study', 'deck', 'review', 'memorize', 'test',
      'කාඩ්පත්', 'ප්‍රශ්නාවලිය', 'පාඩම්', 'සමාලෝචනය',
      'அட்டை', 'நினைவூட்டல்', 'வினாடி', 'படிப்பு'
    ],
    patterns: [
      /quiz\s+me/i,
      /add\s+(a\s+)?flashcard/i,
      /review\s+card/i,
      /study\s+deck/i,
      /capital\s+of\s+.+\s*=\s*.+/i
    ]
  },
  quote: {
    keywords: [
      'quote', 'motivate', 'motivation', 'inspire', 'inspiration', 'wisdom', 'mindful',
      'thought', 'saying', 'explain quote',
      'උපුටන', 'ආශ්වාදය', 'දිරිගන්වන්න',
      'பொன்மொழி', 'ஊக்கம்', 'உத்வேகம்'
    ],
    patterns: [
      /new\s+quote/i,
      /give\s+me\s+a\s+quote/i,
      /motivate\s+me/i,
      /explain\s+(this\s+|today's\s+)?quote/i,
      /quote\s+of\s+the\s+day/i
    ]
  },
  fitness: {
    keywords: [
      'fitness', 'workout', 'exercise', 'run', 'running', 'walk', 'walking', 'gym',
      'steps', 'calorie', 'calories', 'water', 'sleep', 'hydration', 'cycle', 'cycling', 'yoga',
      'ව්‍යායාම', 'දිවීම', 'ඇවිදීම', 'පියවර', 'කැලරි', 'වතුර',
      'உடற்பயிற்சி', 'நடைகள்', 'ஓட்டம்', 'கலோரி', 'தண்ணீர்'
    ],
    patterns: [
      /log\s+(\d+)\s*(min|mins|minutes)?\s*(run|running|walk|walking|gym|cycling|yoga)/i,
      /(\d+)\s*steps/i,
      /drink\s+(\d+)\s*(glass|glasses|cup|cups)?/i,
      /workout\s+log/i,
      /how\s+many\s+steps/i
    ]
  },
  language: {
    keywords: [
      'language', 'vocab', 'vocabulary', 'sinhala', 'tamil', 'english', 'translate',
      'pronounce', 'phrase', 'grammar', 'learn word', 'meaning',
      'භාෂාව', 'සිංහල', 'දෙමළ', 'වචන', 'තේරුම',
      'மொழி', 'தமிழ்', 'சிங்களம்', 'சொல்', 'பொருள்'
    ],
    patterns: [
      /teach\s+me\s+(sinhala|tamil|english)/i,
      /how\s+do\s+you\s+say/i,
      /what\s+does\s+.+\s+mean/i,
      /translate\s+.+/i,
      /language\s+quiz/i
    ]
  },
  'small-talk': {
    keywords: [
      'hello', 'hi', 'hey', 'sandu', 'good morning', 'good afternoon', 'good evening',
      'good night', 'thanks', 'thank you', 'how are you', 'who are you', 'bye', 'see you',
      'ආයුබෝවන්', 'ස්තූතියි', 'කොහොමද',
      'வணக்கம்', 'நன்றி', 'எப்படி இருக்கிறாய்'
    ],
    patterns: [
      /^(hi|hello|hey|sandu)[\s!.]*$/i,
      /how\s+are\s+you/i,
      /who\s+are\s+you/i,
      /thank\s+you/i,
      /good\s+(morning|afternoon|evening|night)/i
    ]
  }
};

/**
 * Classifies user text into one of the 7 SanduIntents using weighted keyword scoring + regex pattern matching
 */
export function classifyIntent(text: string): ClassificationResult {
  const clean = text.trim().toLowerCase();
  if (!clean) {
    return { intent: 'small-talk', confidence: 0.5 };
  }

  const scores: Record<SanduIntent, number> = {
    settings: 0,
    help: 0,
    flashcard: 0,
    quote: 0,
    fitness: 0,
    language: 0,
    'small-talk': 0
  };

  // Check pattern matches (heavy weight: +5.0)
  for (const [intentKey, rule] of Object.entries(INTENT_RULES)) {
    const intent = intentKey as SanduIntent;
    for (const pattern of rule.patterns) {
      if (pattern.test(clean)) {
        scores[intent] += 5.0;
      }
    }
  }

  // Tokenize and check keywords (+1 per match)
  const tokens = clean.split(/[\s,?.!;:—]+/).filter(Boolean);
  for (const token of tokens) {
    for (const [intentKey, rule] of Object.entries(INTENT_RULES)) {
      const intent = intentKey as SanduIntent;
      if (rule.keywords.some((kw) => kw.toLowerCase() === token || clean.includes(kw.toLowerCase()))) {
        scores[intent] += 1.0;
      }
    }
  }

  // Find highest scoring intent
  let bestIntent: SanduIntent = 'small-talk';
  let maxScore = -1;

  for (const [intentKey, score] of Object.entries(scores)) {
    const intent = intentKey as SanduIntent;
    if (score > maxScore) {
      maxScore = score;
      bestIntent = intent;
    }
  }

  // If very low score, default to small-talk or general assist
  const confidence = maxScore > 0 ? Math.min(1.0, 0.4 + maxScore * 0.15) : 0.4;

  // Extract parameters if present
  const extractedParams: Record<string, any> = {};

  // Flashcard extraction: "add a flashcard: question = answer"
  const fcMatch = clean.match(/(?:add\s+(?:a\s+)?flashcard[:\s]+)(.+?)\s*=\s*(.+)/i);
  if (fcMatch) {
    extractedParams.question = fcMatch[1].trim();
    extractedParams.answer = fcMatch[2].trim();
  }

  // Fitness extraction: "log 30 min running 300 kcal" or "log 20 min cycling"
  const workoutMatch = clean.match(/log\s+(\d+)\s*(?:min|mins|minutes)?\s*([a-zA-Z]+)(?:\s+(\d+)\s*(?:kcal|calories)?)?/i);
  if (workoutMatch) {
    extractedParams.duration = parseInt(workoutMatch[1], 10);
    extractedParams.type = workoutMatch[2].toLowerCase();
    if (workoutMatch[3]) {
      extractedParams.calories = parseInt(workoutMatch[3], 10);
    }
  }

  // Steps extraction: "log 8000 steps" or "8000 steps"
  const stepsMatch = clean.match(/(\d{2,6})\s*steps/i);
  if (stepsMatch) {
    extractedParams.steps = parseInt(stepsMatch[1], 10);
  }

  // Theme extraction: "switch to dark mode"
  if (/dark\s+mode/i.test(clean)) {
    extractedParams.theme = 'dark';
  } else if (/light\s+mode/i.test(clean)) {
    extractedParams.theme = 'light';
  }

  // Language extraction: "change language to sinhala"
  if (/sinhala/i.test(clean)) {
    extractedParams.language = 'si';
  } else if (/tamil/i.test(clean)) {
    extractedParams.language = 'ta';
  } else if (/english/i.test(clean)) {
    extractedParams.language = 'en';
  }

  return {
    intent: bestIntent,
    confidence: Number(confidence.toFixed(2)),
    extractedParams
  };
}
