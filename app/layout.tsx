import type { Metadata, Viewport } from 'next'
import './globals.css'
import RegisterServiceWorker from '@/components/layout/RegisterServiceWorker'

export const metadata: Metadata = {
  title: 'Class Portal',
  description: 'Class management portal for students and admins',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Class Portal',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#6d28d9',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  )
}
