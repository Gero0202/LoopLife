'use client'

import { ReactElement, useState } from "react"
import MainLayout from "../components/MainLayout"
import styles from "@/app/styles/search.module.css"
import { useRouter } from "next/navigation"
import Spinner from "../components/Spinner"

interface Searchresult {
    type: 'user' | 'loop' | 'genre'
    id: string
    username?: string
    title?: string
    genre?: string
    description?: string
}


export default function Search() {
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
    const [results, setResults] = useState<Searchresult[]>([])
    const router = useRouter()

    const handelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuery(value)

        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }

        const timer = setTimeout(() => {
            fetchResults(value)
        }, 400)

        setDebounceTimer(timer)
    }

    const fetchResults = async (search: string) => {
        if (!search.trim()) {
            setResults([])
            return
        }

        setLoading(true)

        try {
            const res = await fetch(`/api/searchs?query=${encodeURIComponent(search)}`)
            const data = await res.json()
            setResults(data.results)
        } catch (error) {
            setResults([])
        } finally {
            setLoading(false)
        }

    }


    return (
        <MainLayout>
            <div className={styles["div-input-search"]}>
                <input
                    type="text"
                    value={query}
                    onChange={handelChange}
                    placeholder="Buscar"
                    className={styles["input-search"]}
                />

                <div className={styles["div-results"]}>
                    {loading && <Spinner/>}
                    {!loading && query.length > 0 && results.length === 0 && (
                        <p>No se encontraron resultados</p>
                    )}



                    {results.map((result) => (
                        <div 
                        key={result.id} 
                        className={styles["result-item"]}
                        onClick={() =>{
                            if (result.type === "user") {
                                router.push(`/user/${result.id}`)
                            } else if (result.type === "loop"){
                                router.push(`/loop/${result.id}`)
                            }else if(result.type === "genre"){
                                router.push(`/genre/${result.genre}`)
                            }
                        }}
                        >
                            {result?.type === 'user' && <p>Usuario: {result.username}</p>}
                            {result?.type === 'loop' && <div><p>Loop: {result.title}</p> <p>{result.description}</p></div>}
                            {result?.type === 'genre' && <p>Genero: {result.genre}</p>}
                        </div>
                    ))}
                </div>
            </div>

        </MainLayout>

    )
}















