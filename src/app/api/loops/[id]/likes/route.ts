import pool from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/auth";

interface ParamRouter {
    params: Promise<{
        id: string
    }>
}

export async function POST(req: Request, { params }: ParamRouter) {
    try {

        const { id } = await params
        const loopId = parseInt(id, 10)
        if (isNaN(loopId)) {
            return NextResponse.json(
                { message: "ID del loop no es valido" },
                { status: 400 }
            )
        }

        const userObj = await getAuthUser()
        if (!userObj) {
            return NextResponse.json(
                { message: "Solo los usuarios pueden dar like" },
                { status: 400 }
            )
        }
        const userId = userObj.user_id


        const loopCheck = await pool.query('SELECT 1 FROM loops WHERE loop_id = $1', [loopId])

        if (loopCheck.rowCount === 0) {
            return NextResponse.json(
                { message: "El loop al que intentás dar like no existe" },
                { status: 404 }
            )
        }


        const existQuery = await pool.query('SELECT * FROM likes WHERE loop_id = $1 AND user_id = $2', [loopId, userId])
        if ((existQuery.rowCount ?? 0) > 0) {
            return NextResponse.json(
                { message: "Ya le diste like" },
                { status: 400 }
            )
        }

        const insertQuery = await pool.query('INSERT INTO likes (user_id, loop_id) VALUES ($1, $2) RETURNING like_id, created_at', [userId, loopId])
        return NextResponse.json(
            { message: "Le has dado like a este loop" },
            { status: 201 }
        )

    } catch (error) {
        return NextResponse.json(
            { message: "Error en el servidor al agregar un like" },
            { status: 500 }
        )
    }
}

export async function DELETE(Req: Request, { params }: ParamRouter) {
    try {
        const { id } = await params
        const loopId = parseInt(id, 10)
        if (isNaN(loopId)) {
            return NextResponse.json(
                { message: "El ID es invalido" },
                { status: 400 }
            )
        }

        const user = await getAuthUser() 
        if (!user) {
            return NextResponse.json(
                { message: "Solo los usuarios puede eliminar un like" },
                { status: 400 }
            )
        }

        const userId = user.user_id

        const loopCheck = await pool.query('SELECT * FROM loops WHERE loop_id = $1', [loopId])
        if (loopCheck.rowCount === 0) {
            return NextResponse.json(
                { message: "El loop que estas intentando acceder no existe" },
                { status: 400 }
            )
        }

        const existeQuery = await pool.query('SELECT * FROM likes WHERE loop_id = $1 AND user_id = $2', [loopId, userId])
        if ((existeQuery.rowCount ?? 0) === 0) {
            return NextResponse.json(
                { message: "No le puedes sacar el like porque no tiene ninguno" },
                { status: 400 }
            )
        }

        const deleteQuery = await pool.query('DELETE FROM likes WHERE loop_id = $1 AND user_id = $2 RETURNING like_id, user_id, loop_id', [loopId, userId])
        return NextResponse.json(
            { message: "Le has quitado el like", data: deleteQuery.rows[0] },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { message: "Error en el servidor al eliminar un like" },
            { status: 500 }
        )
    }
}