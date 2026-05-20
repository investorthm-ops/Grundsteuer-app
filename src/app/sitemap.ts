import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { municipalitySlug } from '@/lib/seo/municipality-slug'
import { getSiteUrl } from '@/lib/seo/site-url'

type SitemapMunicipality = {
  name: string
  updated_at: string
}

export const dynamic = 'force-dynamic'

async function getMunicipalities() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return []

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data, error } = await supabase
    .from('municipalities')
    .select('name, updated_at')
    .order('name', { ascending: true })
    .limit(50000)

  if (error) return []
  return (data ?? []) as SitemapMunicipality[]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const municipalities = await getMunicipalities()
  const seenUrls = new Set<string>()

  const cityRoutes = municipalities
    .map((municipality) => {
      const url = `${siteUrl}/grundsteuer-hebesatz/${municipalitySlug(municipality.name)}`
      if (seenUrls.has(url)) return null
      seenUrls.add(url)

      return {
        url,
        lastModified: new Date(municipality.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }
    })
    .filter((route): route is NonNullable<typeof route> => route !== null)

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...cityRoutes,
  ]
}

