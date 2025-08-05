type InsertQery = {
    text: string
    values: unknown[]
}

export function buildInsertQuery(table: string, data: Record<string, unknown>, returning?: string[]): InsertQery{
    const columns: string[] = []
    const values: unknown[] = []
    const placeholders: string[] = []

    let index = 1

    for(const [key, value] of Object.entries(data)){
        if (value !== undefined && value !== null) {
            columns.push(key)
            placeholders.push(`$${index}`)
            values.push(value)
            index++
        }
    }

    const text = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) ${returning && returning.length > 0 ? `RETURNING ${returning.join(', ')}` : ''}`.trim()

    return { text, values }
}