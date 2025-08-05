'use client'
import { useState } from "react";
import MainLayout from "../components/MainLayout";
import styles from "@/app/styles/register.module.css"
import { useRouter } from "next/navigation";
import { useError } from "../context/ErrorContext";
import toast from "react-hot-toast";



export default function Register() {
    const { showError } = useError()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [form, setForm] = useState({
        username: "",
        name: "",
        email: "",
        password: "",
        avatar: "",
        bio: ""
    })
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prevForm => ({
            ...prevForm,
            [e.target.name]: e.target.value
        }))
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage(null)


        if (!form.username || form.username.length < 3 || form.username.length > 50) {
            showError("El nombre de usuario debe tener entre 3 y 50 caracteres.");
            return;
        }

        if (!form.name || form.name.length < 2 || form.name.length > 70) {
            showError("El nombre debe tener entre 2 y 70 caracteres.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email || !emailRegex.test(form.email)) {
            showError("El email no tiene un formato válido.");
            return;
        }

        if (!form.password || form.password.length < 6) {
            showError("La contraseña debe contener al menos 6 caracteres.");
            return;
        }


        if (form.bio.length > 200) {
            showError("La biografía no puede tener más de 200 caracteres.")
            return
        }

        if (form.avatar && !form.avatar.startsWith("http")) {
            showError("La URL del avatar no parece válida.")
            return
        }

        setLoading(true)


        try {
            const res = await fetch('/api/auth/register', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })

            const data = await res.json()
            if (res.ok) {
                toast.success("¡Registro con exito!")
                router.push("/verify-email")
            } else {
                showError(data.message || "Hubo un error. Intentalo de nuevo")
            }


        } catch (error) {
            showError("Hubo un error en el servidor. Intentelo mas tarde")
        } finally {
            setLoading(false)
        }
    }

    return (
        <MainLayout>
            <div className={styles["register-container"]}>
                <form onSubmit={handleRegister} className={styles["register-form"]}>
                    <h2>Crea tu cuenta</h2>

                    {errorMessage && (
                        <p className={styles["error-mensaje-formulario"]}>{errorMessage}</p>
                    )}

                    <input
                        type="text"
                        onChange={handleChange}
                        name="name"
                        value={form.name}
                        placeholder="Nombre"
                        className={styles["input-register"]}
                        required
                    />

                    <input
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        name="email"
                        placeholder="Email"
                        className={styles["input-register"]}
                        required
                    />

                    <input
                        type="text"
                        onChange={handleChange}
                        value={form.username}
                        name="username"
                        placeholder="Nombre de usuario"
                        className={styles["input-register"]}
                        required
                    />

                    <input
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        name="password"
                        placeholder="Contraseña"
                        className={styles["input-register"]}
                        required
                    />

                    <input
                        type="text"
                        value={form.avatar}
                        onChange={handleChange}
                        name="avatar"
                        placeholder="Foto de perfil (URL de imagen)"
                        className={styles["input-register"]}
                    />

                    <input
                        type="text"
                        value={form.bio}
                        onChange={handleChange}
                        name="bio"
                        placeholder="Biografia"
                        className={styles["input-register"]}
                    />

                    <button type="submit" className={styles["register-button"]} disabled={loading}>
                        {loading ? "Registrando..." : "Enviar"}
                    </button>
                </form>
            </div>
        </MainLayout>
    )
}