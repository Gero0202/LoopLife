
export default function Spinner() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh"
    }}>
      <div style={{
        width: "48px",
        height: "48px",
        border: "5px solid #f3f3f3",
        borderTop: "5px solid #ff9ac2",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
    </div>
  )
}
