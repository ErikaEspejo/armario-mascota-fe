'use client'

import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
  showSearch?: boolean
}

export function Header({ title, showSearch = false }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="md:hidden flex h-14 items-center justify-between px-4 border-b bg-background sticky top-0 z-40">
      <h1 className="text-lg font-semibold">{title}</h1>
      {showSearch && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/inventory')}
        >
          <Search className="h-5 w-5" />
        </Button>
      )}
    </header>
  )
}

