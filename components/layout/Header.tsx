'use client'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="md:hidden flex h-14 items-center justify-between px-4 border-b bg-background sticky top-0 z-40">
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  )
}

