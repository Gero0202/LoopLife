import pool from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/auth";

interface Comment {
    content: string
}

interface ParamRouter {
    params: Promise<{
        id: string
    }>
}

export async function GET(req: Request, { params }: ParamRouter) {
    try {
        const { id } = await params
        const loopId = parseInt(id, 10)
        if (isNaN(loopId)) {
            return NextResponse.json(
                { message: "El ID del loop es invalido" },
                { status: 400 }
            )
        }

        const brinComments = await pool.query(`SELECT c.comment_id, c.content, c.created_at, u.user_id, u.username, u.avatar 
                                               FROM comments c 
                                               JOIN users u ON c.user_id = u.user_id
                                               WHERE c.loop_id = $1
                                               ORDER BY c.created_at DESC`, [loopId])


       
        return NextResponse.json(
            { comments: brinComments.rows },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { message: "Error interno en el servidor para traer comentario" },
            { status: 500 }
        )
    }
}

export async function POST(req: Request, { params }: ParamRouter) {
    try {
        const { id } = await params
        const loopId = parseInt(id, 10)
        if (isNaN(loopId)) {
            return NextResponse.json(
                { message: "El ID del loop es invalido" },
                { status: 400 }
            )
        }

        const user = await getAuthUser()
        if (!user) {
            return NextResponse.json(
                { message: "Solo usuarios pueden comentar" },
                { status: 400 }
            )
        }
        const userId = user.user_id

        const loopCheck = await pool.query('SELECT 1 FROM loops WHERE loop_id = $1', [loopId])

        if (loopCheck.rowCount === 0) {
            return NextResponse.json(
                { message: "El loop al que intentás dar like no existe" },
                { status: 404 }
            )
        }

        const { content } = await req.json() as Comment 
        if (!content || typeof content !== "string" || content.length > 150) {
            return NextResponse.json(
                { message: "Comentario muy largo o invalido" },
                { status: 400 }
            )
        }

        
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)

        const commentCountToday = await pool.query(`SELECT COUNT(*) FROM comments WHERE user_id = $1 AND loop_id = $2 AND created_at >= $3`, [user.user_id, loopId, startOfToday])

        const count = parseInt(commentCountToday.rows[0].count, 10)

        if (count >= 5) {
            return NextResponse.json(
                { message: "Solo puedes hacer hasta 5 comentarios por dia en este loop" },
                { status: 429 }
            )
        }

        const insertComment = await pool.query('INSERT INTO comments (content, user_id, loop_id) VALUES ($1, $2, $3) RETURNING comment_id, user_id, loop_id, content', [content, userId, loopId])
        return NextResponse.json(
            { message: "Comentado agregado al loop!", comment: insertComment.rows[0] },
            { status: 201 }
        )

    } catch (error) {   
        return NextResponse.json(
            { message: "Error en el servidor al agregar un comentario" },
            { status: 500 }
        )
    }
}

