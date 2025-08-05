'use client'
import MainLayout from "@/app/components/MainLayout";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/app/styles/changePassword.module.css"
import toast from "react-hot-toast";
import { useError } from "@/app/context/ErrorContext";

export default function ChangePassword() {
    const { setCurrentUser, currentUser, loading: authLoading } = useAuth()
    const router = useRouter()
    const { showError } = useError()

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    

    useEffect(() => {
        if (!authLoading && !currentUser) {
            router.push("/login")
        }
    }, [authLoading, currentUser, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        
    }

    const updatePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!currentUser) return

        if (formData.newPassword !== formData.confirmPassword) {
            showError("Las contraseñas no coinciden")
            return
        }

        try {
            const res = await fetch(`/api/users/${currentUser.user_id}/changepassword`, {
                method: "PUT",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            })

            const data = await res.json()

            if (!res.ok) {
                showError(data.message || "Error al cambiar contraseña")
                return
            }

            toast.success("Contraseña actualizada con exito")
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })

            router.push("/")
        } catch (error) {
            showError("Error del servidor, intente mas tarde")
            
        }
    }

    return (
        <MainLayout>
            <div className={styles["password-wrapper"]}>
                <h2 className={styles["password-title"]}>Cambiar contraseña</h2>
                <form onSubmit={updatePassword} className={styles["password-form"]}>
                    <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="Contraseña actual"
                        required
                    />
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Nueva contraseña"
                        required
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repita la nueva contraseña"
                        required />
                    <button type="submit" className={styles["submit-button"]}>Guardar</button>
                   
                  
                </form>
            </div>

        </MainLayout>
    )
}