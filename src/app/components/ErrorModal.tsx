'use client'

import React from 'react'
import styles from '@/app/styles/ErrorModal.module.css'

interface ErrorModalProps {
  message: string
  onClose: () => void
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <h2 className={styles.title}>¡Ups!</h2>
        <p className={styles.message}>{message}</p>
        <button className={styles.okButton} onClick={onClose}>OK</button>
      </div>
    </div>
  )
}

export default ErrorModal
