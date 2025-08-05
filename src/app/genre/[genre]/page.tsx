'use client'

import MainLayout from "@/app/components/MainLayout"
import { notFound, useParams, useRouter } from "next/navigation"
import CardLoop from "@/app/components/cardLoop"
import { useEffect, useState } from "react"
import { useLikeLoop } from "@/app/lib/useLikeLoop"
import { useAuth } from "@/app/context/AuthContext"
import Spinner from "@/app/components/Spinner"
import { useError } from "@/app/context/ErrorContext"
import Link from "next/link"
import styles from "@/app/styles/gnereList.module.css"

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


export default function GenrePage() {

    const { showError } = useError()

    const params = useParams()
    const genre = params.genre as string
    const router = useRouter()

    const decodedGenre = decodeURIComponent(genre)
    const displayGenre = decodedGenre.charAt(0).toUpperCase() + decodedGenre.slice(1)

    const [loops, setLoops] = useState<Loop[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { toggleLike } = useLikeLoop()
    const { currentUser } = useAuth()

    useEffect(() => {
        const fetchLoopByGenre = async () => {
            if (!genre) {
                setLoading(false)
                showError("No se especifico un genero para filtrar")
                return
            }

            setLoading(true)
           

            try {
                const res = await fetch(`/api/loops/genres/${genre}`)
                if (!res.ok) {
                    showError("No se pudierron cargar los loops para el genero")
                    setLoops([])
                    return
                }
                const data = await res.json()
                setLoops(data.loops)

            } catch (error) {
                showError("Ocurrio un error inesperado al filtrar este genero")
                setLoops([])
            } finally {
                setLoading(false)
            }
        }

        fetchLoopByGenre()
    }, [genre])

    

    const handleLike = async (e: React.MouseEvent<HTMLButtonElement>, loopId: number, currentIsLiked: boolean) => {
        e.stopPropagation()

        
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


    const handleCardContainerLink = (loopId: number) => {
        router.push(`/loop/${loopId}`)
    }


    if (loading) {
        return <MainLayout><Spinner /></MainLayout>
    }

    if (error) {
        return <MainLayout><p>Error: {error}</p></MainLayout>
    }


    return (
        <MainLayout>
            <div className={styles["genre-page"]}>
                <div className={styles["genre-header"]}>
                    <h2>
                        🎧 Explorando el genero: <span>{displayGenre}</span>
                    </h2>
                    <p>Sumergite en loops unicos que definen este estilo musical.</p>
                </div>

                {loops.length === 0 ? (
                    <div className={styles["genre-empty"]}>
                        <p>😕 No encontramos loops para este genero todavia.</p>
                        <p className={styles["genre-empty-sub"]}>
                            ¡Animate a ser el primero en compartir tu sonido!
                        </p>
                        <Link href="/">
                            <button className={styles["create-button"]}>¡Anda a crear!</button>
                        </Link>
                    </div>
                ) : (
                    <div className={styles["genre-loop-list"]}>
                        {loops.map((loop) => (
                            <div
                                key={loop.loop_id}
                                className={styles["genre-loop-item"]}
                                onClick={() => handleCardContainerLink(loop.loop_id)}
                            >
                                <CardLoop
                                    loop_id={loop.loop_id}
                                    title={loop.title}
                                    description={loop.description}
                                    audio_url={loop.audio_url}
                                    likes={loop.likes}
                                    comments={loop.comments}
                                    username={loop.user.username}
                                    avatar={loop.user.avatar}
                                    genre={loop.genre}
                                    rating={loop.rating}
                                    mood={loop.mood}
                                    isLikedByCurrentUser={!!loop.is_liked_by_current_user}
                                    onPlay={() => ""}
                                    onLike={(e) => handleLike(e, loop.loop_id, !!loop.is_liked_by_current_user)}
                                    onCommment={() => router.push(`/loop/${loop.loop_id}`)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    )
}