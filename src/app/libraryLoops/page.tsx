'use client'

import { useParams, useRouter } from "next/navigation"
import MainLayout from "../components/MainLayout"
import { useAuth } from "../context/AuthContext"
import { useEffect, useState } from "react"
import CardLoop from "../components/cardLoop"
import EditLoopModal from "../components/EditLoopModal"
import Spinner from "../components/Spinner"
import { useError } from "../context/ErrorContext"
import styles from "@/app/styles/libraryUser.module.css"
import Link from "next/link"
import toast from "react-hot-toast"
import Swal from "sweetalert2"
import { useLikeLoop } from "../lib/useLikeLoop"

interface Loop {
    loop_id: number
    user_id: number
    title: string
    description: string
    rating: number
    genre: string
    mood: string
    audio_url: string
    likes: number
    comments: number
    created_at: string
    is_liked_by_current_user: boolean
    user: {
        username: string
        avatar: string
    }

}



export default function LibraryPage() {
    const { showError } = useError()

    const { currentUser, loading: authLoading } = useAuth()
    const router = useRouter()

    const [loops, setLoops] = useState<Loop[]>([])
    const [selectedLoop, setSelectedLoop] = useState<Loop | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)

    const [loading, setLoading] = useState(true)

    const { toggleLike } = useLikeLoop()

    useEffect(() => {
        if (!authLoading && !currentUser) {
            router.push("/login")
            return
        }

        if (authLoading || !currentUser) return

        const fecthLoops = async () => {
            try {
                const res = await fetch(`/api/users/${currentUser.user_id}/loops`, {
                    cache: "no-store"
                })

                const data = await res.json()

                if (res.ok) {
                    setLoops(data.loops)
                } else {
                    showError(data.message || "No se pudieron cargar tus loops")
                }
            } catch (error) {
                showError("Error al traer los loops")
            } finally {
                setLoading(false)
            }
        }

        fecthLoops()

    }, [authLoading, currentUser])

    
    const handleLike = async (e: React.MouseEvent<HTMLButtonElement>, loopId: number, currentIsLiked: boolean) => {
        e.stopPropagation()
        
        if (!currentUser) {
            showError("Debes iniciar sesión para dar o quitar likes");
            router.push("/login");
            return;
        }

        setLoops(prev =>
            prev.map(loop =>
                loop.loop_id === loopId
                    ? {
                        ...loop,
                        likes: currentIsLiked ? loop.likes - 1 : loop.likes + 1,
                        is_liked_by_current_user: !currentIsLiked
                    }
                    : loop
            )
        )

        const result = await toggleLike(loopId, currentIsLiked)

        if (result === "unauthorized") {
            
            setLoops(prev =>
                prev.map(loop =>
                    loop.loop_id === loopId
                        ? {
                            ...loop,
                            likes: currentIsLiked ? loop.likes + 1 : loop.likes - 1,
                            is_liked_by_current_user: currentIsLiked
                        }
                        : loop
                )
            )
            showError("Debes iniciar sesión para dar o quitar likes")
            router.push("/login")
        } else if (result === "error") {
            setLoops(prev =>
                prev.map(loop =>
                    loop.loop_id === loopId
                        ? {
                            ...loop,
                            likes: currentIsLiked ? loop.likes + 1 : loop.likes - 1,
                            is_liked_by_current_user: currentIsLiked
                        }
                        : loop
                )
            )
            showError("Hubo un error al procesar el like")
        }
    }

    const handleDelete = async (loopId: number) => {

        const result = await Swal.fire({
            title: "¿Eliminar loop?",
            text: "Esta accion no se puede deshacer.",
            icon: "warning",
            background: "#1e1e2f",
            color: "#fff",
            iconColor: "#F2BED1",
            showCancelButton: true,
            confirmButtonColor: "#F2BED1",
            cancelButtonColor: "#555",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        })

        if (!result.isConfirmed) return

        try {
            const res = await fetch(`/api/loops/${loopId}`, {
                method: "DELETE"
            })

            const data = await res.json()
            if (!res.ok) {
                showError(data.message || "No se pudo eliminar el loop")
                return
            }

            setLoops(prev => prev.filter(loop => loop.loop_id !== loopId))

            await Swal.fire({
                title: "Loop eliminado",
                text: "Se eliminó el loop correctamente.",
                icon: "success",
                background: "#1e1e2f",
                color: "#fff",
                confirmButtonColor: "#F2BED1"
            })
        } catch (error) {
            showError("Ocurrio un erro al borrar el loooop")
        }
    }

    const handleEditClick = (loop: Loop) => {
        setSelectedLoop(loop)
        setShowEditModal(true)
    }

    const handleUpdate = async (updatedData: Partial<Loop>) => {

        if (!selectedLoop) {
            return
        }

        try {
            const res = await fetch(`/api/loops/${selectedLoop.loop_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            })

            const data = await res.json()
            if (!res.ok) {
                showError(data.message || "error al actualizar el loop")
                return
            }

            setLoops(prev => prev.map(loop =>
                loop.loop_id === selectedLoop.loop_id ? { ...loop, ...updatedData } : loop
            ))

            toast.success("Loop actualizado con exito")
            setShowEditModal(false)
            setSelectedLoop(null)

        } catch (error) {
            showError("Error al acutalizar el loop")
        }
    }

    if (authLoading || loading) {
        return <MainLayout><Spinner /></MainLayout>
    }

    if (loops.length === 0) {
        return (
            <MainLayout>
                <div className={styles["empty-library"]}>
                    <h1 className={styles["library-title"]}>Tu biblioteca</h1>

                    <div className={styles["empty-content"]}>
                        <p className={styles["empty-message"]}>
                            Aún no creaste ningún loop. ¡Animate a compartir tu sonido!
                        </p>
                        <Link href="/">
                            <button className={styles["create-button"]}>
                                Inspirate y crea!
                            </button>
                        </Link>
                    </div>
                </div>
            </MainLayout>
        )
    }

    return (
        <>
            <MainLayout>
                <div className={styles["library-container"]}>
                    <h1 className={styles["library-title"]}>Tu biblioteca</h1>
                    {loops.map(loop => (
                        <div key={loop.loop_id} className={styles["loop-wrapper"]}>
                            <CardLoop
                                loop_id={loop.loop_id}
                                title={loop.title}
                                description={loop.description}
                                rating={loop.rating}
                                genre={loop.genre}
                                mood={loop.mood}
                                audio_url={loop.audio_url}
                                likes={loop.likes}
                                comments={loop.comments}
                                username={loop.user.username}
                                avatar={loop.user.avatar}
                                isLikedByCurrentUser={loop.is_liked_by_current_user}
                                onPlay={() => ""}
                                onLike={(e) => handleLike(e, loop.loop_id, loop.is_liked_by_current_user)}
                                onCommment={() => router.push(`/loop/${loop.loop_id}`)}
                            />

                            <div className={styles["loop-buttons"]}>
                                <button
                                    onClick={() => {
                                        setSelectedLoop(loop)
                                        setShowEditModal(true)
                                    }}
                                    className={styles["edit-button"]}
                                >
                                    Editar
                                </button>

                                <button
                                    onClick={() => handleDelete(loop.loop_id)}
                                    className={styles["delete-button"]}
                                >
                                    Eliminar
                                </button>
                            </div>

                        </div>
                    ))
                    }
                </div>
            </MainLayout>

            {showEditModal && selectedLoop && (
                <EditLoopModal
                    loop={selectedLoop}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleUpdate}
                />
            )}
        </>
    )
}