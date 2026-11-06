import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const jurnal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/jurnal' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    readMinutes: z.number(),
    tone: z.enum(['lime', 'forest', 'paper']).default('paper'),
  }),
});

export const collections = { jurnal };
