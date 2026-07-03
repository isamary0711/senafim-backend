import bcrypt from 'bcrypt';
import { pool } from './src/config/db.js';

const forzarClave = async () => {
    try {
        console.log("=========================================");
        console.log("🛠️ INICIANDO INYECCIÓN DIRECTA DE CLAVE");
        
        // 1. Generamos el hash puro sin contaminación
        const hash = await bcrypt.hash('admin123', 10);
        console.log("✅ Hash matemático generado.");

        // 2. Lo enviamos directamente a Neon por el túnel de Node.js
        const resultado = await pool.query(
            'UPDATE usuarios SET password = $1 WHERE correo = $2 RETURNING id', 
            [hash, 'admin@senafim.com']
        );

        if (resultado.rowCount > 0) {
            console.log("✅ ¡ÉXITO! Clave guardada perfectamente en Neon.");
            console.log("🔐 Tu contraseña ahora es: admin123");
        } else {
            console.log("❌ Error: No se encontró el correo admin@senafim.com");
        }

        console.log("=========================================");
        process.exit(0); // Apaga el script correctamente
    } catch (error) {
        console.error("❌ Error en la base de datos:", error);
        process.exit(1);
    }
};

forzarClave();