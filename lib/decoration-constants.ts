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

export const AVAILABLE_SIZES = ['Mini', 'Intermedio', 'XS', 'S', 'M', 'L', 'XL'] as const

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
 * El imageType puede venir en formato nuevo (código compuesto ej: "MnItXSMLH" o separado por comas ej: "Mini,XS,S")
 * o formato antiguo (textos como "Buso Pequeño (Tallas Mini - Intermedio)")
 */
export function getAvailableSizes(imageType: string): string[] {
  if (!imageType || !imageType.trim()) return []
  
  // Si contiene comas, es formato nuevo separado por comas
  if (imageType.includes(',')) {
    return parseImageTypeToSizes(imageType)
  }
  
  // Si contiene códigos del nuevo formato (Mn, It, X, S, M, L, H), parsearlo como código compuesto
  // Case-insensitive para detectar el formato nuevo
  const upperText = imageType.trim().toUpperCase()
  if (upperText.includes('MN') || upperText.includes('IT') || upperText.includes('X') || 
      upperText.includes('S') || upperText.includes('M') || upperText.includes('L') || upperText.includes('H')) {
    return parseImageTypeToSizes(imageType)
  }
  
  // Compatibilidad con formato antiguo (por si hay datos antiguos)
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

/**
 * Mapea códigos de talla del backend a nombres completos
 * Códigos: Mn → Mini, It → Intermedio, X → XS, S → S, M → M, L → L, H → XL
 */
function mapSizeCodeToName(sizeCode: string): string {
  const sizeMap: Record<string, string> = {
    'Mn': 'Mini',
    'It': 'Intermedio',
    'X': 'XS',
    'S': 'S',
    'M': 'M',
    'L': 'L',
    'H': 'XL',
  }
  return sizeMap[sizeCode] || sizeCode
}

/**
 * Parsea el imageType del backend
 * Formato nuevo: código compuesto sin separadores (ej: "MnItXSMLH")
 * Formato antiguo: nombres separados por comas (ej: "Mini,XS,S")
 */
export function parseImageTypeToSizes(imageType: string): string[] {
  if (!imageType || !imageType.trim()) return []
  
  // Si contiene comas, es el formato antiguo (nombres separados por comas)
  if (imageType.includes(',')) {
    const sizes = imageType.split(',').map(s => s.trim()).filter(s => s.length > 0)
    const mappedSizes = sizes.map(size => mapSizeCodeToName(size))
    return mappedSizes.filter(size => AVAILABLE_SIZES.includes(size as typeof AVAILABLE_SIZES[number]))
  }
  
  // Formato nuevo: código compuesto sin separadores (ej: "MnItXSMLH")
  // Mapeo de códigos a nombres: Mn → Mini, It → Intermedio, X → XS, S → S, M → M, L → L, H → XL
  // IMPORTANTE: Si aparece "XS" en el código compuesto, son DOS tallas: X (XS) y S (S)
  const foundSizes: Set<string> = new Set()
  const text = imageType.trim()
  
  // Buscar códigos de 2 caracteres primero (Mn, It) - case insensitive
  if (text.match(/Mn/i)) foundSizes.add('Mini')
  if (text.match(/It/i)) foundSizes.add('Intermedio')
  
  // Códigos de 1 carácter - case insensitive
  if (text.match(/H/i)) foundSizes.add('XL')
  if (text.match(/L/i)) foundSizes.add('L')
  
  // Para M: buscar todas las M que no sean parte de Mn
  let searchIndex = 0
  const upperText = text.toUpperCase()
  while (true) {
    const mIndex = upperText.indexOf('M', searchIndex)
    if (mIndex === -1) break
    // Verificar si esta M es parte de Mn
    if (mIndex === upperText.length - 1 || upperText[mIndex + 1] !== 'N') {
      foundSizes.add('M')
    }
    searchIndex = mIndex + 1
  }
  
  // Para X: buscar todas las X (cada X representa XS)
  searchIndex = 0
  while (true) {
    const xIndex = upperText.indexOf('X', searchIndex)
    if (xIndex === -1) break
    foundSizes.add('XS')
    searchIndex = xIndex + 1
  }
  
  // Para S: buscar todas las S (cada S representa S)
  searchIndex = 0
  while (true) {
    const sIndex = upperText.indexOf('S', searchIndex)
    if (sIndex === -1) break
    foundSizes.add('S')
    searchIndex = sIndex + 1
  }
  
  // Convertir Set a Array y filtrar solo las tallas válidas
  const validSizes = Array.from(foundSizes).filter(size => 
    AVAILABLE_SIZES.includes(size as typeof AVAILABLE_SIZES[number])
  )
  
  // Ordenar según el orden especificado: Mini, Intermedio, XS, S, M, L, XL
  const order = ['Mini', 'Intermedio', 'XS', 'S', 'M', 'L', 'XL']
  return validSizes.sort((a, b) => {
    const indexA = order.indexOf(a)
    const indexB = order.indexOf(b)
    // Si no están en el orden, mantenerlos al final
    if (indexA === -1 && indexB === -1) return 0
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })
}

/**
 * Convierte un array de tallas a string concatenado por comas
 * Las tallas se ordenan según el orden: Mini > Intermedio > XS > S > M > L > XL
 */
export function sizesToImageTypeString(sizes: string[]): string {
  if (!sizes || sizes.length === 0) return ''
  
  // Filtrar solo las tallas válidas
  const validSizes = sizes.filter(size => AVAILABLE_SIZES.includes(size as typeof AVAILABLE_SIZES[number]))
  
  // Ordenar según el orden definido en AVAILABLE_SIZES
  const sortedSizes = validSizes.sort((a, b) => {
    const indexA = AVAILABLE_SIZES.indexOf(a as typeof AVAILABLE_SIZES[number])
    const indexB = AVAILABLE_SIZES.indexOf(b as typeof AVAILABLE_SIZES[number])
    return indexA - indexB
  })
  
  return sortedSizes.join(',')
}

