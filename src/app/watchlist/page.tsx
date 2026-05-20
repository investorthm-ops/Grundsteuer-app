import { AppShell } from '@/components/app-shell'
import { WatchlistView } from '@/components/watchlist/watchlist-view'

export default function WatchlistPage() {
  return (
    <AppShell
      eyebrow="PROJ-2"
      title="Watchlist"
      description="Behalte wichtige Gemeinden im Blick und erkenne auffaellige Hebesatz-Aenderungen schneller."
    >
      <WatchlistView />
    </AppShell>
  )
}
