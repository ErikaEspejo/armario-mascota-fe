# El Armario de mi Mascota - Frontend PWA

Sistema de inventario y ventas PWA (Progressive Web App) desarrollado con Next.js 14+, TypeScript, y shadcn/ui.

## Características

- ✅ PWA completa (instalable en Android e iOS)
- ✅ Diseño responsive (mobile y desktop)
- ✅ Gestión de inventario con filtros y búsqueda
- ✅ Separación de pedidos con reservas
- ✅ Proceso de venta completo
- ✅ Historial de ventas
- ✅ Generación de catálogos
- ✅ Datos mock para desarrollo

## Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Estado**: React Context API
- **PWA**: next-pwa

## Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd armario-mascota-fe
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
app/                    # Next.js App Router
  (auth)/               # Rutas de autenticación
  (dashboard)/          # Rutas del dashboard
components/
  ui/                   # Componentes shadcn/ui
  layout/               # Componentes de layout
  inventory/            # Componentes de inventario
  orders/               # Componentes de pedidos
  common/               # Componentes comunes
context/                # Context providers (AppContext, CartContext)
services/
  api/                  # Cliente API (listo para conectar)
  mock/                 # Servicios mock
types/                  # Tipos TypeScript
lib/                   # Utilidades
public/                 # Archivos estáticos y PWA
```

## Conexión con API Real

El proyecto está preparado para conectar con un backend real. Para hacerlo:

### 1. Configurar URL de API

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. Reemplazar Servicios Mock

Los servicios mock están en `services/mock/`. Reemplázalos con llamadas reales a la API:

**Ejemplo: `services/products.ts`**
```typescript
import { apiClient } from '@/services/api/client'
import { Product } from '@/types'

export async function getProducts(): Promise<Product[]> {
  return apiClient.get<Product[]>('/products')
}

export async function getProductById(id: string): Promise<Product | null> {
  return apiClient.get<Product>(`/products/${id}`)
}
```

### 3. Actualizar Context

El `AppContext` usa los servicios mock. Actualiza las importaciones:

```typescript
// Cambiar de:
import * as productService from '@/services/mock/products'

// A:
import * as productService from '@/services/products'
```

### 4. Endpoints Esperados

El backend debe implementar los siguientes endpoints:

#### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto por ID
- `GET /api/products/search?q=query` - Buscar productos

#### Pedidos
- `GET /api/orders` - Listar pedidos
- `GET /api/orders/:id` - Obtener pedido por ID
- `POST /api/orders` - Crear pedido
- `PUT /api/orders/:id/status` - Actualizar estado
- `DELETE /api/orders/:id` - Cancelar pedido

#### Ventas
- `GET /api/sales` - Listar ventas
- `GET /api/sales/:id` - Obtener venta por ID
- `POST /api/sales` - Crear venta

#### Catálogos
- `GET /api/catalogs` - Listar catálogos
- `GET /api/catalogs/:id` - Obtener catálogo por ID
- `POST /api/catalogs` - Generar catálogo

### 5. Autenticación

Para implementar autenticación real:

1. Actualiza `app/(auth)/login/page.tsx` para hacer llamadas a tu API de autenticación
2. Implementa manejo de tokens (JWT, etc.)
3. Agrega middleware de autenticación si es necesario

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## PWA

La aplicación está configurada como PWA. Para instalarla:

1. En desarrollo: La PWA está deshabilitada por defecto
2. En producción: La PWA se activa automáticamente
3. Para instalar: Los usuarios verán un prompt para "Agregar a pantalla de inicio"

### Iconos PWA

Los iconos placeholder están en `public/icons/`. Reemplázalos con tus propios iconos:
- `icon-192x192.png` (192x192px)
- `icon-512x512.png` (512x512px)

## Desarrollo

### Agregar Nuevos Componentes

Los componentes UI están en `components/ui/` usando shadcn/ui. Para agregar nuevos:

```bash
npx shadcn-ui@latest add [component-name]
```

### Agregar Nuevas Páginas

Las páginas están en `app/(dashboard)/`. Sigue la estructura de Next.js App Router.

## Notas

- Los datos mock se resetean al recargar la página (están en memoria)
- Las imágenes de productos usan placeholders (via.placeholder.com)
- Los catálogos generados tienen URLs mock
- La autenticación es mock (acepta cualquier credencial)

## Licencia

GNU General Public License v3.0

