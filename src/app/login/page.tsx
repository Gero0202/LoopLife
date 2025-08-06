'use client'
import { useState } from "react";
import MainLayout from "../components/MainLayout";
import styles from "@/app/styles/login.module.css"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useError } from "../context/ErrorContext";
import toast from "react-hot-toast";

export default function Login() {
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const { login } = useAuth()
    const { showError } = useError()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage(null)
        setLoading(true)



        const result = await login(identifier, password)

        if (result.success) {
            toast.success("¡Bienvenido!")
            router.push("/")
        } else {
            showError(result.message || "Credenciales inválidas")
        }

        setLoading(false)

    }

    return (
        <MainLayout>
            <div className={styles["login-container"]}>
                <form onSubmit={handleLogin} className={styles["login-form"]}>
                    <h2>Iniciar sesion</h2>

                    {errorMessage && (
                        <p className={styles["error-message-login"]}>{errorMessage}</p>
                    )}

                    <input
                        type="text"
                        placeholder="Email o nombre de usuario"
                        value={identifier}
                        onChange={e => { setIdentifier(e.target.value); setErrorMessage(null) }}
                        className={styles["login-input"]}

                        required
                    />

                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setErrorMessage(null) }}
                        className={styles["login-input"]}
                        required
                    />

                    <button type="submit" className={styles["login-button"]} disabled={loading}>
                        {loading ? "Iniciando..." : "Iniciar sesion"}
                    </button>

                    <Link href={"/verify-email"}>
                        <p className={styles["verify-link"]}>¿No verificaste tu cuenta todavia?</p>
                    </Link>
                </form>


            </div>
        </MainLayout>
    )
}