
export enum Locale {
  EN = 'en',
  JP = 'jp',
}

export const LOCALES = {
  [Locale.EN]: {
    code: Locale.EN,
    label: 'English',
    flag: '/flags/us.svg',
  },
  [Locale.JP]: {
    code: Locale.JP,
    label: '日本語',
    flag: '/flags/jp.svg',
  },
};

// Load more locales flags from https://flagcdn.com/{locale}.svg