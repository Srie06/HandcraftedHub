import i18n, { SUPPORTED_LANGUAGES } from '../config';

describe('i18n Configuration', () => {
  it('should have all 10 supported languages configured', () => {
    const languageCodes = Object.keys(SUPPORTED_LANGUAGES);
    expect(languageCodes).toHaveLength(10);
    expect(languageCodes).toContain('en');
    expect(languageCodes).toContain('hi');
    expect(languageCodes).toContain('ta');
    expect(languageCodes).toContain('te');
    expect(languageCodes).toContain('bn');
    expect(languageCodes).toContain('mr');
    expect(languageCodes).toContain('gu');
    expect(languageCodes).toContain('kn');
    expect(languageCodes).toContain('ml');
    expect(languageCodes).toContain('pa');
  });

  it('should have native names for all languages', () => {
    Object.entries(SUPPORTED_LANGUAGES).forEach(([code, lang]) => {
      expect(lang.nativeName).toBeDefined();
      expect(lang.nativeName.length).toBeGreaterThan(0);
    });
  });

  it('should have English names for all languages', () => {
    Object.entries(SUPPORTED_LANGUAGES).forEach(([code, lang]) => {
      expect(lang.name).toBeDefined();
      expect(lang.name.length).toBeGreaterThan(0);
    });
  });

  it('should have RTL flag for all languages', () => {
    Object.entries(SUPPORTED_LANGUAGES).forEach(([code, lang]) => {
      expect(typeof lang.rtl).toBe('boolean');
    });
  });

  it('should initialize i18n with correct fallback language', () => {
    const fallbackLng = i18n.options.fallbackLng;
    // fallbackLng can be a string or array
    if (Array.isArray(fallbackLng)) {
      expect(fallbackLng).toContain('en');
    } else {
      expect(fallbackLng).toEqual('en');
    }
  });

  it('should support all configured languages', () => {
    const supportedLngs = i18n.options.supportedLngs;
    expect(supportedLngs).toContain('en');
    expect(supportedLngs).toContain('hi');
    expect(supportedLngs).toContain('ta');
  });
});
