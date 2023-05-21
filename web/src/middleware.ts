import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const signInURL = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    // HttpOnly: faz com que o cookie só possa visivel no back-end do nosso site e não no navegador
    return NextResponse.redirect(signInURL, {
      headers: {
        'Set-Cookie': `redirectTo=${request.url}; HttpOnly; Path=/; Max-Age=20`,
      },
    })
  }

  return NextResponse.next()
}

// Rotas na qual o middleware irá executar
export const config = {
  matcher: '/memories/:path*',
}
