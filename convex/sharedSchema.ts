import { z } from 'zod';

export const createSpaceSchema = z.object({
  title: z.string().min(3, {
    message: 'El nombre del espacio debe tener al menos 3 caracteres.'
  }),
  imagePicsumId: z
    .number()
    .min(-1, { message: 'ID de imagen no válido.' })
    .max(1084, { message: 'ID de imagen no válido.' })
});
export type CreateSpaceSchema = z.infer<typeof createSpaceSchema>;
