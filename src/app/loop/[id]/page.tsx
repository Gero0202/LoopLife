'use client'
import styles from "@/app/styles/loop.module.css"
import MainLayout from "@/app/components/MainLayout"
import { notFound, useParams, useRouter } from "next/navigation"
import CardLoop from "@/app/components/cardLoop"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/app/context/AuthContext"
import { useLikeLoop } from "@/app/lib/useLikeLoop"
import Spinner from "@/app/components/Spinner"
import { useError } from "@/app/context/ErrorContext"
import toast from "react-hot-toast"
import Swal from "sweetalert2"

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
    is_liked_by_current_user?: boolean
    user: {
        username: string
        avatar: string
    }

}

interface CommentLoop {
    content: string
    comment_id: number
    user_id: number
    created_at: string
    avatar: string
    username: string
}


export default function LoopDetailPage() {
    const { showError } = useError()

    const params = useParams()
    const id = params.id as string
    const router = useRouter()

    const [loop, setLoop] = useState<Loop | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [comments, setComments] = useState<CommentLoop[]>([])
    const [newComment, setNewComment] = useState('')
    const [postingComment, setPostingComment] = useState(false)
    const [canComment, setCanComment] = useState(true)


    const { currentUser, loading: authLoading } = useAuth()
    const { toggleLike } = useLikeLoop()

    useEffect(() => {
        const fetchLoop = async () => {
            if (!id) {
                setLoading(false)
                showError("No se proporciono un ID de loop")
                return
            }
            if (authLoading) {
                return
            }

            setLoading(true)
        

            try {
               
                const res = await fetch(`/api/loops/${id}`, {
                    cache: "no-store"
                })
                if (!res.ok) {
                    if (res.status === 404) {
                        showError("El loop no se encontro")
                    } else {
                        showError("No se pudo cargar la informacion del loop")
                    }
                    setLoop(null)
                    return
                }
                const data = await res.json()
                setLoop(data.loop)

               
                const resComment = await fetch(`/api/loops/${id}/comments`, {
                    cache: "no-store"
                })

                if (!resComment.ok) {
                    if (res.status === 404) {
                        showError("El comentario del loop no se encontro")
                    } else {
                        showError("No se pudo cargar la informacion del comentario")
                    }
                    setComments([])
                    return
                }

                const dataComments = await resComment.json()
                
                setComments(dataComments.comments)


            } catch (error) {
              
                showError("Ocurrio un error inesperado al cargar el loop")
                setLoop(null)
            } finally {
                setLoading(false)
            }
        }

        fetchLoop()
    }, [id, authLoading])

   

    const handleLike = async (
        e: React.MouseEvent<HTMLButtonElement>,
        loopId: number,
        currentIsLiked: boolean
    ) => {
        e.stopPropagation()

        if (!currentUser) {
            showError("Debes iniciar sesión para dar o quitar likes.");
            router.push("/login");
            return;
        }

        if (!loop) return

        setLoop(prev => prev ? {
            ...prev,
            likes: currentIsLiked ? prev.likes - 1 : prev.likes + 1,
            is_liked_by_current_user: !currentIsLiked
        } : prev)

        const result = await toggleLike(loopId, currentIsLiked)

        if (result === "unauthorized") {
            showError("Debes iniciar sesión para dar o quitar likes.")
            router.push('/login')
        } else if (result === "error") {
           
            setLoop(prev => prev ? {
                ...prev,
                likes: currentIsLiked ? prev.likes + 1 : prev.likes - 1,
                is_liked_by_current_user: currentIsLiked
            } : prev)
            showError("Hubo un error al dar/quitar like.")
        }
    };

    const handleComment = async () => {
        if (!currentUser) {
            showError("Debes iniciar sesion para comentar")
            return
        }

        if (newComment.trim() === '') {
            showError('El comentario no puede estar vacio')
            return
        }

        setPostingComment(true)
        setCanComment(false)
        setTimeout(() => { setCanComment(true) }, 200)

        try {
            const res = await fetch(`/api/loops/${id}/comments`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ content: newComment.trim() })
            })
            const data = await res.json()

            if (!res.ok) {
                showError(data.message || "Error al enviar el comentario")
                return
            }

            const newCommentData: CommentLoop = {
                comment_id: data.comment.comment_id,
                content: data.comment.content,
                user_id: currentUser.user_id,
                created_at: new Date().toISOString(),
                username: currentUser.username,
                avatar: currentUser.avatar
            }

            setComments(prev => [...prev, newCommentData])
            setNewComment('')

        } catch (error) {
            
            showError("Hubo un problema al enviar el comentario")
        } finally {
            setPostingComment(false)
        }

    };

    const handleDeleteButton = async (comentId: number) => {
        if (!loop) return
        if (!currentUser) {
            showError("Debes iniciar sesion para eliminar un comentario")
            return
        }

        const result = await Swal.fire({
            title: "¿Eliminar comentario?",
            text: "Esta acción no se puede deshacer.",
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
            const res = await fetch(`/api/loops/${loop.loop_id}/comments/${comentId}`, {
                method: "DELETE"
            })

            const data = await res.json()

            if (res.ok) {
                setComments(prev => prev.filter(c => c.comment_id !== comentId))

                setLoop(prev => prev ? { ...prev, comments: prev.comments - 1 } : prev)


                await Swal.fire({
                    title: "Comentario eliminado",
                    icon: "success",
                    background: "#1e1e2f",
                    color: "#fff",
                    confirmButtonColor: "#F2BED1"
                })
               
            } else {
                showError(data.message || "Error al eliminar el comentario")
            }
        } catch (error) {
            showError("Error inesperado al eliminar comentario")
        }
    }

    const commentInputRef = useRef<HTMLTextAreaElement | null>(null)

    const handleCommentButton = () => {
        if (!currentUser) {
            showError("Debes iniciar sesion para comentar")
           
            return
        }
        if (commentInputRef.current) {
            commentInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
            commentInputRef.current.focus()
        }

    }

    if (loading) {
        return <MainLayout><Spinner /></MainLayout>
    }

    if (error) {
        if (error === "El loop no se encontro") {
            notFound()
        }
        return <MainLayout><p>Error: {error}</p></MainLayout>
    }

    if (!loop) {
        notFound()
    }

    return (
        <MainLayout>
            <div className={styles["loop-page-container"]}>
                {loop && loop.user ? (
                    <CardLoop
                        key={loop.loop_id}
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
                        onCommment={() => handleCommentButton()}
                    />
                ) : (
                    <p className={styles["error-message"]}>No se pudo cargar la información del loop.</p>
                )}

                <div className={styles["comments-section"]}>
                    <h3>Comentarios</h3>

                    {comments && comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.comment_id} className={styles["comment-item"]}>
                                <img src={comment.avatar} alt="avatar" className={styles["comment-avatar"]} />
                                <div className={styles["comment-content"]}>
                                    <div className={styles["comment-header"]}>
                                        <p className={styles["comment-user"]}>{comment.username}</p>
                                        <p className={styles["comment-date"]}>
                                            {/* {new Date(comment.created_at).toLocaleString()} */}
                                        </p>
                                    </div>
                                    <p className={styles["comment-text"]}>{comment.content}</p>

                                    {currentUser &&
                                        (currentUser.user_id === comment.user_id ||
                                            currentUser.role === "admin") && (
                                            <button
                                                onClick={() => handleDeleteButton(comment.comment_id)}
                                                className={styles["btn-delete-comment"]}
                                            >
                                                Eliminar
                                            </button>
                                        )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={styles["no-comments"]}>Este loop no tiene comentarios aún.</p>
                    )}
                </div>

                {currentUser && (
                    <div className={styles["comment-form-container"]}>
                        <textarea
                            ref={commentInputRef}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Escribe tu comentario (máx. 150 caracteres)"
                            maxLength={150}
                            rows={3}
                            className={styles["comment-textarea"]}
                        />
                        <button
                            onClick={handleComment}
                            disabled={!canComment}
                            className={styles["btn-submit-comment"]}
                        >
                            {postingComment ? "Comentando..." : "Comentar"}
                        </button>
                    </div>
                )}
            </div>
        </MainLayout>
    )
}



