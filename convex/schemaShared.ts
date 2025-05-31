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

export const createMessageSchema = z.object({
  body: z
    .string()
    .min(1, {
      message: 'El mensaje no puede estar vacío.'
    })
    .max(500, {
      message: 'El mensaje no puede superar los 500 caracteres.'
    })
});
export type CreateMessageSchema = z.infer<typeof createMessageSchema>;
