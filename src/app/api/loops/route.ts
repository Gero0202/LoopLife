import pool from "@/app/lib/db";
import { NextResponse } from "next/server";
import { buildInsertQuery } from "@/app/lib/insertBuilder";
import { getAuthUser } from "@/app/lib/auth";


interface NewLoop {
    user_id: number,
    title: string,
    description: string,
    genre: string,
    rating: number,
    mood?: string,
    audio_url: string
}



export async function GET(req: Request) {
    try {
        const currentUser = await getAuthUser();

        const userId = currentUser?.user_id ?? null

        let result

        if (userId) {
            result = await pool.query(
                `SELECT 
                    l.loop_id, l.user_id, l.title, l.description, l.rating, l.genre, 
                    l.mood, l.audio_url, l.likes, l.comments, l.created_at,
                    u.username, u.avatar,
                    CASE WHEN li.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_liked_by_current_user
                    FROM loops l
                    JOIN users u ON l.user_id = u.user_id
                    LEFT JOIN likes li ON l.loop_id = li.loop_id AND li.user_id = $1
                    ORDER BY l.created_at DESC`,
                [userId]
            )
        } else {
            result = await pool.query(
                `SELECT 
                l.loop_id, l.user_id, l.title, l.description, l.rating, l.genre, 
                l.mood, l.audio_url, l.likes, l.comments, l.created_at,
                u.username, u.avatar,
                FALSE AS is_liked_by_current_user
                FROM loops l
                JOIN users u ON l.user_id = u.user_id
                ORDER BY l.created_at DESC`
            )
        }


        const loops = result.rows.map(row => ({
            loop_id: row.loop_id,
            user_id: row.user_id,
            title: row.title,
            description: row.description,
            rating: row.rating,
            genre: row.genre,
            mood: row.mood,
            audio_url: row.audio_url,
            likes: row.likes,
            comments: row.comments,
            created_at: row.created_at,
            user: {
                username: row.username,
                avatar: row.avatar,
            },
            is_liked_by_current_user: row.is_liked_by_current_user
        }));

        return NextResponse.json({ loops: loops }, { status: 200 });

    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { message: "Error interno del servidor al obtener los loops." },
            { status: 500 }
        );
    }
}




export async function POST(req: Request) {
    try {

        const userObj = await getAuthUser()
        if (!userObj) {
            return NextResponse.json(
                { message: "Solo usuarios pueden crear loops" },
                { status: 400 }
            )
        }
        const userId = userObj.user_id

        const forwardedFor = req.headers.get("x-forwarded-for")
        const ip =
            forwardedFor?.split(",")[0]?.trim() ||
            req.headers.get("x-real-ip") ||
            req.headers.get("host") ||
            "IP no disponible"


        const { title, description, genre, rating, mood, audio_url } = (await req.json()) as NewLoop

        if (!title || !audio_url || !genre) {
            return NextResponse.json(
                { message: "Faltan los campos titulo y audio que son obligatorios" },
                { status: 400 }
            )
        }

        if (typeof rating !== "number" || rating < 0 || rating > 10) {
            return NextResponse.json(
                { message: "Los puntajes son del 0 al 10" },
                { status: 400 }
            )
        }

        const isValidUrl = typeof audio_url === "string" &&
            (audio_url.startsWith('https://www.youtube.com/') ||
                audio_url.startsWith('https://youtu.be/') ||
                audio_url.startsWith('https://soundcloud.com/'))

        if (!isValidUrl) {
            return NextResponse.json(
                { message: "Solo se permiten enlaces de youtube o soundcloud" },
                { status: 400 }
            )
        }

        const userCountQuery = `
            SELECT COUNT(*) FROM loops
            WHERE user_id = $1 AND created_at >= NOW()::DATE
        `

        const userCountResult = await pool.query(userCountQuery, [userId])
        const loopsByUserToday = parseInt(userCountResult.rows[0].count)


        
        if (loopsByUserToday >= 5) {
            return NextResponse.json(
                { message: "Has alcanzado el límite diario de 5 loops por cuenta." },
                { status: 429 }
            )
        } 
       
        const ipCountQuery = `
            SELECT COUNT(*) FROM loops 
            WHERE ip_address = $1 AND created_at >= NOW()::DATE
        `
        const ipCountResult = await pool.query(ipCountQuery, [ip])
        const loopsByIpToday = parseInt(ipCountResult.rows[0].count)

        if (loopsByIpToday >= 5) {
            return NextResponse.json(
                { message: "Se alcanzó el límite diario de 5 loops desde esta IP." },
                { status: 429 }
            )
        }



        const loopData = {
            user_id: userId,
            title,
            description,
            genre,
            rating,
            mood,
            audio_url,
            ip_address: ip
        }

        const { text, values } = buildInsertQuery('loops', loopData, ['loop_id', 'user_id', 'title', 'genre', 'audio_url'])
        const result = await pool.query(text, values)

        return NextResponse.json(result.rows[0], { status: 201 })

    } catch (error) {
        return NextResponse.json(
            { message: 'Error interno al crear un loop' },
            { status: 500 }
        )
    }
}