import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", padding: "4rem" }}>
      <h1 style={{ fontSize: "2.5rem", color: "#e45a8d" }}>Página no encontrada</h1>
      <p style={{ fontSize: "1.1rem", color: "#555" }}>
        Lo sentimos, no pudimos encontrar lo que estabas buscando.
      </p>
      <Link href="/" style={{
        marginTop: "2rem",
        display: "inline-block",
        backgroundColor: "#e45a8d",
        color: "white",
        padding: "0.8rem 1.5rem",
        borderRadius: "8px",
        textDecoration: "none"
      }}>
        Volver al inicio
      </Link>
    </div>
  )
}
