'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface LayoutProps {
  children: ReactNode
  className?: string
}

export default function Layout({ children, className = '' }: LayoutProps) {
  const [particles, setParticles] = useState<Array<{left: number, top: number, duration: number, delay: number}>>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Generate particle positions only on client side
    const particleData = [...Array(6)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 4 + Math.random() * 2,
      delay: Math.random() * 2,
    }))
    setParticles(particleData)
    setIsMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden transition-colors duration-300">
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl" />
      </div>
      
      {/* Main content */}
      <motion.div 
        className={`relative z-10 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
      
      {/* Floating particles effect - only render after mount */}
      {isMounted && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: particle.delay,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}