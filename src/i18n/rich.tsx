import { Fragment, ReactNode } from 'react';
import { tokenize, Translator, Vars } from './translate';

export type Tags = Record<string, (chunk: string) => ReactNode>;

export interface RichTranslator {
  (key: string, tags: Tags, vars?: Vars): ReactNode;
}

// an unmapped tag renders its own words rather than disappearing with them
export const richFrom =
  (t: Translator): RichTranslator =>
  (key, tags, vars) => {
    const tokens = tokenize(t(key, vars));

    return tokens.map((token, index) => {
      const rendered = 'tag' in token ? (tags[token.tag]?.(token.text) ?? token.text) : token.text;

      return <Fragment key={index}>{rendered}</Fragment>;
    });
  };
