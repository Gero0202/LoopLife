import { getAuthUser } from "@/app/lib/auth";
import pool from "@/app/lib/db";
import { NextResponse } from "next/server";

interface UpdateData {
    user_id: number,
    title?: string,
    description?: string,
    genre?: string,
    rating?: number,
    mood?: string,
    audio_url?: string,
    updated_at: string
}

interface RouteParams {
    params: Promise<{
        id: string
    }>
}


export async function GET(req: Request,  context : RouteParams) {
    try {
        const { id } =  await context.params

        const loopId = parseInt(id, 10)
        if (isNaN(loopId)) {
            return NextResponse.json(
                { message: "El ID del loop no es un numero" },
                { status: 404 }
            )
        }

        const currentUser = await getAuthUser()


        const result = await pool.query(
            `SELECT 
                l.*, 
              u.username, 
              u.avatar,
              CASE 
             WHEN $1::int IS NOT NULL AND li.user_id IS NOT NULL THEN TRUE
             ELSE FALSE
              END AS is_liked_by_current_user
             FROM loops l
             JOIN users u ON l.user_id = u.user_id
             LEFT JOIN likes li ON l.loop_id = li.loop_id AND li.user_id = $1
              WHERE l.loop_id = $2`,
            [currentUser ? currentUser.user_id : null, loopId]
        );

        
        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: "No se encontraron loops con ese ID" },
                { status: 404 }
            )
        }

        const rawLoop = result.rows[0]

        const formattedLoop = {
            loop_id: rawLoop.loop_id,
            user_id: rawLoop.user_id,
            title: rawLoop.title,
            description: rawLoop.description,
            genre: rawLoop.genre,
            rating: rawLoop.rating,
            mood: rawLoop.mood,
            audio_url: rawLoop.audio_url,
            likes: rawLoop.likes,
            comments: rawLoop.comments,
            created_at: rawLoop.created_at,
            updated_at: rawLoop.updated_at,
            is_liked_by_current_user: rawLoop.is_liked_by_current_user,
            user: {
                username: rawLoop.username,
                avatar: rawLoop.avatar,
            },
        };

        return NextResponse.json({ loop: formattedLoop }, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: "No se pudo obtener el loop. error internal server" },
            { status: 500 }
        )
    }
}

export async function PUT(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params

        const loopId = parseInt(id, 10)
        if (isNaN(loopId)) {
            return NextResponse.json(
                { message: "El ID del loop no es un formato valido" },
                { status: 404 }
            )
        }

        const getLoop = await pool.query('SELECT * FROM loops WHERE loop_id = $1', [loopId])

        const userObj = await getAuthUser()
        if (!userObj) {
            return NextResponse.json(
                { message: "Solo usuarios autenticados pueden actualizar loops" },
                { status: 401 }
            )
        }
        const userId = userObj.user_id
        const roleUser = userObj.role

        if (getLoop.rows[0]?.user_id !== userId && roleUser !== 'admin') {
            return NextResponse.json(
                { message: 'No tenes permiso para editar este loop' },
                { status: 401 }
            )
        }

        const { title, description, genre, rating, mood, audio_url } = await (req.json()) as UpdateData
        const fields = { title, description, genre, rating, mood, audio_url, updated_at: new Date() }

        if (title && title.length > 255) {
            return NextResponse.json({ message: "El titulo es demasiado largo" }, { status: 400 });
        }

        if ( rating !== undefined && ( typeof rating !== "number" || rating < 0 || rating > 10)) {
            return NextResponse.json({ message: "La calificacion debe ser un numero entre 0 y 10" }, { status: 400 });
        }

        if (audio_url && !audio_url.startsWith('http')) {
            return NextResponse.json({ message: "La URL de audio no es válida" }, { status: 400 });
        }

        if (description && description.length > 300) {
            return NextResponse.json({ message: "La descripcion es demasiada larga" }, { status: 400 });
        }

        if (mood && mood.length > 50) {
            return NextResponse.json({ message: "El mood es demasiado largo" }, { status: 400 });
        }

        const entries = Object.entries(fields).filter(
            (([_, value]) => value !== undefined && value !== null)
        )

        if (entries.length === 0) {
            return NextResponse.json(
                { message: "Datos insuficientes para actualizar" },
                { status: 400 }
            )
        }

        const setClause = entries
            .map(([key], index) => `${key} = $${index + 1}`)
            .join(", ")

        const values = entries.map(([_, value]) => value)

        let sql: string
        let result

        if (roleUser === 'admin') {
            sql = `UPDATE loops SET ${setClause} WHERE loop_id = $${entries.length + 1} RETURNING loop_id, user_id, title, audio_url`
            result = await pool.query(sql, [...values, loopId])
        } else {
            sql = `UPDATE loops SET ${setClause} WHERE loop_id = $${entries.length + 1} AND user_id = $${entries.length + 2} RETURNING loop_id ,user_id, title, audio_url`
            result = await pool.query(sql, [...values, loopId, userId])
        }


        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Loop no encontrado" },
                { status: 400 }
            )
        }

        return NextResponse.json(result.rows[0], { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { message: "No se pudo actualizar el loop. error internal server" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params
        const loopId = parseInt(id, 10)
        if (isNaN(loopId)) {
            return NextResponse.json(
                { message: "El ID del loop no es un formato valido" },
                { status: 400 }
            )
        }

        const getLoop = await pool.query('SELECT * FROM loops WHERE loop_id = $1', [loopId])

        const userObj = await getAuthUser()
        if (!userObj) {
            return NextResponse.json(
                { message: "Solo usuarios autenticados pueden eliminar loops" },
                { status: 401 }
            )
        }
        const userId = userObj.user_id
        const userRole = userObj.role

        const isOwner = getLoop.rows[0]?.user_id === userId
        const isAdmin = userRole === "admin"

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { message: 'No tenes permiso para eliminar este loop' },
                { status: 401 }
            )
        }

        const result = await pool.query('DELETE FROM loops WHERE loop_id = $1', [loopId])
        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "No existe el loop que intenta eliminar" },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: "Loop eliminado correctamente" },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { message: "No se pudo eliminar el loop. error internal server" },
            { status: 500 }
        )
    }
}