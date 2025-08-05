'use client'

import { useEffect, useState } from "react"
import MainLayout from "@/app/components/MainLayout"
import styles from "@/app/styles/userSearch.module.css"
import { useParams, useRouter } from "next/navigation"
import { Loop } from "@/app/types/Loop"
import CardLoop from "@/app/components/cardLoop"
import { useAuth } from "@/app/context/AuthContext"
import { useLikeLoop } from "@/app/lib/useLikeLoop"
import Spinner from "@/app/components/Spinner"
import { useError } from "@/app/context/ErrorContext"

interface UserProfile {
    user_id: string
    name: string
    username: string
    email?: string
    avatar: string
    bio?: string
}




export default function User() {
    const params = useParams()
    const id = params.id as string
    const router = useRouter()

    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    const [loops, setLoops] = useState<Loop[]>([])
    const [error, setError] = useState<string | null>(null)


    const { currentUser, loading: authLoading } = useAuth()
    const { toggleLike } = useLikeLoop()
    const { showError } = useError()

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                return
            }
            if (authLoading) {
                return
            }
            setLoading(true)

            try {

                const userRes = await fetch(`/api/users/${id}`)
                if (!userRes.ok) {
                    showError("No se pudo cargar la información del usuario o el usuario no existe.");
                    setUser(null);
                    setLoops([]); 
                    return;
                }
                const data = await userRes.json()
                setUser(data.user)


                const loopsRes = await fetch(`/api/users/${id}/loops`)
                if (!loopsRes.ok) {
                    setLoops([])
                    return
                }
                const loopData = await loopsRes.json()
                setLoops(loopData.loops)


            } catch (error) {
                showError("Ocurrio un error inesperado al cargar los datos")
                setUser(null)
                setLoops([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id, authLoading])

    

    const handleLike = async (
        e: React.MouseEvent<HTMLButtonElement>,
        loopId: number,
        currentIsLiked: boolean
    ) => {
        e.stopPropagation();

        if (!currentUser) {
            showError("Debes iniciar sesión para dar o quitar likes.");
            router.push("/login");
            return;
        }

        setLoops((prevLoops) =>
            prevLoops.map((loop) =>
                loop.loop_id === loopId
                    ? {
                        ...loop,
                        likes: currentIsLiked ? loop.likes - 1 : loop.likes + 1,
                        is_liked_by_current_user: !currentIsLiked,
                    }
                    : loop
            )
        );

        const result = await toggleLike(loopId, currentIsLiked);

        if (result === "error") {
            setLoops((prevLoops) =>
                prevLoops.map((loop) =>
                    loop.loop_id === loopId
                        ? {
                            ...loop,
                            likes: currentIsLiked ? loop.likes + 1 : loop.likes - 1,
                            is_liked_by_current_user: currentIsLiked,
                        }
                        : loop
                )
            );
            showError("Ocurrió un error al intentar procesar tu like.");
        }
       
    };


    const handleCardContainerLink = (loopId: number) => {
        router.push(`/loop/${loopId}`)
    }

    if (error) return <MainLayout><p>Error: {error}</p></MainLayout>
    if (loading || authLoading) return <MainLayout><Spinner /></MainLayout>
    if (!user) return <MainLayout><p>No se encontró el usuario</p></MainLayout>

    return (
        <MainLayout>
            <div className={styles["user-profile-page"]}>
                <div className={styles["user-info-section"]}>
                    <img
                        className={styles["user-avatar"]}
                        src={user.avatar}
                        alt={`Avatar de ${user.username}`}
                    />
                    <div className={styles["user-data"]}>
                        <h2>{user.username}</h2>
                        {user.name && <p>Nombre: {user.name}</p>}
                        {user.email && <p>Email: {user.email}</p>}
                        {user.bio && <p className={styles["user-bio"]}>{user.bio}</p>}
                    </div>
                </div>

                <hr className={styles["user-divider"]} />

                <div className={styles["user-loops-section"]}>
                    <h3>Loops de {user.username} :</h3>

                    {loops.length === 0 ? (
                        <p className={styles["user-empty-message"]}>
                            Este usuario aún no ha subido ningún loop.
                        </p>
                    ) : (
                        <div className={styles["user-loops-list"]}>
                            {loops.map((loop) => (
                                <div
                                    key={loop.loop_id}
                                    className={styles["user-loop-item"]}
                                    onClick={() => handleCardContainerLink(loop.loop_id)}
                                >
                                    <CardLoop
                                        loop_id={loop.loop_id}
                                        title={loop.title}
                                        description={loop.description}
                                        audio_url={loop.audio_url}
                                        likes={loop.likes}
                                        comments={loop.comments}
                                        avatar={user.avatar}
                                        username={user.username}
                                        genre={loop.genre}
                                        rating={loop.rating}
                                        mood={loop.mood}
                                        isLikedByCurrentUser={!!loop.is_liked_by_current_user}
                                        onPlay={() => ""}
                                        onLike={(e) =>
                                            handleLike(e, loop.loop_id, !!loop.is_liked_by_current_user)
                                        }
                                        onCommment={() => router.push(`/loop/${loop.loop_id}`)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </MainLayout>
    )
}



