import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-5 py-6 space-y-3">
            <p className="text-red-800 dark:text-red-300 font-semibold">Ocurrió un error inesperado</p>
            <p className="text-sm text-red-600 dark:text-red-400 font-mono break-all">
              {this.state.error.message}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
