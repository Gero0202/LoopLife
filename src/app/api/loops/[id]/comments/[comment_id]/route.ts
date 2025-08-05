import pool from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/auth";

interface ParamRouter {
    params: {
        id: string;
        comment_id: string
    }
}


export async function DELETE(req: Request,  { params }: { params: Promise<{ id: string; comment_id: string }>}) {
    try {
        const { id, comment_id } = await params
        
        const loopId = parseInt(id, 10)
        const commentId = parseInt(comment_id, 10)
        if (isNaN(loopId) || isNaN(commentId)) {
            return NextResponse.json(
                { message: "El IDs invalidos" },
                { status: 400 }
            )
        }

        const user = await getAuthUser()
        if (!user) {
            return NextResponse.json(
                { message: "Solo usuarios pueden eliminar comentarios" },
                { status: 400 }
            )
        }
        const userId = user.user_id
        const userRole = user.role

        const checkComment = await pool.query('SELECT * FROM comments WHERE comment_id = $1 AND loop_id = $2', [commentId, loopId])
        if (checkComment.rowCount === 0) {
            return NextResponse.json(
                { message: "Comentario no encontrado o no autorizado" },
                { status: 404 }
            )
        }

        const comment = checkComment.rows[0]
        const isOwner = comment.user_id === userId
        const isAdmin = userRole === "admin"

        if (!isAdmin && !isOwner) {
            return NextResponse.json(
                { message: "No tenes autorizacion para borrar este comentario" },
                { status: 403 }
            )
        }

        const deleteQuery = await pool.query('DELETE FROM comments WHERE comment_id = $1', [commentId])
        return NextResponse.json(
            { message: "Comentario eliminado" },
            { status: 200 }
        )


    } catch (error) {
        return NextResponse.json(
            { message: "Error en el servidor al eliminar un comentario" },
            { status: 500 }
        )
    }
}