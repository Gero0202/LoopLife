import pool from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
        }

        const result = await pool.query(
            `UPDATE users 
             SET is_verified = TRUE, verify_code = NULL 
             WHERE email = $1 AND verify_code = $2
             RETURNING user_id`,
            [email, code]
        );

       
        if (result.rowCount === 0) {
            return NextResponse.json({ message: "Codigo de verificacion o email incorrecto" }, { status: 401 });
        }

     
        return NextResponse.json({ message: "Cuenta verificada con exito" }, { status: 200 });

    } catch (error) {
      
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}


