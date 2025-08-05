import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/auth";
import pool from "@/app/lib/db";
import { hashpassword, comparePassword } from "@/app/lib/hash";

interface Params {
    params: Promise<{ 
        id: string 
    }>
}

export async function PUT(req: Request, { params }: Params) {
    try {
        const { id } = await params
        const userId = parseInt(id, 10)
        if (isNaN(userId)) {
            return NextResponse.json(
                { message: "ID invalido" },
                { status: 400 }
            )
        }

        const authUser = await getAuthUser()
        if (!authUser) {
            return NextResponse.json(
                { message: "No autenticado" },
                { status: 401 }
            )
        }

        if (authUser.user_id !== userId ) {
            return NextResponse.json(
                { message: "No autorizado" },
                { status: 403 }
            )
        }

        const body = await req.json()
        const { currentPassword, newPassword } = body


        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { message: "Faltan datos" },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { message: "Contraseña muy corta" },
                { status: 400 }
            )
        }

        const result = await pool.query(
            'SELECT password FROM users WHERE user_id = $1',[userId]
        )

        const user = result.rows[0]
        if (!user) {
            return NextResponse.json(
                { message: "Usuario no encontrado" },
                { status: 404 }
            )
        }

        const isMatch = await comparePassword(currentPassword, user.password)
        if (!isMatch) {
            return NextResponse.json(
                { message: "Contraseña actual incorrecta" },
                { status: 401 }
            )
        }

        const hashedNewPassowrd = await hashpassword(newPassword)

        await pool.query(
            'UPDATE users SET password = $1 WHERE user_id = $2', [hashedNewPassowrd, userId]
        )

        return NextResponse.json({ message: "Contraseña actualizada" })

    } catch (error) {
        return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
    }
}