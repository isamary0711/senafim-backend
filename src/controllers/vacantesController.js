import { pool } from '../config/db.js';
import { enviarCorreoConfirmacion } from '../services/emailService.js'; 

// 1. Obtener vacantes activas (Para la vista de la web side pública)
export const obtenerVacantesActivas = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM vacantes WHERE activa = true ORDER BY fecha_publicacion DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error al obtener vacantes activas:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 2. Obtener todas las vacantes (Para el panel privado del jefe)
export const obtenerTodasLasVacantes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vacantes ORDER BY fecha_publicacion DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error al obtener todas las vacantes:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 3. Crear una nueva vacante (Ejecutado por el Jefe/Admin)
export const crearVacante = async (req, res) => {
    try {
        const { titulo_vacante, descripcion_puesto, id_rol_cargo } = req.body;

        if (!titulo_vacante || !descripcion_puesto || !id_rol_cargo) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }

        const result = await pool.query(
            'INSERT INTO vacantes (titulo_vacante, descripcion_puesto, id_rol_cargo) VALUES ($1, $2, $3) RETURNING *',
            [titulo_vacante, descripcion_puesto, id_rol_cargo]
        );

        res.status(201).json({
            mensaje: 'Vacante publicada con éxito.',
            vacante: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Error al crear vacante:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 4. Eliminar/Desactivar vacante (Borrado lógico de seguridad)
export const eliminarVacante = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE vacantes SET activa = false WHERE id_vacante = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Vacante no encontrada.' });
        }

        res.json({ mensaje: 'Vacante retirada de la web side con éxito.' });
    } catch (error) {
        console.error('❌ Error al eliminar vacante:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 5. Procesar formulario de postulación (Página Web Pública + Envío de Email Real)
export const postularseAVacante = async (req, res) => {
    let client; 

    try {
        client = await pool.connect();

        const { id_vacante, nombre_completo, cedula, telefono, correo_contacto, cv_archivo_pdf } = req.body;

        if (!id_vacante || !nombre_completo || !cedula || !telefono || !correo_contacto || !cv_archivo_pdf) {
            return res.status(400).json({ error: 'Faltan campos obligatorios en el formulario.' });
        }

        await client.query('BEGIN');

        const aspiranteResult = await client.query(
            `INSERT INTO aspirantes_vacantes (nombre_completo, cedula, telefono, correo_contacto, cv_archivo_pdf)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (cedula) 
             DO UPDATE SET nombre_completo = $1, telefono = $3, correo_contacto = $4, cv_archivo_pdf = $5
             RETURNING id_aspirante`,
            [nombre_completo, cedula, telefono, correo_contacto, cv_archivo_pdf]
        );

        const id_aspirante = aspiranteResult.rows[0].id_aspirante;

        await client.query(
            'INSERT INTO postulaciones (id_aspirante, id_vacante) VALUES ($1, $2)',
            [id_aspirante, id_vacante]
        );

        await client.query('COMMIT');

        // Disparo automático de correo
        enviarCorreoConfirmacion(correo_contacto, nombre_completo);

        res.status(201).json({ 
            mensaje: 'Formulario de postulación enviado correctamente. Notificación de confirmación remitida al correo del aspirante.' 
        });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('❌ Error en el proceso de postulación:', error);
        res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.' });
    } finally {
        if (client) client.release();
    }
};

// 6. Revisar postulaciones (Para el Panel del Jefe)
export const obtenerPostulacionesRecibidas = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.id_postulacion, p.fecha_postulacion, p.estado_postulacion, p.observaciones,
                    a.nombre_completo, a.cedula, a.telefono, a.correo_contacto, a.cv_archivo_pdf,
                    v.titulo_vacante
             FROM postulaciones p
             INNER JOIN aspirantes_vacantes a ON p.id_aspirante = a.id_aspirante
             INNER JOIN vacantes v ON p.id_vacante = v.id_vacante
             ORDER BY p.fecha_postulacion DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error al obtener postulaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};