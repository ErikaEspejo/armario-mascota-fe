'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
}

export function QuantitySelector({ 
  value, 
  onChange, 
  min = 1, 
  max,
  disabled = false 
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (!disabled && value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrease = () => {
    if (!disabled && (!max || value < max)) {
      onChange(value + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10)
    if (isNaN(newValue)) {
      return
    }
    if (newValue < min) {
      onChange(min)
    } else if (max && newValue > max) {
      onChange(max)
    } else {
      onChange(newValue)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        className="h-8 w-8"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className="w-16 text-center"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrease}
        disabled={disabled || (max !== undefined && value >= max)}
        className="h-8 w-8"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}



