import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'
import { App } from './App'
import { AuthProvider } from './app/contexts/AuthContext'
import { ThemeProvider } from './app/contexts/ThemeProvider'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              className: '!rounded-lg !text-sm !font-medium',
              style: {
                background: 'var(--surface)',
                color: 'var(--foreground)',
                border: '1px solid var(--line)',
              },
              success: { iconTheme: { primary: 'var(--color-primary-500)', secondary: 'white' } },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
