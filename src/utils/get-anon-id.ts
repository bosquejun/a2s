import { cookies } from "next/headers"


export async function getAnonId() {
    const cookieStore = await cookies()
    return cookieStore.get("a2s_anon_id")?.value || `anon_unknown`
}