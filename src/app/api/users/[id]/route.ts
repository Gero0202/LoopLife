import { getAuthUser, requireRole } from "@/app/lib/auth";
import pool from "@/app/lib/db";
import { NextResponse } from "next/server";


interface RouteParams {
    params: Promise<{
        id: string
    }>
}

interface UpdateData {
    name?: string
    username?: string
    email?: string
    avatar?: string
    bio?: string
    updated_at: string


}


export async function GET(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params
        const userId = parseInt(id, 10)
        if (isNaN(userId)) {
            return NextResponse.json(
                { message: "ID no valido debe ser un numero" },
                { status: 400 }
            )
        }

        const user = await getAuthUser()

        let selectColumns = 'user_id, name, avatar, username, bio'


        if (user && (user.user_id === userId || user.role === 'admin')) {
            selectColumns += ', email'
        }

        const result = await pool.query(`SELECT ${selectColumns} FROM users WHERE user_id = $1`, [userId])
        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: "No se encontro usuario con ese ID" },
                { status: 400 }
            )
        }

        return NextResponse.json({ user: result.rows[0] }, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { message: "No se pudo obtener al userid", error: error },
            { status: 500 }
        )
    }
}


export async function PUT(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params

        const userId = parseInt(id, 10)
        if (isNaN(userId)) {
            return NextResponse.json(
                { message: "ID no valido debe ser un numero" },
                { status: 400 }
            )
        }

        const authUser = await getAuthUser()
        if (!authUser) {
            return NextResponse.json(
                { message: "No estas autenticado" },
                { status: 401 }
            )
        }

        if (authUser.user_id !== userId && authUser.role !== 'admin') {
            return NextResponse.json(
                { message: "No tienes permiso para modificar este usuario" },
                { status: 403 }
            )
        }

        const existingRes = await pool.query('SELECT avatar FROM users WHERE user_id = $1', [userId])
        const existingUser = existingRes.rows[0]

        const { name, email, avatar, bio, username, updated_at } = (await req.json()) as UpdateData

        const avatarFinal = avatar?.trim() ? avatar : existingUser?.avatar || "https://i.pinimg.com/736x/3f/94/70/3f9470b34a8e3f526dbdb022f9f19cf7.jpg"


        if (username !== undefined && username.trim() === "") {
            return NextResponse.json(
                { message: "El nombre de usuario no puede estar vacio" },
                { status: 400 }
            )
        }


        if (!name || name.trim() === "") {
            return NextResponse.json(
                { message: "El nombre es obligatorio" },
                { status: 400 }
            );
        }
        if (!email || email.trim() === "") {
            return NextResponse.json(
                { message: "El email es obligatorio" },
                { status: 400 }
            );
        }

        

        const fields = { name, email, avatar: avatarFinal, bio, username, updated_at: new Date() }

        const entries = Object.entries(fields).filter(
            (([_, value]) => value !== undefined && value !== null)
        )

        if (entries.length === 0) {
            return NextResponse.json(
                { message: "Datos insuficientes para actualizar" },
                { status: 400 }
            )
        }

        if (username) {
            const check = await pool.query(
                'SELECT user_id FROM users WHERE username = $1', [username]
            )

            const usernameExists = check.rows.length > 0 && check.rows[0].user_id !== userId

            if (usernameExists) {
                return NextResponse.json(
                    { message: "El nombre de usuario ya esta en uso" },
                    { status: 409 }
                )
            }
        }

        const setClause = entries
            .map(([key], index) => `${key} = $${index + 1}`)
            .join(", ")

        const values = entries.map(([_, value]) => value)

        const sql = `UPDATE users SET ${setClause} WHERE user_id = $${entries.length + 1} RETURNING user_id, name, username ,email, avatar, bio`

        const result = await pool.query(sql, [...values, userId])

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Usuario no encontrado" },
                { status: 404 }
            )
        }

        return NextResponse.json(result.rows[0], { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { message: "Error interno al actualizar el usuario" },
            { status: 500 }
        )
    }
}


export async function DELETE(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params

        const userId = parseInt(id, 10)
        if (isNaN(userId)) {
            return NextResponse.json(
                { message: "ID no valido debe ser un numero" },
                { status: 400 }
            )
        }

        const authUser = await getAuthUser()
        if (!authUser) {
            return NextResponse.json(
                { message: "No estas autenticado" },
                { status: 401 }
            )
        }

        if (authUser.user_id !== userId && authUser.role !== 'admin') {
            return NextResponse.json(
                { message: "No tienes permiso para eliminar este usuario" },
                { status: 403 }
            )
        }
        

        const result = await pool.query(`DELETE FROM users WHERE user_id = $1`, [userId])
        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "No existe usuario con ese ID" },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: "Usuario eliminado correctamente" },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { message: "No se pudo eliminar al usuario", error: error },
            { status: 500 }
        )
    }

}

