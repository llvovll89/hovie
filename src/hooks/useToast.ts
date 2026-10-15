import { useContext } from 'react'
import { ToastContext } from '../contexts/toast-context'
export function useToast() { return useContext(ToastContext) }
