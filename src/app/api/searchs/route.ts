import pool from "@/app/lib/db";
import { NextResponse } from "next/server";



export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const query = searchParams.get("query")

        if (!query) {
            return NextResponse.json({ results: [] })
        }

        const searchText = `%${query.toLowerCase()}%`

        const [userResult, loopResult, genreResult] = await Promise.all([
            pool.query(
                `SELECT user_id as id, username, avatar  FROM users WHERE LOWER(username) LIKE $1;`, [searchText]
            ),
            pool.query(
                `SELECT loop_id as id, title, description, genre FROM loops WHERE LOWER(title) LIKE $1`, [searchText]
            ),
            pool.query(
                `SELECT DISTINCT genre FROM loops WHERE LOWER(genre) LIKE $1`, [searchText]
            )
        ])

        const users = (userResult?.rows || []).map(user => ({
            type: "user",
            id: user.id,
            username: user.username
        }))

        const loops = (loopResult?.rows || []).map(loop => ({
            type: "loop",
            id: loop.id,
            title: loop.title,
            description: loop.description
        }))

        const genre = (genreResult?.rows || []).map((g, i) => ({
            type: "genre",
            id: i + 1000,
            genre: g.genre
        }))

        const allResults = [...users, ...loops, ...genre]

        return NextResponse.json({ results: allResults }, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { message: "Error del servidor en search" },
            { status: 500 }
        )
    }
}