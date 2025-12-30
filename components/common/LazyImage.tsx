'use client'

import { useEffect, useRef, useState, ImgHTMLAttributes } from 'react'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string
  alt: string
  placeholderClassName?: string
  errorPlaceholderClassName?: string
}

export function LazyImage({
  src,
  alt,
  className,
  placeholderClassName,
  errorPlaceholderClassName,
  ...imgProps
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Si ya está en viewport, cargar inmediatamente
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Cargar un poco antes de entrar en viewport
      }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleError = () => {
    setHasError(true)
    setIsLoaded(false)
  }

  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
    >
      {!isInView ? (
        // Placeholder antes de entrar en viewport (sin request HTTP)
        <div
          className={cn(
            'flex items-center justify-center bg-muted text-muted-foreground w-full h-full',
            placeholderClassName || className
          )}
        >
          <ImageIcon className="h-12 w-12" />
        </div>
      ) : hasError ? (
        // Placeholder de error
        <div
          className={cn(
            'flex items-center justify-center bg-muted text-muted-foreground w-full h-full',
            errorPlaceholderClassName || className
          )}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <ImageIcon className="h-12 w-12 text-destructive" />
            <span className="text-xs text-destructive">Error al cargar imagen</span>
          </div>
        </div>
      ) : (
        // Renderizar imagen cuando está en viewport
        <img
          src={src}
          alt={alt}
          className={cn(
            className,
            !isLoaded && 'opacity-0',
            isLoaded && 'opacity-100 transition-opacity duration-200'
          )}
          onError={handleError}
          onLoad={handleLoad}
          {...imgProps}
        />
      )}
    </div>
  )
}

