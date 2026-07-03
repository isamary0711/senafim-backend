import { z } from 'zod';

export const pesajeSchema = z.object({
    codigo_alianza: z.string().min(1, 'El código de alianza es obligatorio'),
    codigo_conductor: z.string().min(1, 'El código de conductor es obligatorio'),
    codigo_transporte: z.string().min(1, 'El código de transporte es obligatorio'),
    codigo_camion: z.string().min(1, 'El código de camión es obligatorio'),
    codigo_mina: z.string().min(1, 'El código de mina es obligatorio'),
    codigo_comprador: z.string().min(1, 'El código de comprador es obligatorio'),
    peso_bruto_kg: z.number().positive('El peso bruto debe ser mayor a 0'),
    peso_tara_kg: z.number().positive('La tara debe ser mayor a 0'),
    numero_guia: z.string().min(1, 'El número de guía es obligatorio'),
    peso_numero_guia_kg: z.number().positive('El peso de la guía debe ser mayor a 0'),
    registro_fotografico_url: z.string().optional()
});