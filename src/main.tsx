import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'
import { App } from './App'
import { AuthProvider } from './app/contexts/AuthContext'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            className: '!rounded-lg !text-sm !font-medium',
            success: { iconTheme: { primary: 'var(--color-primary-500)', secondary: 'white' } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
