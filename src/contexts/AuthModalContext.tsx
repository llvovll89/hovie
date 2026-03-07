import { createContext, useContext } from 'react'

interface AuthModalCtx {
  openSignIn: () => void
  openSignUp: () => void
}

export const AuthModalContext = createContext<AuthModalCtx>({
  openSignIn: () => {},
  openSignUp: () => {},
})

export function useAuthModal() {
  return useContext(AuthModalContext)
}
