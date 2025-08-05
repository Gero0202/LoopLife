import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/auth";
import pool from "@/app/lib/db";

export async function GET() {
    try {
        const userPayload = await getAuthUser()

        if (!userPayload) {
            return NextResponse.json(
                { message: 'No autenticado' },
                { status: 401 }
            )
        }

        const result = await pool.query('SELECT user_id, email, username, avatar, role, name, bio FROM users WHERE user_id = $1', [userPayload.user_id]);
        const user = result.rows[0]

        if (!user) {
            return NextResponse.json(
                { message: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Estas autenticado',
            user: {
                user_id: user.user_id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                role: user.role,
                name: user.name,
                bio: user.bio,
            }
        })
    } catch (error) {
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}