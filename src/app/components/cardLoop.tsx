'use client'
import Link from "next/link";
import styles from "@/app/styles/cardLoop.module.css"
import { IoHeartOutline, IoPlayCircleOutline, IoChatboxOutline, IoHeartSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import EmbeddedPlayer from "./EmbeddedPlayer";


type cardLoopProps = {
    loop_id: number
    title: string
    description: string
    avatar: string
    audio_url: string
    likes: number
    comments: number
    username: string
    genre: string
    rating?: number
    mood?: string
    isLikedByCurrentUser: boolean

    onPlay: (e: React.MouseEvent<HTMLButtonElement>) => void
    onLike: (e: React.MouseEvent<HTMLButtonElement>, currentIsLiked: boolean) => void
    onCommment: (e: React.MouseEvent<HTMLButtonElement>) => void

}

export default function CardLoop({
    loop_id,
    title,
    description,
    avatar,
    audio_url,
    likes,
    comments,
    username,
    genre,
    rating,
    mood,
    isLikedByCurrentUser,
    onPlay,
    onLike,
    onCommment
}: cardLoopProps) {
    const [showPlayer, setShowPlayer] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth <= 500);
        }

        handleResize(); 
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [])

    return (
        <>
            <div className={styles["card-loop"]}>
                <img src={avatar} alt={title} />
                
                <div className={styles["card-loop-info"]}>
                    <div className={styles["card-info-text"]}>
                        
                        <div className={styles["div-info-text-left"]}>
                            <p className={styles["card-loop-username"]}>{username}</p>
                            <p className={styles["card-loop-title"]}>{title}</p>
                        </div>

                        <div className={styles["div-info-text-right"]}>
                            <p><strong>Mood: </strong>{mood ? mood : ""}</p>
                            <p><strong>Genero: </strong>{genre ? genre : ""}</p>
                            <p><strong>Puntaje: </strong>{rating ? rating : ""}</p>
                        </div>
                      
                        <div style={{ marginTop: "-13" }}>
                            <p style={{ fontSize: "16px", marginTop: "22px" }}>Descripcion: </p>
                            <p className={styles["card-loop-description"]}>{description}</p>
                        </div>
                    </div>
                    <div className={styles["card-loop-buttons"]}>
                        <div className={styles["card-div-like"]}>
                            <button
                                className={styles["card-loop-like-button"]}
                                onClick={(e) => onLike(e, isLikedByCurrentUser)}
                            >
                                {isLikedByCurrentUser ? (
                                    <IoHeartSharp size={24} color="red" cursor="pointer" />
                                ) : (
                                    <IoHeartOutline size={24} color="red" cursor="pointer" />
                                )}
                            </button>
                            <p className={styles["card-loop-likes"]}>{likes ?? 0}</p>
                        </div>

                        <div className={styles["card-div-comment"]}>
                            <button className={styles["card-loop-comment-button"]} onClick={onCommment}>
                                <IoChatboxOutline size={24} cursor="pointer" />
                            </button>

                            <p className={styles["card-loop-comment"]}>{comments ?? 0}</p>
                        </div>
                    </div>
                </div>


                <button
                    className={styles["card-loop-play-button"]}
                    onClick={(e) => { e.stopPropagation(); setShowPlayer(!showPlayer) }}
                >
                    <IoPlayCircleOutline size={24} cursor="pointer" />
                </button>



            </div>

            {showPlayer && (
                <div
                    className={styles["modal-overlay"]}
                    onClick={(e) => { e.stopPropagation(); setShowPlayer(false) }}
                >
                    <div
                        className={styles["modal-player"]}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className={styles["close-button"]}
                            onClick={() => setShowPlayer(false)}
                        >
                            ✖
                        </button>

                        <div className={styles["player-wrapper"]}>
                            <EmbeddedPlayer url={audio_url} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

