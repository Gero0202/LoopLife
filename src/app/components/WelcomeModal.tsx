'use client'

import styles from "@/app/styles/welcomeModal.module.css";

interface Props {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: Props) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>¡Bienvenido a LoopLife!</h2>
        <p>Explora musica. Opina sin filtro. Bienvenido a LoopLife.</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
