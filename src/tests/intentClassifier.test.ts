import { describe, it, expect } from 'vitest';
import { classifyIntent } from '../ai/intentClassifier';

describe('On-device Intent Classifier', () => {
  it('correctly classifies flashcard and study intents', () => {
    expect(classifyIntent('quiz me on flashcards').intent).toBe('flashcard');
    expect(classifyIntent('add a flashcard: sun = star').intent).toBe('flashcard');
    expect(classifyIntent('මගේ ෆ්ලෑෂ් කාඩ්පත් බලන්න').intent).toBe('flashcard');
  });

  it('correctly classifies quote and motivation intents', () => {
    expect(classifyIntent('give me a new quote').intent).toBe('quote');
    expect(classifyIntent('inspire me today').intent).toBe('quote');
    expect(classifyIntent('දිරිගන්වන උපුටනයක් දෙන්න').intent).toBe('quote');
  });

  it('correctly classifies fitness intents and extracts params', () => {
    const result = classifyIntent('log 30 min running 300 kcal');
    expect(result.intent).toBe('fitness');
    expect(result.extractedParams?.duration).toBe(30);
    expect(result.extractedParams?.type).toBe('running');
    expect(result.extractedParams?.calories).toBe(300);
  });

  it('correctly classifies language learning intents', () => {
    expect(classifyIntent('teach me sinhala words').intent).toBe('language');
    expect(classifyIntent('how do you say thank you in tamil').intent).toBe('language');
    expect(classifyIntent('දෙමළ භාෂාව ඉගෙන ගන්න').intent).toBe('language');
  });

  it('correctly classifies settings intents', () => {
    expect(classifyIntent('switch to dark mode').intent).toBe('settings');
    expect(classifyIntent('change language to tamil').intent).toBe('settings');
  });

  it('correctly classifies help and guide intents', () => {
    expect(classifyIntent('show me around the app').intent).toBe('help');
    expect(classifyIntent('how does SM-2 work').intent).toBe('help');
  });

  it('correctly classifies small-talk intents', () => {
    expect(classifyIntent('hello sandu!').intent).toBe('small-talk');
    expect(classifyIntent('good morning').intent).toBe('small-talk');
  });
});
