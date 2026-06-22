export default function handler(_request: Request) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return Response.json({ error: 'Supabase public config missing.' }, { status: 500 })
  }

  return Response.json(
    {
      supabaseUrl,
      supabaseAnonKey,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}
