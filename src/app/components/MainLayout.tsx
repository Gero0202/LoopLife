'use client'
import { ReactNode, useEffect, useState } from "react"
import styles from "@/app/styles/mainlayout.module.css"
import { IoClose, IoConstructOutline, IoHomeOutline, IoLibraryOutline, IoLogOutOutline, IoMenu, IoMoonOutline, IoMusicalNotes, IoPersonOutline, IoPlayOutline, IoSearchCircleOutline, IoSearchOutline, IoTrendingUpOutline } from "react-icons/io5"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "../context/AuthContext"
import { useError } from "../context/ErrorContext"

type Props = {
    children: ReactNode
}

export default function MainLayout({ children }: Props) {
    const pathname = usePathname()
    const router = useRouter()
    const { logout, currentUser, loading } = useAuth()
    const [isTooSmall, setIsTooSmall] = useState(false)
    const { showError } = useError()


    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleClicMenu = () => {
        setIsMenuOpen(false);
    };


    useEffect(() => {
        const checkScreenSize = () => {
            setIsTooSmall(window.innerWidth <= 510)
        }

        checkScreenSize()
        window.addEventListener("resize", checkScreenSize)
        return () => window.removeEventListener("resize", checkScreenSize)
    }, [])



    const handleClickWindow = async (e: React.MouseEvent) => {
        if (pathname === "/") {
            e.preventDefault()
            window.location.reload()
        }
    }

    const habndleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST"
            })
            if (res.ok) {
                router.push("/")
            } else {
                showError("Error al cerrar sesion")
            }

        } catch (error) {
           showError("Error al cerrar sesion, intente mas tarde.")
        }
    }


    return (
        <>

            <div id={styles["div-general"]}>

                <div id={styles["div-left-general"]} className={isMenuOpen ? styles["menu-open"] : ''}>

                    <Link href={"/"} onClick={handleClickWindow} className={styles['icono-musical']} style={{ marginTop: "16px", marginBottom: "120px" }}>
                        <IoMusicalNotes size={50} color="black" />
                    </Link>
                    <div className={styles["div-iconos-left"]}>
                        <Link href={"/search"}>
                            <IoSearchOutline size={29} color="black" />
                        </Link>

                        <Link href={"/libraryLoops"}>
                            <IoLibraryOutline size={29} color="black" />
                        </Link>



                        <IoConstructOutline
                            size={29}
                            color="black"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                if (!currentUser) {
                                    router.push("/login")
                                } else {
                                    router.push("/configurationp")
                                }
                            }}
                        />


                        {currentUser && (
                            <div className={styles["div-logout-icono"]}>
                                <IoLogOutOutline size={29} color="black" onClick={logout} />

                            </div>
                        )}

                    </div>

                </div>


                <div id={styles["div-center-general"]}>
                    {children}
                </div>

            </div>




            <div id={styles["div-navbar"]}>
                <div className={styles['left-nav-section']}>

                    <button onClick={toggleMenu} className={styles["hamburger-button"]}>
                        {isMenuOpen ? <IoClose size={32} /> : <IoMenu size={32} />}
                    </button>

                    {!currentUser && !loading && (
                        <div className={styles["div-auth"]}>
                            <Link href={"/login"}>
                                <button className={`${styles["auth-button"]} ${styles.primary}`}>LOGIN</button>
                            </Link>
                            <Link href={"/register"}>
                                <button className={`${styles["auth-button"]} ${styles.secondary}`}>REGISTER</button>
                            </Link>
                        </div>
                    )}

                </div>


                <div className={styles['navbar-center']}>
                    <Link
                        href={"/"}
                        onClick={handleClickWindow}
                        className={`${styles["nav-icon"]} ${!currentUser && isTooSmall ? styles["hide-on-small"] : ""
                            }`}
                    >
                        <IoHomeOutline className={styles["nav-icon"]} />
                    </Link>

                    {currentUser && (
                        <div >
                            <Link href={"/online"} className={styles['icono-online']}>
                                <IoPersonOutline className={styles["nav-icon"]} />
                            </Link>
                        </div>
                    )}

                </div>
              
                <div className={styles['right-spacer']} />
            </div>
        </>
    )
}