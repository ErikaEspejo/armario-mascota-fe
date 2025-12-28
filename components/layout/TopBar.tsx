'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function TopBar() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/inventory?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="hidden md:flex h-16 items-center justify-between px-6 border-b bg-background sticky top-0 z-40">
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por SKU o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Usuario</span>
      </div>
    </header>
  )
}

