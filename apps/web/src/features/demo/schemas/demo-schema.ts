import * as v from 'valibot';

export const createDemoSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Name must be at least 2 characters')),
  email: v.pipe(v.string(), v.email('Invalid email format')),
  status: v.union([v.literal('active'), v.literal('inactive')]),
});

export const updateDemoSchema = v.object({
  id: v.string(),
  name: v.pipe(v.string(), v.minLength(2, 'Name must be at least 2 characters')),
  email: v.pipe(v.string(), v.email('Invalid email format')),
  status: v.union([v.literal('active'), v.literal('inactive')]),
});

export type CreateDemoInput = v.InferInput<typeof createDemoSchema>;
export type UpdateDemoInput = v.InferInput<typeof updateDemoSchema>;
