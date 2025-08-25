'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Settings, Play, Brain, Target, Zap, Maximize, Minimize } from 'lucide-react'
import Layout from '@/components/Layout'
import Button from '@/components/ui/Button'
import { DifficultyLevel } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [instantCorrection, setInstantCorrection] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const router = useRouter()

  // Deteksi perubahan fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const levels: { name: DifficultyLevel; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; description: string }[] = [
    { 
      name: 'Test', 
      icon: Play, 
      color: 'from-green-500 to-green-600', 
      description: 'Mode latihan untuk memahami format soal' 
    },
    { 
      name: 'Mudah', 
      icon: Target, 
      color: 'from-blue-500 to-blue-600', 
      description: 'Soal dasar untuk pemula' 
    },
    { 
      name: 'Sedang', 
      icon: Brain, 
      color: 'from-yellow-500 to-orange-500', 
      description: 'Tantangan menengah yang menarik' 
    },
    { 
      name: 'Sulit', 
      icon: Zap, 
      color: 'from-red-500 to-red-600', 
      description: 'Ujian kemampuan maksimal' 
    }
  ]

  const handleLevelSelect = (level: DifficultyLevel) => {
    // Simpan pengaturan ke localStorage
    localStorage.setItem('instantCorrection', instantCorrection.toString())
    
    // Redirect ke halaman input nama dengan parameter level
    router.push(`/player-name?level=${level}`)
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Quiz Cerdas Cermat
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Uji kemampuan dan pengetahuanmu dengan berbagai tingkat kesulitan
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-8">
          {/* Toggle Langsung Koreksi */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Settings className="text-gray-600" size={20} />
            <span className="text-gray-700 font-medium">Langsung Koreksi</span>
            <button
              onClick={() => setInstantCorrection(!instantCorrection)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                instantCorrection ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  instantCorrection ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </motion.div>

          {/* Menu Leaderboard & Fullscreen */}
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="outline"
              onClick={() => router.push('/leaderboard')}
              className="flex items-center space-x-2"
            >
              <Trophy size={20} />
              <span>Leaderboard</span>
            </Button>
            
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen()
                  setIsFullscreen(true)
                } else {
                  document.exitFullscreen()
                  setIsFullscreen(false)
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 text-gray-600 border border-gray-300"
              title={isFullscreen ? 'Keluar dari fullscreen' : 'Mode fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </motion.div>
        </div>

        {/* Level Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {levels.map((level, index) => {
            const IconComponent = level.icon
            return (
              <motion.div
                key={level.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
                onClick={() => handleLevelSelect(level.name)}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 group-hover:border-blue-200">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${level.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="text-white" size={32} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {level.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {level.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      Klik untuk mulai
                    </span>
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${level.color} group-hover:animate-pulse`} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Footer Info */}
        <motion.div 
          className="text-center mt-12 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm">
            Pilih tingkat kesulitan yang sesuai dengan kemampuanmu
          </p>
        </motion.div>
      </div>
    </Layout>
  )
}
