'use client'
import Link from "next/link";
import MainLayout from "../components/MainLayout";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useError } from "../context/ErrorContext";
import styles from "@/app/styles/configuration.module.css"
import Swal from "sweetalert2";

export default function Configurationp() {
    const { currentUser, loading: authLoading, logout } = useAuth()
    const [error, setError] = useState('')
    const [showMessage, setShowMessage] = useState(false)
    const router = useRouter()

    const { showError } = useError()

    const handleDeleteUser = async () => {
        if (!currentUser) {
            showError("Debes estar logeado para eliminar un usuario")
            return
        }

        const result = await Swal.fire({
            title: "¿Eliminar cuenta?",
            text: "Esta acción eliminara tu cuenta permanentemente.",
            icon: "warning",
            background: "#1e1e2f",
            color: "#fff",
            iconColor: "#F2BED1",
            showCancelButton: true,
            confirmButtonColor: "#ee99b8ff",
            cancelButtonColor: "#555",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        })

        
        if (!result.isConfirmed) return

        try {
            const res = await fetch(`/api/users/${currentUser.user_id}`, {
                method: "DELETE",
            })

            const data = await res.json()

            if (res.ok) {
                Swal.fire({
                    title: "Cuenta eliminada",
                    text: "Tu cuenta fue eliminada con éxito. Gracias por haber formado parte.",
                    icon: "success",
                    background: "#1e1e2f",
                    color: "#fff",
                    confirmButtonColor: "#F2BED1"
                })


                setTimeout(async () => {
                    await logout()
                }, 3000)
                
            } else {
                showError(data.message || "Error al eliminar el user")
            }
        } catch (error) {
            showError("Error inseperado al borrar el usuario")
   
        }

    }

    return (
        <MainLayout>
            <div className={styles["config-wrapper"]}>
                <h2 className={styles["config-title"]}>Configuración</h2>

                <div className={styles["config-options"]}>
                    <Link href={"/configurationp/change-password"} className={styles["link-wrapper"]}>
                        <button className={styles["option-button"]}>
                            🔒 Cambiar contraseña
                        </button>
                    </Link>

                    <Link href={"/configurationp/change-email"} className={styles["link-wrapper"]}>
                        <button className={styles["option-button"]}>
                            📧 Cambiar email
                        </button>
                    </Link>

                    <button
                        onClick={handleDeleteUser}
                        className={`${styles["option-button"]} ${styles["delete-button"]}`}
                    >
                        🗑️ Eliminar cuenta
                    </button>

                    <button className={styles["option-button"]}>
                        🎨 Cambiar tema
                    </button>
                </div>

                {showMessage && (
                    <div className={styles["toast"]}>
                        Tu cuenta fue eliminada. ¡Gracias por haber formado parte!
                    </div>
                )}
            </div>


        </MainLayout>
    )
}