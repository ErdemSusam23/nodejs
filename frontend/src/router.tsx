import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/protected-route'
import { MainLayout } from '@/components/layouts/main-layout'

// Pages (lazy load)
import { lazy } from 'react'

const LoginPage = lazy(() => import('@/pages/login'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const UsersPage = lazy(() => import('@/pages/users'))
const RolesPage = lazy(() => import('@/pages/roles'))
const CategoriesPage = lazy(() => import('@/pages/categories'))
const AuditLogsPage = lazy(() => import('@/pages/audit-logs'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'users',
            element: <UsersPage />,
          },
          {
            path: 'roles',
            element: <RolesPage />,
          },
          {
            path: 'categories',
            element: <CategoriesPage />,
          },
          {
            path: 'audit-logs',
            element: <AuditLogsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])