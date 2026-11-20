export default function SaveErrorNotice({ message, onDismiss, className = '' }: {
  message: string | null
  onDismiss?: () => void
  className?: string
}) {
  if (!message) return null
  return (
    <div role="alert"
      className={`no-print flex items-start gap-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 ${className}`}>
      <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss"
          className="flex-shrink-0 -mr-1 px-1 leading-none text-lg text-red-500 hover:text-red-800">
          ×
        </button>
      )}
    </div>
  )
}
