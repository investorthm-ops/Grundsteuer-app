import type { SupabaseClient } from '@supabase/supabase-js'

export async function isAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle()

  if (error) return false
  return data?.role === 'admin'
}
