import bcrypt from "bcryptjs";

export async function hashpassword(plainPassword: string): Promise<string> {
    const saltRounds = 10
    return await bcrypt.hash(plainPassword, saltRounds)
} 

export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword)
}