import i18n from '../config';

describe('formatted undefined interpolation variables', () => {
  it('renders a formatted undefined variable as an empty string', () => {
    i18n.addResourceBundle(
      'en',
      'translation',
      { 'test.formattedUndefined': 'Amount: {{amount, number}}' },
      true,
      true
    );

    const result = i18n.t('test.formattedUndefined', {
      lng: 'en',
      amount: undefined,
    });

    expect(result).toBe('Amount: ');
  });
});
