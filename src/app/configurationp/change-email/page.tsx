'use client'
import MainLayout from "@/app/components/MainLayout";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/app/styles/changeEmail.module.css"
import toast from "react-hot-toast";
import { useError } from "@/app/context/ErrorContext";

export default function ChangeEmail() {
    const { setCurrentUser, currentUser, loading: authLoading } = useAuth()
    const router = useRouter()
    const [newEmail, setNewEmail] = useState("")
    

    const { showError } = useError()

    const handleChangeEmail = async () => {

        if (!currentUser) {
            router.push("/login")
            return
        }

        if (!newEmail || !newEmail.includes("@")) {
            showError("Por favor, ingrese un email valido")
            return
        }

        try {
            const res = await fetch(`/api/users/${currentUser.user_id}/changeEmail`, {
                method: "PUT",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(
                    { email: newEmail }
                )
            })
            const data = await res.json()

            if (res.ok) {
                toast.success("Email actualizado con exito")
                setCurrentUser({
                    ...currentUser!,
                    email: newEmail
                })
                router.push("/")
            } else {
                showError(data.message || "Error al cambiar email")
               
            }
        } catch (error) {
            showError("Error en el servidor")
        }
    }


    return (
        <MainLayout>
            <div className={styles["email-wrapper"]}>
                <h2 className={styles["email-title"]}>Cambiar email</h2>

                <input
                    type="text"
                    placeholder="Nuevo email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={styles["email-input"]}
                />

                <button onClick={handleChangeEmail} className={styles["email-button"]}>
                    Guardar
                </button>

            </div>

        </MainLayout>
    )
}