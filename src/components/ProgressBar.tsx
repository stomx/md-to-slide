// components/ProgressBar.tsx

interface ProgressBarProps {
  progress: number  // 0-100
  message?: string
  showPercentage?: boolean
}

export const ProgressBar = ({
  progress,
  message,
  showPercentage = true
}: ProgressBarProps) => {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className="w-full">
      {message && (
        <p
          className="text-sm text-gray-600 mb-2"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}
      <div
        className="w-full bg-gray-200 rounded-full h-2.5"
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={message || 'Progress'}
      >
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
      {showPercentage && (
        <p className="text-sm text-gray-600 mt-1 text-right">
          {Math.round(clampedProgress)}%
        </p>
      )}
    </div>
  )
}
