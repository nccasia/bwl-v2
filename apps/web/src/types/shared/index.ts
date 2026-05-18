export * from './base-api';

export interface BaseEmoji {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
  version: number;
}
