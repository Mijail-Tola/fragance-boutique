import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ==========================================
// 🛡️ SISTEMA DE RATE LIMITING LIGERO (EN MEMORIA EDGE)
// Protege los límites gratuitos de Supabase y Vercel
// ==========================================
const rateLimitMap = new Map();
const LIMIT_WINDOW_MS = 60 * 1000; // 1 Minuto
const MAX_REQUESTS = 60; // 60 recargas o acciones por minuto por IP

function checkRateLimit(ip: string): boolean {
  const currentWindow = Math.floor(Date.now() / LIMIT_WINDOW_MS);
  const key = `${ip}-${currentWindow}`;
  const requestCount = rateLimitMap.get(key) || 0;

  if (requestCount >= MAX_REQUESTS) {
    return false; // Bloqueado
  }

  rateLimitMap.set(key, requestCount + 1);

  // Limpieza automática
  setTimeout(() => {
    rateLimitMap.delete(key);
  }, LIMIT_WINDOW_MS);

  return true; // Permitido
}

export function middleware(request: NextRequest) {
  const res = NextResponse.next()

  // ---------------------------------------------------------
  // 1. RATE LIMITING (Protección contra Spam y Bots)
  // ---------------------------------------------------------
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  
  if (!checkRateLimit(ip)) {
    return new NextResponse('Demasiadas peticiones. Por favor, espera un minuto.', { 
      status: 429,
      headers: { 'Retry-After': '60' }
    });
  }

  // ---------------------------------------------------------
  // 2. ENCABEZADOS DE SEGURIDAD (Security Headers)
  // ---------------------------------------------------------
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // ---------------------------------------------------------
  // 3. PROTECCIÓN DEL PANEL ADMINISTRADOR (Tu lógica original segura)
  // ---------------------------------------------------------
  const isAdmin = request.cookies.has('fragance_admin')
  const urlActual = request.nextUrl.pathname

  // Si intentan entrar al administrador SIN permiso
  if (urlActual.startsWith('/admin')) {
    if (!isAdmin) {
      // LO ENGAÑAMOS: Lo devolvemos al catálogo principal silenciosamente
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Si intentas entrar a tu URL SECRETA de login pero ya tienes permiso
  if (urlActual.startsWith('/portal-staff')) {
    if (isAdmin) {
      // Te pasa directo al panel
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    // Ejecuta el middleware en TODA la web para que el Rate Limit proteja todo,
    // EXCEPTO en archivos estáticos (imágenes, CSS, etc.) para no gastar memoria.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}