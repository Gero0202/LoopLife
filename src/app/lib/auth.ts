import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken"


interface AuthUserPayload extends JwtPayload {
  user_id: number
  role: string
}

const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no esta definido en las variables de entorno')
}

export async function getAuthUser(): Promise<AuthUserPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return null

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUserPayload

    return payload
  } catch (error) {
    return null
  }
}

export async function requireRole(allAllowedRoles: string[]) {
  const userPayload = await getAuthUser()

  if (!userPayload) {
    return null
  }

  if (!allAllowedRoles.includes(userPayload.role.trim().toLocaleLowerCase())) {
    return null
  }

  return userPayload

}