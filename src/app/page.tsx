'use client'
import { useEffect, useState } from "react";
import MainLayout from "./components/MainLayout";
import { fecthLoop } from "./services/loopService";
import CardLoop from "./components/cardLoop";
import { Loop } from "./types/Loop";
import styles from "@/app/styles/page.module.css"
import { useRouter } from "next/navigation";
import { useLikeLoop } from "./lib/useLikeLoop";
import { useAuth } from "./context/AuthContext";
import { IoAddCircleOutline } from "react-icons/io5";
import CreateLoopModal from "./components/createLoop";
import Spinner from "./components/Spinner";
import { useError } from "./context/ErrorContext";
import WelcomeModal from "./components/WelcomeModal";


const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};


interface LoopPost {
  user_id: number
  title: string
  description: string
  genre: string
  rating: number
  mood: string
  audio_url: string
}


export default function Home() {
  const [loops, setLoops] = useState<Loop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [showWelcome, setShowWelcome] = useState(false)


  const { currentUser, loading: authLoading } = useAuth();
  const { toggleLike } = useLikeLoop()
  const { showError } = useError()

  const [showPost, setShowPostModal] = useState(false)


  useEffect(() => {
    if (authLoading) {
      return
    }

    setLoading(true)
    setError(null)

    fecthLoop()
      .then((data) => {
        const fetchedLoops: Loop[] = Array.isArray(data.loops) ? data.loops : [];

        const shuffledLoops = shuffleArray(fetchedLoops)

        setLoops(shuffledLoops);
      })
      .catch((err) => showError(err.message || "Ocurrio un error al cargar los loops"))
      .finally(() => {
        setLoading(false)
      })
  }, [authLoading, currentUser])


  useEffect(() => {
    const alreadyVisited = localStorage.getItem("visited_home")

    if (!alreadyVisited) {
      setShowWelcome(true)
      localStorage.setItem("visited_home", "true")
    }
  }, [])

  const handleCardContainerLink = (loopId: number) => {
    router.push(`/loop/${loopId}`)
  }


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


    setLoops((prevLoops) =>
      prevLoops.map((loop) =>
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

    if (result === "error" || result === "unauthorized") {

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
      if (result === "error") {
        showError("Ocurrió un error al intentar procesar tu like.");
      }
    }

  }


  const handlePostClick = () => {
    if (!currentUser) {
      showError("Debes iniciar sesión para crear un post");
      return;
    }

    setShowPostModal(true)
  }

  const handlePost = async (saveLoop: Partial<LoopPost>) => {
    if (!currentUser) {
      showError("Tenes que estar logeado para crear un post")
      return
    }

    try {
      const res = await fetch(`/api/loops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...saveLoop,
          user_id: currentUser.user_id
        })
      })

      const data = await res.json()
      if (!res.ok) {

        if (res.status === 420) {
          showError(data.message || "Limite de loops diarios alcanzado. Intenta mañana.")
        } else {
          showError(data.message || "Error al hacer post de loop")
        }
        return
      }

      setShowPostModal(false)
      window.location.reload()

    } catch (error) {

      showError("Error inesperado al crear post")
    }
  }

  if (loading || authLoading) {
    return <MainLayout><Spinner /></MainLayout>;
  }
  if (error) return <p>Error: {error}</p>
  return (
    <>
      <MainLayout>
        <div className={styles['div-page-home']}  >
          { showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)}/> }
          {Array.isArray(loops) && loops.length > 0 ? (
            loops.map((loop) => (
              <div
                key={loop.loop_id}

                onClick={() => handleCardContainerLink(loop.loop_id)}
              >
                <CardLoop
                  loop_id={loop.loop_id}
                  username={loop.user.username}
                  avatar={loop.user.avatar}
                  genre={loop.genre}
                  rating={loop.rating}
                  title={loop.title}
                  description={loop.description}
                  audio_url={loop.audio_url}
                  likes={loop.likes}
                  comments={loop.comments}
                  mood={loop.mood}
                  isLikedByCurrentUser={!!loop.is_liked_by_current_user}
                  onPlay={() => ""}
                  onLike={(e) => handleLike(e, loop.loop_id, !!loop.is_liked_by_current_user)}
                  onCommment={() => router.push(`/loop/${loop.loop_id}`)}
                />
              </div>
            ))
          ) : (

            <p>No se encontraron loops para mostrar.</p>
          )}
          <button
            className={styles['button-post-loop']}
            onClick={(e) => { e.stopPropagation(); handlePostClick() }}
          >+</button>
        </div>
      </MainLayout>

      {showPost && currentUser && (
        <CreateLoopModal
          onClose={() => setShowPostModal(false)}
          onSave={handlePost}
        />
      )}
    </>
  );
}

