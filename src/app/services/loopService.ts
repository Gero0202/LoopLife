export async function fecthLoop() {
    const res = await fetch('/api/loops')
    if (!res) throw new Error('Error al traer los loops')
    return await res.json()    
}