'use client'

import { PingButton } from '@/components/common/PingButton'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50">
        <PingButton />
      </div>
    </>
  )
}

