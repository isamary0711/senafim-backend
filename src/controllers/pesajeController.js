import { pool } from '../config/db.js';
import { pesajeSchema } from '../schemas/pesajeSchema.js';

// 1. Registrar un nuevo pesaje industrial
export const registrarPesaje = async (req, res) => {
    let client;
    try {
        const validacion = pesajeSchema.safeParse(req.body);
        if (!validacion.success) {
            return res.status(400).json({ error: 'Datos inválidos', detalles: validacion.error.errors });
        }

        client = await pool.connect();
        const datos = validacion.data;
        
        // Cálculo del Peso Neto
        const peso_neto_kg = datos.peso_bruto_kg - datos.peso_tara_kg;
        const usuario_id = req.usuario.id; 

        // LÓGICA DEL TICKET: Buscar el último consecutivo de ESTE mes y sumar 1
        const ticketResult = await client.query(`
            SELECT COALESCE(MAX(consecutivo_ticket), 0) + 1 AS siguiente_ticket
            FROM registro_pesaje
            WHERE EXTRACT(MONTH FROM fecha_registro) = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(YEAR FROM fecha_registro) = EXTRACT(YEAR FROM CURRENT_DATE)
        `);
        const consecutivo_ticket = ticketResult.rows[0].siguiente_ticket;

        const query = `
            INSERT INTO registro_pesaje (
                consecutivo_ticket, id_usuario, codigo_alianza, codigo_conductor, 
                codigo_transporte, codigo_camion, codigo_mina, codigo_comprador, 
                peso_bruto_kg, peso_tara_kg, peso_neto_kg, numero_guia, peso_numero_guia_kg, registro_fotografico_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *;
        `;
        
        const valores = [
            consecutivo_ticket, usuario_id, datos.codigo_alianza, datos.codigo_conductor, 
            datos.codigo_transporte, datos.codigo_camion, datos.codigo_mina, datos.codigo_comprador, 
            datos.peso_bruto_kg, datos.peso_tara_kg, peso_neto_kg, datos.numero_guia, datos.peso_numero_guia_kg, datos.registro_fotografico_url || null
        ];

        const result = await client.query(query, valores);

        res.status(201).json({ 
            mensaje: 'Ticket industrial registrado con éxito.', 
            pesaje: result.rows[0] 
        });

    } catch (error) {
        console.error('❌ Error al registrar pesaje en La Romana:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al procesar el pesaje.' });
    } finally {
        if (client) client.release();
    }
};

// 2. Obtener el historial (Adaptado a las nuevas tablas relacionadas)
export const obtenerHistorialPesajes = async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        
        // Hacemos JOIN para traer los nombres legibles en lugar de solo los códigos
        const query = `
            SELECT r.id_registro, r.consecutivo_ticket, r.fecha_registro, r.hora_registro, 
                   cam.placa, cond.nombre_conductor, m.nombre_encargado AS mina, 
                   comp.razon_social AS comprador, r.peso_neto_kg, r.numero_guia
            FROM registro_pesaje r
            JOIN camiones cam ON r.codigo_camion = cam.codigo_camion
            JOIN conductores cond ON r.codigo_conductor = cond.codigo_conductor
            JOIN minas m ON r.codigo_mina = m.codigo_mina
            JOIN compradores comp ON r.codigo_comprador = comp.codigo_comprador
            ORDER BY r.fecha_registro DESC, r.hora_registro DESC;
        `;
        
        const result = await client.query(query);
        res.status(200).json(result.rows);
        
    } catch (error) {
        console.error('❌ Error al obtener el historial de pesajes:', error.message);
        res.status(500).json({ error: 'Error interno al consultar la base de datos.' });
    } finally {
        if (client) client.release();
    }
};