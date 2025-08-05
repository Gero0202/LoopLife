import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json({
            message: "Sesion cerrada coreectamente"
        })

        response.cookies.set('token', '', {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 0,
            path: '/'
        })

        return response
    } catch (error) {
        return NextResponse.json(
            { message: "Error interno del servidor al cerrar sesion" },
            { status: 500 }
        );
    }
}