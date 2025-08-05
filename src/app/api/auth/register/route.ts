import pool from "@/app/lib/db";
import { NextResponse } from "next/server";
import { hashpassword } from "@/app/lib/hash";
import { buildInsertQuery } from "@/app/lib/insertBuilder";
import sendEmailOfRegister from "@/app/lib/email";

interface RegisterData {
    username: string;
    name: string;
    email: string;
    password: string; 
    avatar?: string;
    bio?: string;
}


export async function POST(req: Request) {
    const client = await pool.connect(); 
    try {
        await client.query('BEGIN');

        const body = (await req.json()) as RegisterData;
        const { username, name, email, password, avatar, bio } = body;

        
        if (!username || username.length < 3 || username.length > 50 || !name || name.length < 2 || name.length > 70 || !email || !password || password.length < 8) {
            await client.query('ROLLBACK'); 
            return NextResponse.json(
                { message: "Datos de registro invalidos. Por favor, revisa que todos los campos estén completos y cumplan los requisitos." },
                { status: 400 }
            );
        }

        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            await client.query('ROLLBACK'); 
            return NextResponse.json(
                { message: "El formato de email no es valido" },
                { status: 400 }
            );
        }

        
        const emailCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            await client.query('ROLLBACK'); 
            return NextResponse.json(
                { message: "El registro no se pudo completar. Por favor, revisa tus datos." },
                { status: 400 }
            );
        }

        const hashedPassword = await hashpassword(password);

        const defaultAvatar = "https://i.pinimg.com/736x/3f/94/70/3f9470b34a8e3f526dbdb022f9f19cf7.jpg";
        const finalAvatar = avatar || defaultAvatar;

        const forwardedFor = req.headers.get('x-forwarded-for');
        const ip =
            (forwardedFor?.split(",")[0]?.trim()) ||
            (req.headers.get("x-real-ip")) ||
            "IP no disponible";


       
        const checkLimit = await client.query(`
            SELECT COUNT(*) FROM users 
            WHERE ip_address = $1 AND created_at >= NOW() - INTERVAL '5 days'
        `, [ip]);

        const registrosRecientes = parseInt(checkLimit.rows[0].count, 10);

        if (registrosRecientes >= 3) {
            await client.query('ROLLBACK'); 
            return NextResponse.json(
                { message: "Se ha alcanzado el limite de registros desde esta IP en los ultimos 5 días" },
                { status: 429 }
            );
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        const userData = {
            username,
            name,
            email,
            password: hashedPassword,
            avatar: finalAvatar,
            bio,
            role: 'user',
            ip_address: ip,
            verify_code: verifyCode,
            is_verified: false,
            created_at: new Date(),
            updated_at: new Date()
        };

        const { text, values } = buildInsertQuery('users', userData, ['user_id', 'name', 'username', 'email', 'avatar', 'bio', 'role', 'created_at']);
        const result = await client.query(text, values);

        
        await sendEmailOfRegister({ email, verifyCode });
        await client.query('COMMIT'); 

        return NextResponse.json(result.rows[0], { status: 201 });

    } catch (error) {
        await client.query('ROLLBACK'); 
    
        
        return NextResponse.json(
            { message: "Error interno del servidor al registrar usuario." },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

