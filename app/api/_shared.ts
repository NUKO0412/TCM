export function reply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

export const isText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== ''

export function getSupabaseServerEnv(): { supabaseUrl: string; serviceKey: string } | null {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  return supabaseUrl && serviceKey ? { supabaseUrl, serviceKey } : null
}
