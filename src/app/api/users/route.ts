import { requireRole } from "@/app/lib/auth";
import pool from "@/app/lib/db";
import { hashpassword } from "@/app/lib/hash";
import { NextResponse } from "next/server";

interface UserData {
    username: string,
    name: string,
    email: string,
    password: string,
    avatar?: string,
    bio?: string,
    role?: string | "user"
    is_verified: boolean
}

interface GetUserData {
    user_id: number;
    username: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    role: string;
    created_at: Date;
}

export async function GET(req: Request) {
    try {
        const auth = await requireRole(['admin'])
        if (!auth) {
            return NextResponse.json(
                { message: "No tenes permisos para ver los usuarios" },
                { status: 403 }
            )
        }
        const result = await pool.query<GetUserData>(
            `SELECT user_id, username, name, email, avatar, bio, role, created_at FROM users`
        );
        return NextResponse.json(result.rows, { status: 200 })
    } catch (error) {

        return NextResponse.json(
            { message: "Error al intentar obtener usuarios: ", error: error },
            { status: 500 }
        )
    }
}


export async function POST(req: Request) {
    try {
        const auth = await requireRole(['admin'])
        const { name, username, email, password, avatar, bio, role, is_verified } = (await req.json()) as UserData

        if (!name || !username || username.length > 50 || !email || !password) {
            return NextResponse.json(
                { message: "Faltan algunos de los campos obligatorios: Nombre, email y contraseña" },
                { status: 400 }
            )
        }


        const hashedPassowrd = await hashpassword(password)

        const defaultAvatar = "https://i.pinimg.com/736x/3f/94/70/3f9470b34a8e3f526dbdb022f9f19cf7.jpg"
        const finalAvatar = avatar || defaultAvatar

        const columns = ['name', 'username', 'email', 'password', 'avatar', 'bio', 'role', 'is_verified']
        const placeholders = ['$1', '$2', '$3', '$4', '$5', '$6', '$7']
        const values = [name, username, email, hashedPassowrd, finalAvatar, bio, role, is_verified]

        const filteredColumns = []
        const filteredPlaceholders = []
        const filteredValues = []

        for (let i = 0; i < columns.length; i++) {
            if (values[i] !== undefined && values[i] !== null) {
                filteredColumns.push(columns[i])
                filteredPlaceholders.push(`$${filteredValues.length + 1}`)
                filteredValues.push(values[i])
            }
        }

        if (filteredColumns.length === 0) {
            return NextResponse.json(
                { message: "No se porpocionaron datos validos para crear el usuario." },
                { status: 400 }
            )
        }

        const sql = `INSERT INTO users (${filteredColumns.join(', ')}) VALUES (${filteredPlaceholders.join(', ')}) RETURNING user_id, username ,name, email, role, bio;`

        const result = await pool.query(sql, filteredValues)

        return NextResponse.json(result.rows[0], { status: 201 })
    } catch (error) {
        const isDatabaseError = (e: any): e is { code: string; constraint: string } => {
            return (
                e instanceof Object &&
                'code' in e &&
                typeof e.code === 'string' &&
                'constraint' in e &&
                typeof e.constraint === 'string'
            );
        };

        if (isDatabaseError(error) && error.code === '23505' && error.constraint.includes('email')) {
            return NextResponse.json(
                { message: 'El email proporcionado ya está registrado' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Error interno del servidor al intentar crear usuario: ", error: error },
            { status: 500 }
        )
    }
}

