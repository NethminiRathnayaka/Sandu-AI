/**
 * Web Speech API text-to-speech and speech-to-text wrapper
 */

export interface SpeakOptions {
  text: string;
  lang?: string; // 'en-US', 'si-LK', 'ta-IN'
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

/**
 * Speaks text using the browser's speechSynthesis with language-specific voice fallback
 */
export function speakText({
  text,
  lang = 'en-US',
  rate = 1.0,
  pitch = 1.1,
  onStart,
  onEnd,
  onError
}: SpeakOptions): void {
  if (!isSpeechSynthesisSupported()) {
    if (onError) onError('Speech synthesis not supported');
    return;
  }

  try {
    // Cancel any ongoing utterance
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Look for exact lang match, or prefix match (e.g. 'ta' in 'ta-IN')
      const targetPrefix = lang.split('-')[0].toLowerCase();
      const match =
        voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix)) ||
        voices.find((v) => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('natural'));

      if (match) {
        utterance.voice = match;
      }
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
    if (onError) onError(err);
  }
}

/**
 * Starts speech recognition if supported
 */
export function createSpeechRecognizer(
  onResult: (transcript: string) => void,
  onError?: (error: any) => void,
  lang = 'en-US'
) {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognizer = new SpeechRec();
  recognizer.continuous = false;
  recognizer.interimResults = false;
  recognizer.lang = lang;

  recognizer.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognizer.onerror = (err: any) => {
    if (onError) onError(err);
  };

  return recognizer;
}
