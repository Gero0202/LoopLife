'use client'
import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import EditProfileModal from "../components/EditProfileModal";
import Spinner from "../components/Spinner";
import { useError } from "../context/ErrorContext";
import styles from "@/app/styles/profileUser.module.css"
import toast from "react-hot-toast";

export default function Online() {
    const { showError } = useError()

    const { setCurrentUser, currentUser, loading: authLoading } = useAuth()
    const router = useRouter()
    const [showEdit, setShowEdit] = useState(false)

    useEffect(() => {
        if (!authLoading && !currentUser) {
            router.push("/login")
        }
    }, [authLoading, currentUser, router])
  

    const handleSave = async (updated: { name: string; username: string; bio?: string }) => {
        if (!currentUser) return

        try {
            const res = await fetch(`/api/users/${currentUser.user_id}`, {
                method: "PUT",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    ...updated,
                    email: currentUser.email
                })
            })

            if (res.status === 409) {
                showError("El username ya esta en uso")
                return
            }

            if (res.status === 400) {
                showError("Los campos obligatorios deben estar completos. Nombre y username")
            }

            if (!res.ok) {
                showError("No se pudo actualizar el perfil")
                return
            }


            const updateUser = await res.json()
            setCurrentUser(updateUser)
            toast.success("Usuario actualizado con exito")
        } catch (error) {
            showError("Error interno al actualizar el usuario")
        }
    }

    if (authLoading) {
        return (
            <MainLayout>
                <Spinner />
            </MainLayout>
        );
    }

    if (!currentUser) {
        return (
            <MainLayout>
                <p>No se pudo cargar el perfil. Por favor, inicia sesión.</p>
            </MainLayout>
        );
    }


    return (
        <MainLayout>
            <div className={styles["profile-container"]}>
                <h1 className={styles["profile-title"]}>Tu Perfil</h1>

                <div className={styles["profile-card"]}>
                    <img
                        src={currentUser.avatar}
                        alt="Imagen de usuario"
                        className={styles["profile-avatar"]}
                    />

                    <div className={styles["profile-info"]}>
                        <p><strong>Nombre:</strong> {currentUser.name}</p>
                        <p><strong>Email:</strong> {currentUser.email}</p>
                        <p><strong>Username:</strong> {currentUser.username}</p>
                        <p><strong>Biografía:</strong> {currentUser.bio}</p>

                        <button
                            onClick={() => setShowEdit(true)}
                            className={styles["edit-button"]}
                        >
                            Editar perfil
                        </button>
                    </div>
                </div>
            </div>

           
            {showEdit && (
                <EditProfileModal
                    avatar={currentUser.avatar}
                    name={currentUser.name}
                    username={currentUser.username}
                    bio={currentUser.bio}
                    onClose={() => setShowEdit(false)}
                    onSave={handleSave}
                />
            )}
        </MainLayout>
    )
}