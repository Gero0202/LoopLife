'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from "@/app/styles/verifyEmail.module.css"
import MainLayout from '../components/MainLayout';
import toast from 'react-hot-toast';
import { useError } from '../context/ErrorContext';
import Swal from 'sweetalert2';

export default function VerifyEmailPage() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { showError } = useError()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/auth/verify-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await res.json();
            if (res.ok) {
                Swal.fire({
                icon: 'success',
                title: '¡Cuenta verificada!',
                text: 'Ya podés iniciar sesión.',
                confirmButtonText: 'Ir al inicio',
                confirmButtonColor: '#e740c8ff',
                background: '#fff',
                color: '#333',
            }).then(() => {
                router.push('/login');
            });
               
            } else {
                showError(data.message || 'Error al verificar la cuenta.');
            }
        } catch (error) {
            showError('Error en el servidor. Intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className={styles["verify-container"]}>
                <form onSubmit={handleSubmit} className={styles["verify-form"]}>
                    <h1>Verifica tu cuenta</h1>
                    <p className={styles["verify-description"]}>
                        Ingresá el código que enviamos a tu email.
                    </p>

                    <input
                        type="email"
                        placeholder="Tu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={styles["verify-input"]}
                    />

                    <input
                        type="text"
                        placeholder="Código de verificación"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        className={styles["verify-input"]}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles["verify-button"]}
                    >
                        {loading ? "Verificando..." : "Verificar Cuenta"}
                    </button>

                
                </form>
            </div>

        </MainLayout>
    );
}