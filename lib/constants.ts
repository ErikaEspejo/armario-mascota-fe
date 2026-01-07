// Base URL del backend API
// Puede ser configurada mediante la variable de entorno NEXT_PUBLIC_API_BASE_URL
// Esta URL se usa tanto para llamadas API como para construir URLs de imágenes de design assets
export const ADMIN_API_BASE_URL = (() => {
  const v = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!v) throw new Error("NEXT_PUBLIC_API_BASE_URL missing at build-time");
  return v;
})();

// Alias para compatibilidad con código existente
export const BACKEND_BASE_URL = ADMIN_API_BASE_URL



