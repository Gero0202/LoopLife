'use  client'

import { useState } from "react"
import styles from "@/app/styles/editProfile.module.css"

type Props = {
    name: string
    username: string
    bio?: string
    avatar: string
    onClose: () => void
    onSave: (data: { name: string; username: string; bio?: string }) => void
}

export default function EditProfileModal({ name, username, bio, avatar, onClose, onSave }: Props) {
    const [formData, setFormData] = useState({
        name: name || '',
        username: username || '',
        bio: bio || "",
        avatar: avatar || ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
        onClose()
    }

    return (
        <div className={styles["modal-overlay"]}>
            <div className={styles["modal-content"]}>
                <h2 className={styles["modal-title"]}>Editar perfil</h2>
                <form onSubmit={handleSubmit} className={styles["edit-form"]}>
                    <img src={formData.avatar} alt="avatar preview" className={styles["avatar-preview"]} />

                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        type="text"
                        placeholder="Nombre"
                        required
                        className={styles["edit-input"]}
                    />
                    <input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        type="text"
                        placeholder="Username"
                        required
                        className={styles["edit-input"]}
                    />
                    <input
                        name="avatar"
                        value={formData.avatar}
                        onChange={handleChange}
                        type="text"
                        placeholder="URL de tu imagen"
                        className={styles["edit-input"]}
                    />
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Biografía..."
                        className={styles["edit-textarea"]}
                    />

                    <div className={styles["button-group"]}>
                        <button type="submit" className={styles["save-button"]}>Guardar</button>
                        <button type="button" onClick={onClose} className={styles["cancel-button"]}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>

    )
}