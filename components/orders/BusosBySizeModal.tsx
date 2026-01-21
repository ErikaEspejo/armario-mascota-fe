'use client'

import { ReservedOrderItem } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LazyImage } from '@/components/common/LazyImage'

interface BusosBySizeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ReservedOrderItem | null
}

export function BusosBySizeModal({
  open,
  onOpenChange,
  item,
}: BusosBySizeModalProps) {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {item.tipoBuso} - Talla {item.talla}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {item.busos.length} buso(s) disponible(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {item.busos && item.busos.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4">
              {item.busos.map((buso) => (
                <div
                  key={buso.id}
                  className="flex flex-col items-center space-y-1 sm:space-y-2 p-1 sm:p-2 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="relative w-full aspect-square bg-muted rounded overflow-hidden">
                    <LazyImage
                      src={buso.imageUrl}
                      alt={`Buso ${buso.id}`}
                      className="w-full h-full object-cover"
                    />
                    {buso.qty > 0 && (
                      <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-md">
                        {buso.qty}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-center text-muted-foreground font-medium">
                    ID: {buso.id}
                  </p>
                  {buso.colorPrimary && (
                    <p className="text-[10px] sm:text-xs text-center text-primary font-semibold mt-1 uppercase">
                      {buso.colorPrimary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay busos disponibles para esta talla
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

