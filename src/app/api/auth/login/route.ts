import pool from "@/app/lib/db";
import { NextResponse } from "next/server";
import { comparePassword } from "@/app/lib/hash";
import jwt from "jsonwebtoken";


interface LoginData {
    email: string;
    password: string
}

const JWT_SECRET = process.env.JWT_SECRET!
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no esta definida en las variables de entorno")
}

export async function POST(req: Request) {
    try {
        const { email, password } = (await req.json()) as LoginData
        if (!email || !password) {
            return NextResponse.json(
                { message: "Faltan campos obligatorios: email y password" },
                { status: 400 }
            )
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        const user = result.rows[0]
        

        if (!user) {
            return NextResponse.json(
                { message: "Credenciales invalidas" },
                { status: 401 }
            )
        }

        if (!user.is_verified) {
            return NextResponse.json(
                { message: "Credenciales invalidas" },
                { status: 401 }
            );
        }

        const paswordMatch = await comparePassword(password, user.password)
        if (!paswordMatch) {
            return NextResponse.json(
                { message: "Credenciales invalidas" },
                { status: 401 }
            )
        }

       
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' } 
        );


        const response = NextResponse.json({
            message: 'Login exitoso',
            user: {
                user_id: user.user_id,
                email: user.email,
                name: user.name,
                username: user.username,
                avatar: user.avatar,
                role: user.role,
                bio: user.bio
            }
        })

        response.cookies.set('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        })

        return response

    } catch (error) {
        return NextResponse.json(
            { message: "Error interval server para el login", error },
            { status: 500 }
        )
    }
}