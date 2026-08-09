/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import('prettier').Config}
 */
const config = {
  singleQuote: true,
  semi: true,
  trailingComma: 'none',
  tabWidth: 2,
  bracketSameLine: false,
  endOfLine: 'lf',
  printWidth: 100,
  arrowParens: 'always',
  // CSS is tab-indented — CONVENTIONS §5, inherited from the house component
  // ruleset. Without this prettier would quietly convert every stylesheet to
  // spaces, so the rule and the formatter would disagree and the formatter
  // would win. This block is part of the canonical config: identical in all
  // four repos, not a per-repo override.
  overrides: [
    {
      files: '*.css',
      options: { useTabs: true }
    }
  ]
};

export default config;
