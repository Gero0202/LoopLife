'use client'

import { useEffect, useState } from "react"
import styles from "@/app/styles/editModalLoop.module.css"

interface EditLoopModaProps {
    loop: {
        loop_id: number
        title: string
        description: string
        rating: number
        genre: string
        mood: string
    }
    onClose: () => void
    onUpdate: (updateDate: Partial<EditLoopModaProps['loop']>) => void
}

const EditLoopModal: React.FC<EditLoopModaProps> = ({ loop, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: loop.title || "",
        description: loop.description || "",
        rating: loop.rating || 0,
        mood: loop.mood || "",
        genre: loop.genre || ""
    })

    useEffect(() => {
        setFormData(loop)
    }, [loop])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'rating' ? Number(value) : value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onUpdate(formData)
        onClose()
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>Editar loop</h2>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <input name="title" value={formData.title} onChange={handleChange} type="text" placeholder="Titulo" className={styles.modalInput} />
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripcion" className={styles.modalTextarea} />
                    <input name="rating" value={formData.rating} onChange={handleChange} type="number" placeholder="Puntaje (1-10)" min={1} max={10} className={styles.modalInput} />
                    <input name="mood" type="text" value={formData.mood} onChange={handleChange} placeholder="¿Que mood tiene?" className={styles.modalInput} />
                    <select
                        name="genre"
                        onChange={handleChange}
                        value={formData.genre}
                        required
                        className={styles['select-genre']}
                    >
                        <option value="">Seleccioná un género</option>
                        <option value="lofi">Lo-fi 🧊</option>
                        <option value="trap">Trap 🥁</option>
                        <option value="house">House 🎹</option>
                        <option value="ambient">Ambient 🌌</option>
                        <option value="techno">Techno 🎧</option>
                        <option value="rock">Rock 🎸</option>
                        <option value="jazz">Jazz 🎷</option>
                        <option value="rap">Rap</option>
                        <option value="reggaeton">Reggaetón 🔥</option>
                        <option value="dnb">Drum and Bass 🚀</option>
                        <option value="dubstep">Dubstep ⚡</option>
                        <option value="trap-soul">Trap Soul 💔</option>
                        <option value="rnb">R&B 💜</option>
                        <option value="pop">Pop 🌟</option>
                        <option value="classical">Clásica 🎼</option>
                        <option value="experimental">Experimental 🧪</option>
                        <option value="electronic">Electrónica ⚙️</option>
                        <option value="synthwave">Synthwave 🌆</option>
                        <option value="afrobeats">Afrobeats 🪘</option>
                        <option value="latin">Latino 🇲🇽</option>
                    </select>

                   
                    <div className={styles.modalButtons}>
                        <button type="submit" className={styles.btnPrimary}>Guardar</button>
                        <button type="button" onClick={onClose} className={styles.btnSecondary}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditLoopModal