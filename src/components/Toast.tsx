// components/Toast.tsx

'use client'

import { toast, Toaster } from 'react-hot-toast'

export const ToastProvider = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3000,
      style: {
        background: '#333',
        color: '#fff',
        borderRadius: '0.5rem',
        padding: '1rem',
      },
      success: {
        iconTheme: {
          primary: '#10b981',
          secondary: '#fff',
        },
      },
      error: {
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      },
    }}
  />
)

// Toast 유틸리티 함수
export const showToast = {
  success: (message: string) => {
    return toast.success(message, {
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
    })
  },

  error: (
    message: string,
    options?: {
      action?: {
        label: string
        onClick: () => void
      }
    }
  ) => {
    if (options?.action) {
      return toast.error(
        (t) => (
          <div className="flex flex-col gap-2">
            <p>{message}</p>
            <button
              onClick={() => {
                options.action?.onClick()
                toast.dismiss(t.id)
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              aria-label={options.action?.label}
            >
              {options.action?.label}
            </button>
          </div>
        ),
        {
          duration: 5000,
          ariaProps: {
            role: 'alert',
            'aria-live': 'assertive',
          },
        }
      )
    }

    return toast.error(message, {
      ariaProps: {
        role: 'alert',
        'aria-live': 'assertive',
      },
    })
  },

  warning: (message: string) => {
    return toast(message, {
      icon: '⚠️',
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
    })
  },

  info: (message: string) => {
    return toast(message, {
      icon: 'ℹ️',
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        ariaProps: {
          role: 'status',
          'aria-live': 'polite',
        },
      }
    )
  },
}
