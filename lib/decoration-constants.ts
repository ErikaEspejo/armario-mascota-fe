/**
 * Constantes para las opciones de decoraciones
 * Este archivo contiene todas las opciones disponibles para los dropdowns de decoraciones
 * Fácil de modificar cuando se necesiten actualizar las opciones
 */

export const DECORATION_COLORS = [
  'Amarillo Jaspeado',
  'Azul Cielo',
  'Amarillo',
  'Fucsia',
  'Rosado',
  'Tabaco',
  'Azul Cielo Estampado',
  'Azul Petróleo',
  'Rojo',
  'Verde Limón',
  'Café',
  'Naranja',
  'Tela Tipo Franela',
  'Gris Jaspeado',
  'Moraleche',
  'Negro',
  'Palo de Rosa',
  'Rosa Claro',
  'Rosado Estampado',
  'Rosado Jaspeado',
  'Verde Sapo',
  'Verde Militar',
] as const

export const BUSO_TYPES = [
  'Buso Estándar',
  'Buso Tipo Esqueleto',
  'Camiseta',
  'Impermeable',
  'Camiseta Halloween',
  'Pañoleta',
  'Buso sin Mangas',
] as const

export const IMAGE_TYPES = [
  'Buso Pequeño (Tallas Mini - Intermedio)',
  'Buso Estándar (Tallas XS - S - M - L)',
  'Buso Grande (Tallas XL)',
] as const

export const DECO_BASE_OPTIONS = [
  'Círculo',
  'Nube',
  'N/A',
] as const

/**
 * Mapea los tipos de imagen completos a códigos cortos
 */
export function mapImageTypeToCode(imageType: string): string {
  if (imageType.includes('Buso Pequeño') || imageType.includes('Mini - Intermedio')) {
    return 'IT'
  }
  if (imageType.includes('Buso Estándar') || imageType.includes('XS - S - M - L')) {
    return 'DP'
  }
  if (imageType.includes('Buso Grande') || imageType.includes('XL')) {
    return 'XL'
  }
  // Si ya es un código, retornarlo directamente
  if (['IT', 'DP', 'XL'].includes(imageType)) {
    return imageType
  }
  return imageType
}

/**
 * Obtiene las tallas disponibles según el tipo de imagen
 */
export function getAvailableSizes(imageType: string): string[] {
  const code = mapImageTypeToCode(imageType)
  switch (code) {
    case 'IT':
      return ['Mini', 'Intermedio']
    case 'DP':
      return ['XS', 'S', 'M', 'L']
    case 'XL':
      return ['XL']
    default:
      return []
  }
}

/**
 * Normaliza un string para comparación (lowercase, trim, normaliza espacios)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
}

/**
 * Encuentra el valor más cercano en un array de opciones (case-insensitive)
 */
function findMatchingOption(value: string, options: readonly string[]): string | undefined {
  if (!value) return undefined
  
  const normalizedValue = normalizeString(value)
  
  // Buscar coincidencia exacta (case-insensitive)
  const exactMatch = options.find(opt => normalizeString(opt) === normalizedValue)
  if (exactMatch) return exactMatch
  
  // Buscar coincidencia parcial
  const partialMatch = options.find(opt => 
    normalizeString(opt).includes(normalizedValue) || 
    normalizedValue.includes(normalizeString(opt))
  )
  if (partialMatch) return partialMatch
  
  return undefined
}

/**
 * Mapea el color de la API al valor exacto de la constante
 */
export function mapColorFromAPI(color: string): string {
  if (!color) return ''
  const matched = findMatchingOption(color, DECORATION_COLORS)
  return matched || color
}

/**
 * Mapea el tipo de buso de la API al valor exacto de la constante
 */
export function mapHoodieTypeFromAPI(hoodieType: string): string {
  if (!hoodieType) return ''
  const matched = findMatchingOption(hoodieType, BUSO_TYPES)
  return matched || hoodieType
}

/**
 * Mapea el tipo de imagen de la API al valor exacto de la constante
 */
export function mapImageTypeFromAPI(imageType: string): string {
  if (!imageType) return ''
  const matched = findMatchingOption(imageType, IMAGE_TYPES)
  return matched || imageType
}

/**
 * Mapea la base de decoración de la API al valor exacto de la constante
 */
export function mapDecoBaseFromAPI(decoBase: string): string {
  if (!decoBase || !decoBase.trim()) return 'N/A'
  const matched = findMatchingOption(decoBase, DECO_BASE_OPTIONS)
  return matched || decoBase
}

