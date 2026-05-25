import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client.
 *
 * SECURITY: This client bypasses RLS. It must ONLY be used inside
 * server-side route handlers / server actions, never in any code path
 * that can run in the browser. The service-role key must be stored in
 * `SUPABASE_SERVICE_ROLE_KEY` (NO `NEXT_PUBLIC_` prefix).
 */
let cachedClient: SupabaseClient | null = null

export function createSupabaseAdminClient(): SupabaseClient {
  if (cachedClient) return cachedClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
  }
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return cachedClient
}
