import { describe, it, expect } from 'vitest';
import en from '../i18n/locales/en.json';
import si from '../i18n/locales/si.json';
import ta from '../i18n/locales/ta.json';

function getDeepKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getDeepKeys(value, fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys.sort();
}

describe('i18n Key Parity', () => {
  const enKeys = getDeepKeys(en);
  const siKeys = getDeepKeys(si);
  const taKeys = getDeepKeys(ta);

  it('English and Sinhala locale files have identical keys', () => {
    const missingInSi = enKeys.filter((k) => !siKeys.includes(k));
    const extraInSi = siKeys.filter((k) => !enKeys.includes(k));

    expect(missingInSi, `Keys missing in Sinhala: ${missingInSi.join(', ')}`).toEqual([]);
    expect(extraInSi, `Extra keys in Sinhala: ${extraInSi.join(', ')}`).toEqual([]);
    expect(siKeys.length).toBe(enKeys.length);
  });

  it('English and Tamil locale files have identical keys', () => {
    const missingInTa = enKeys.filter((k) => !taKeys.includes(k));
    const extraInTa = taKeys.filter((k) => !enKeys.includes(k));

    expect(missingInTa, `Keys missing in Tamil: ${missingInTa.join(', ')}`).toEqual([]);
    expect(extraInTa, `Extra keys in Tamil: ${extraInTa.join(', ')}`).toEqual([]);
    expect(taKeys.length).toBe(enKeys.length);
  });
});
