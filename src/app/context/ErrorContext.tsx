'use client'

import React, { createContext, useState, useContext, ReactNode } from "react"
import ErrorModal from "../components/ErrorModal"

interface ErrorContextType {
    showError: (message: string) => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const showError = (message: string) =>{
        setErrorMessage(message)
    }

    const hideError = () =>{
        setErrorMessage(null)
    }

    return(
        <ErrorContext.Provider value={{ showError }}>
            {children}
            {errorMessage && (
                <ErrorModal message={errorMessage} onClose={hideError}/>
            )
          }
        </ErrorContext.Provider>
    )
}

export const useError = () =>{
    const context = useContext(ErrorContext)
    if (context === undefined) {
        throw new Error('useError debe ser usado dentro de un ErrorProvider')
    }
    return context
}