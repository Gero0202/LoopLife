import { createTransport } from "nodemailer";

const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_PASS
    }
});

const sendEmailOfRegister = async ({ email, verifyCode }: { email: string, verifyCode: string }) => {
    await transporter.sendMail({
        from: `Loop Life <${process.env.GOOGLE_EMAIL}>`,
        to: email,
        subject: "Verifica tu cuenta",
        html: `
            <h1>¡Gracias por registrarte en Loop Life!</h1>
            <p>Para verificar tu cuenta, usa el siguiente código:</p>
            <h2>${verifyCode}</h2>
            <p>Puedes copiar y pegar este código en la página de verificación.</p>
            <p>VERIFICA Y CREA!</p>
        `
    });
};

export default sendEmailOfRegister;