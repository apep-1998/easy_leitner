import { z } from "zod";

export const StandardCardConfigSchema = z.object({
  type: z.literal("standard"),
  front: z.string(),
  back: z.string(),
});

export const SpellingCardConfigSchema = z.object({
  type: z.literal("spelling"),
  voice_file_url: z.string().url(),
  spelling: z.string(),
});

export const CardConfigSchema = z.union([
  StandardCardConfigSchema,
  SpellingCardConfigSchema,
]);

export const BoxSchema = z.object({
  id: z.string().optional(),
  name: z.string().max(200),
  userId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const CardSchema = z.object({
  id: z.string().optional(),
  config: z.union([StandardCardConfigSchema, SpellingCardConfigSchema]),
  boxId: z.string(),
  userId: z.string(),
  finished: z.boolean().default(false),
  level: z.number().default(0),
  nextReviewTime: z.date().default(() => new Date()),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Box = z.infer<typeof BoxSchema>;
export type Card = z.infer<typeof CardSchema>;
export type CardConfig = z.infer<typeof CardConfigSchema>;
export type SpellingCardConfig = z.infer<typeof SpellingCardConfigSchema>;
export type StandardCardConfig = z.infer<typeof StandardCardConfigSchema>;
