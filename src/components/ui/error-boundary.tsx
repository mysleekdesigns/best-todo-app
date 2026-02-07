import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-red-50 p-4 dark:bg-red-950/30">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Something went wrong</h2>
          <p className="mb-4 max-w-md text-sm text-muted-foreground">
            An unexpected error occurred. Try refreshing the page or click the button below.
          </p>
          {this.state.error && (
            <pre className="mb-4 max-w-md overflow-auto rounded-lg bg-accent p-3 text-left text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            <RotateCcw size={14} />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
