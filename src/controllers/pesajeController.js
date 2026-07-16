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
        
        // Cálculo del Peso Neto (Validación de seguridad en el backend)
        const peso_neto_kg = parseFloat(datos.peso_bruto_kg) - parseFloat(datos.peso_tara_kg);
        
        if (peso_neto_kg <= 0) {
            return res.status(400).json({ error: 'El peso bruto debe ser mayor a la tara.' });
        }

        // Captura segura del ID de usuario (Dependiendo de cómo lo llame tu middleware)
        const usuario_id = req.usuario?.id || req.user?.id || req.user?.USUARI_ID; 

        if (!usuario_id) {
            return res.status(401).json({ error: 'Falta identificación del usuario en el token.' });
        }

        // LÓGICA DEL TICKET: Buscar el último consecutivo de ESTE mes en la tabla estandarizada (TT_PESAJE)
        const ticketResult = await client.query(`
            SELECT COALESCE(MAX("PESAJE_TK"), 0) + 1 AS siguiente_ticket
            FROM "TT_PESAJE"
            WHERE EXTRACT(MONTH FROM "PESAJE_FR") = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(YEAR FROM "PESAJE_FR") = EXTRACT(YEAR FROM CURRENT_DATE)
        `);
        const consecutivo_ticket = ticketResult.rows[0].siguiente_ticket;

        // Inserción utilizando los nombres de campos estandarizados (PESAJE_XX)
        const query = `
            INSERT INTO "TT_PESAJE" (
                "PESAJE_TK", "PESAJE_IU", "PESAJE_CA", "PESAJE_CC", 
                "PESAJE_TR", "PESAJE_CM", "PESAJE_MI", "PESAJE_CP", 
                "PESAJE_PB", "PESAJE_PT", "PESAJE_PN", "PESAJE_NG", "PESAJE_PG", "PESAJE_RF"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING "PESAJE_TK" AS consecutivo_ticket, "PESAJE_PN" AS peso_neto_kg;
        `;
        
        const valores = [
            consecutivo_ticket, 
            usuario_id, 
            datos.codigo_alianza, 
            datos.codigo_conductor, 
            datos.codigo_transporte, 
            datos.codigo_camion, 
            datos.codigo_mina, 
            datos.codigo_comprador, 
            datos.peso_bruto_kg, 
            datos.peso_tara_kg, 
            peso_neto_kg, 
            datos.numero_guia, 
            datos.peso_numero_guia_kg, 
            datos.registro_fotografico_url || null
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

// 2. Obtener el historial (Adaptado a las nuevas tablas relacionadas Estandarizadas)
export const obtenerHistorialPesajes = async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        
        // Hacemos LEFT JOIN a las tablas Maestras (TM_) y alias para que el Frontend de React lo entienda sin cambiar nada
        const query = `
            SELECT 
                p."PESAJE_ID" AS id_registro, 
                p."PESAJE_TK" AS consecutivo_ticket, 
                p."PESAJE_FR" AS fecha_registro, 
                p."PESAJE_HR" AS hora_registro, 
                cam."CAMION_PL" AS placa, 
                cond."CONDUC_NO" AS chofer, 
                m."ZMINAS_NE" AS mina, 
                comp."COMPRA_RS" AS comprador, 
                p."PESAJE_PN" AS peso_neto_kg, 
                p."PESAJE_NG" AS numero_guia
            FROM "TT_PESAJE" p
            LEFT JOIN "TM_CAMION" cam ON p."PESAJE_CM" = cam."CAMION_CO"
            LEFT JOIN "TM_CONDUC" cond ON p."PESAJE_CC" = cond."CONDUC_CO"
            LEFT JOIN "TM_ZMINAS" m ON p."PESAJE_MI" = m."ZMINAS_CO"
            LEFT JOIN "TM_COMPRA" comp ON p."PESAJE_CP" = comp."COMPRA_CO"
            ORDER BY p."PESAJE_FR" DESC, p."PESAJE_HR" DESC;
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