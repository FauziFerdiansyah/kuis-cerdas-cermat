'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number // 0-100
  className?: string
  showPercentage?: boolean
  animated?: boolean
}

export default function ProgressBar({
  progress,
  className = '',
  showPercentage = true,
  animated = true
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  
  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-blue-600">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm"
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{
            duration: animated ? 0.8 : 0,
            ease: 'easeOut'
          }}
        >
          {/* Shimmer effect */}
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </motion.div>
      </div>
      

    </div>
  )
}