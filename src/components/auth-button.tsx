'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type AuthButtonProps = {
  isAuthenticated: boolean
}

export function AuthButton({ isAuthenticated }: AuthButtonProps) {
  const router = useRouter()

  if (!isAuthenticated) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">
          <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
          Anmelden
        </Link>
      </Button>
    )
  }

  async function logout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={logout}>
      <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
      Abmelden
    </Button>
  )
}
