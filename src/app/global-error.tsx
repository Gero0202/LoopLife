'use client' 
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{
        margin: 0,
        padding: 0,
        height: "100vh",
        background: "linear-gradient(135deg, #1e1e1e, #121212)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Noto Sans', sans-serif",
        color: "#fff",
        textAlign: "center"
      }}>
        <div style={{
          backgroundColor: "#2b2b2b",
          padding: "2.5rem 2rem",
          borderRadius: "16px",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
          maxWidth: "400px",
          width: "90%"
        }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem", color: "#e45a8d" }}>
            ¡Ups! Algo salió mal.
          </h2>
          <p style={{ fontSize: "1rem", color: "#ccc", marginBottom: "2rem" }}>
            No te preocupes, ya estamos al tanto.<br />
            Podés intentar de nuevo si querés.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              backgroundColor: "#e45a8d",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}