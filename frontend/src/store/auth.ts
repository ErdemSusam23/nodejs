import { create } from 'zustand'
import Cookie from 'js-cookie'
import type { User } from '@/types'
import { authApi } from '@/api/auth'

interface AuthState {
  user: any | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: any, token: string) => void
  clearAuth: () => void
  updateUser: (user: any) => void
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, token) => {
        Cookie.set('token', token)
        set({ user, token, isAuthenticated: true, isLoading: false })
      },

      clearAuth: () => {
        Cookie.remove('token')
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      },

      updateUser: (user) => {
        set({ user })
      },

      initializeAuth: async () => {
        const token = Cookie.get('token')
        if (!token) {
          set({ isLoading: false })
          return
        }

        try {
          const user = await authApi.getCurrentUser()
          set({ user, token, isAuthenticated: true, isLoading: false })
        } catch (error) {
          // Token invalid, clear it
          Cookie.remove('token')
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
        }
      },
    }))