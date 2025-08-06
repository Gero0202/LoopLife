'use client'

import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"


type User = {
    user_id: number
    username: string
    role: string
    name: string
    email: string
    bio?: string
    avatar: string
}

type AuthContextType = {
    currentUser: User | null
    loading: boolean
    setCurrentUser: (user: User | null) => void
    logout: () => Promise<void>
    login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>

}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    loading: true,
    setCurrentUser: () =>{},
    logout: async () => { },
    login: async () => ({ success: false, message: "No implementado" })
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

  

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/auth/online`)
                if (res.ok) {
                    const data = await res.json()
                    setCurrentUser(data.user as User)
                } else {
                    setCurrentUser(null)
                }
            } catch (error) {
                setCurrentUser(null)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    const logout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" })
            if (res.ok) {
                setCurrentUser(null)
                router.push("/")
            } else {
                console.error("Error al cerrar sesion")
            }
        } catch (error) {
            console.error("Error al cerrar sesion")
        }
    }

    const login = async (identifier: string, password: string) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, password }),
            })

            const data = await res.json()

            if (res.ok) {
                setCurrentUser(data.user) 
                return { success: true }
            } else {
                console.error("Error en la respuesta del servidor:", data)
                return { success: false, message: data.message || "Error desconocido" }
            }
        } catch (error) {
            return { success: false, message: "Error de red" }
        }

    }

    return (
        <AuthContext.Provider value={{ setCurrentUser ,currentUser, loading, logout, login }}>
            {children}
        </AuthContext.Provider>
    )

}

export const useAuth = () => useContext(AuthContext)