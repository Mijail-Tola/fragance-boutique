import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. El guardia verifica si tienes la credencial (cookie) de administrador
  const isAdmin = request.cookies.has('fragance_admin')

  // 2. Si intentas entrar a la bóveda (/admin) y no tienes pase, te manda a la puerta (/login)
  if (request.nextUrl.pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Si intentas ir al /login pero YA tienes pase, te manda directo adentro
  if (request.nextUrl.pathname.startsWith('/login') && isAdmin) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Si todo está en orden, te deja pasar
  return NextResponse.next()
}

// Le decimos al middleware en qué rutas debe estar vigilando
export const config = {
  matcher: ['/admin/:path*', '/login/:path*'],
}