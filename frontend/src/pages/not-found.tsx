import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-3xl font-semibold">Sayfa Bulunamadı</h2>
        <p className="mt-2 text-muted-foreground">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Button asChild className="mt-8">
          <Link to="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Link>
        </Button>
      </div>
    </div>
  )
}