import { z } from 'zod';

// Este esquema define qué es un "login válido"
export const loginSchema = z.object({
    correo: z.string().email('El formato del correo no es válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});