import React, { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
    console.log('[ErrorBoundary] Mounted')
  }

  static getDerivedStateFromError(error: Error): State {
    console.log('[ErrorBoundary] Error caught:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[ErrorBoundary] Full error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
          <div className="rounded-3xl border border-red-700 bg-red-950/50 p-8 max-w-2xl">
            <h1 className="text-2xl font-bold text-red-300 mb-4">Ошибка приложения</h1>
            <p className="text-red-200 mb-4">Произошла ошибка при загрузке приложения.</p>
            <pre className="bg-slate-900 p-4 rounded text-xs text-red-200 overflow-auto max-h-96 mb-4">
              {this.state.error?.toString()}
            </pre>
            <p className="text-slate-300 text-sm">Проверьте консоль браузера для подробностей (F12).</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
