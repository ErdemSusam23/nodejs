import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryProvider } from '@/providers/query-provider'
import { Toaster } from 'sonner'
import { router } from '@/router'
import { useAuthStore } from '@/store/auth'

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </QueryProvider>
  )
}

export default App