'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { User, ArrowRight, ArrowLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Layout from '@/components/Layout'
import Button from '@/components/ui/Button'
import { DifficultyLevel } from '@/lib/supabase'

function PlayerNameContent() {
  const [playerName, setPlayerName] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | null>(null)
  const [instantCorrection, setInstantCorrection] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Ambil level dari URL parameter
    const levelFromUrl = searchParams.get('level') as DifficultyLevel
    const correction = localStorage.getItem('instantCorrection') === 'true'
    
    // Validasi level dari URL
    const validLevels: DifficultyLevel[] = ['Test', 'Mudah', 'Sedang', 'Sulit']
    if (!levelFromUrl || !validLevels.includes(levelFromUrl)) {
      // Jika tidak ada level yang valid, kembali ke halaman utama
      router.push('/')
      return
    }
    
    setSelectedLevel(levelFromUrl)
    setInstantCorrection(correction)
  }, [searchParams, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (playerName.trim().length < 2) {
      alert('Nama harus minimal 2 karakter')
      return
    }
    
    // Simpan nama pemain ke localStorage
    localStorage.setItem('playerName', playerName.trim())
    
    // Redirect ke halaman quiz dengan parameter level
    router.push(`/quiz?level=${selectedLevel}`)
  }

  const handleBack = () => {
    router.push('/')
  }

  if (!selectedLevel) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const getLevelColor = (level: DifficultyLevel) => {
    switch (level) {
      case 'Test': return 'from-green-500 to-green-600'
      case 'Mudah': return 'from-blue-500 to-blue-600'
      case 'Sedang': return 'from-yellow-500 to-orange-500'
      case 'Sulit': return 'from-red-500 to-red-600'
      default: return 'from-blue-500 to-blue-600'
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${getLevelColor(selectedLevel)} flex items-center justify-center mx-auto mb-4`}>
              <User className="text-white" size={40} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Masukkan Nama Anda
            </h1>
            
            <p className="text-gray-600">
              Level: <span className="font-semibold text-blue-600">{selectedLevel}</span>
            </p>
            
            {instantCorrection && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Mode koreksi langsung aktif
              </p>
            )}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Pemain
                </label>
                
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Masukkan nama Anda..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300/50 focus:border-blue-500 transition-all duration-300 bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                  maxLength={50}
                  required
                  autoFocus
                />
                
                <p className="text-xs text-gray-500 mt-2">
                  Minimal 2 karakter, maksimal 50 karakter
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft size={20} />
                  <span>Kembali</span>
                </Button>
                
                <Button
                  type="submit"
                  variant="primary"
                  disabled={playerName.trim().length < 2}
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  <span>Mulai Quiz</span>
                  <ArrowRight size={20} />
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div 
            className="text-center mt-8 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-sm">
              Nama akan ditampilkan di leaderboard
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}

export default function PlayerNamePage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat...</p>
          </div>
        </div>
      </Layout>
    }>
      <PlayerNameContent />
    </Suspense>
  )
}