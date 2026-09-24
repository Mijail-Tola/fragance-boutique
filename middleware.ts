import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdmin = request.cookies.has('fragance_admin')
  const urlActual = request.nextUrl.pathname

  // 1. Si intentan entrar al administrador SIN permiso
  if (urlActual.startsWith('/admin')) {
    if (!isAdmin) {
      // LO ENGAÑAMOS: Lo devolvemos al catálogo principal silenciosamente
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 2. Si intentas entrar a tu URL SECRETA de login pero ya tienes permiso
  if (urlActual.startsWith('/portal-staff')) {
    if (isAdmin) {
      // Te pasa directo al panel
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/portal-staff/:path*' // <- Asegúrate de poner aquí el mismo nombre que le diste a tu carpeta
  ],
}