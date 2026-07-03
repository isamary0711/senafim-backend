import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuramos el "transporte" (el motor que enviará los correos)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Puedes cambiarlo si usas otro proveedor (Outlook, Hostinger, etc.)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const enviarCorreoConfirmacion = async (correoDestino, nombreAspirante) => {
    try {
        const mailOptions = {
            from: `"Talento SENAFIM" <${process.env.EMAIL_USER}>`,
            to: correoDestino,
            subject: 'Confirmación de Postulación - SENAFIM Táchira',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                
                <div style="background-color: #ffffff; padding: 20px; border-bottom: 1px solid #eeeeee; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="color: #1a2b4c; margin: 0;">Confirmación de Postulación</h2>
                    <img src="https://i.postimg.cc/TPTn2R2j/senafim-logo-blanco.png" alt="Logo SENAFIM" style="max-height: 50px;" />
                </div>

                <div style="background-color: #f8f9fa; padding: 30px; color: #333333;">
                    <p style="font-size: 18px; color: #1a2b4c; font-weight: bold; margin-top: 0;">Estimado(a) ${nombreAspirante},</p>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        Hemos recibido tu CV exitosamente y nuestro equipo lo está revisando 
                        cuidadosamente, al completar la verificación del mismo te contactaremos 
                        por esta misma vía.
                    </p>
                    
                    <p style="font-size: 16px; color: #0a2540; font-weight: bold;">
                        Muchas Gracias por confiar en SENAFIM TÁCHIRA.
                    </p>
                </div>
            </div>
            `
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);
        console.log(`✉️ Correo de confirmación enviado con éxito a: ${correoDestino}`);
    } catch (error) {
        console.error('❌ Error al enviar el correo de confirmación:', error);
    }
};