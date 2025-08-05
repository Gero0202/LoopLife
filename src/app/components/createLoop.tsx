'use client'

import styles from "@/app/styles/createLoop.module.css"
import { useState } from "react"

type NewLoop = {
    title: string
    description: string
    genre: string
    rating: number
    mood: string
    audio_url: string
}

interface CreateLoopProps {
    onClose: () => void
    onSave: (saveLoop: NewLoop) => void
}


const CreateLoopModal: React.FC<CreateLoopProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({

        title: "",
        description: "",
        genre: "",
        rating: 0,
        mood: "",
        audio_url: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'rating' ? Number(value) : value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
        onClose()
    }

    return (
        <div className={styles['modal-overlay']}>
            <div className={styles['modal-content']}>
                <h2>Crear un loop</h2>
                <form onSubmit={handleSubmit}>
                    <input name="title" onChange={handleChange} value={formData.title} type="text" placeholder="Titulo" required />


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
                        <option value="rap">Rap</option>
                        <option value="rock">Rock 🎸</option>
                        <option value="jazz">Jazz 🎷</option>
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

                    <input name="rating" onChange={handleChange} value={formData.rating} type="number" min={1} max={10} placeholder="Puntaje (1-10)" />
                    <input name="mood" onChange={handleChange} value={formData.mood} type="text" placeholder="¿Que mood tiene?" />
                    <input name="audio_url" onChange={handleChange} value={formData.audio_url} type="text" placeholder="URL de la cancion" />
                    <textarea name="description" onChange={handleChange} value={formData.description} placeholder="Descripcion" />

                    <div className={styles['modal-buttons']}>
                        <button type="submit">Crear</button>
                        <button type="button" onClick={onClose}>Cerrar</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateLoopModal