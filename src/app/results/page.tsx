'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Clock, Target, Home, RotateCcw, Share2, CheckCircle, XCircle, ChevronDown, ChevronUp, Maximize, Minimize } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import Button from '@/components/ui/Button'
import { DifficultyLevel, PlayerAnswer, supabase } from '@/lib/supabase'

interface QuizResults {
  playerName: string
  level: string
  score: number
  totalQuestions: number
  timeElapsed: number
  answers: (PlayerAnswer & { 
    selectedAnswerText?: string; 
    correctAnswerText?: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
  })[]
}

export default function ResultsPage() {
  const [results, setResults] = useState<QuizResults | null>(null)
  const [showAnswerDetails, setShowAnswerDetails] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const router = useRouter()

  // Fungsi untuk menyimpan ke database Supabase (fallback jika belum tersimpan)
  const saveToLeaderboard = async (quizResults: QuizResults) => {
    setIsSaving(true)
    setSaveError(null)
    
    try {
      // Konversi answers ke format DetailedPlayerAnswer
      const detailedAnswers = quizResults.answers.map(answer => ({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        selectedAnswerText: answer.selectedAnswerText || '',
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent,
        questionText: answer.questionText || '',
        correctAnswer: answer.correctAnswer || 'A',
        correctAnswerText: answer.correctAnswerText || '',
        optionA: answer.optionA || '',
        optionB: answer.optionB || '',
        optionC: answer.optionC || '',
        optionD: answer.optionD || ''
      }))

      // Insert ke tabel leaderboard
      const { data, error } = await supabase
        .from('leaderboard')
        .insert({
          player_name: quizResults.playerName,
          level: quizResults.level as DifficultyLevel,
          score: quizResults.score,
          time_taken_seconds: quizResults.timeElapsed,
          answers_detail: detailedAnswers
        })
        .select()

      if (error) {
        console.error('Error saving to leaderboard:', error)
        setSaveError('Gagal menyimpan ke leaderboard. Silakan coba lagi.')
        throw error
      }

      console.log('Successfully saved to leaderboard:', data)
      
      // Simpan flag bahwa data sudah disimpan
      localStorage.setItem('resultsSaved', 'true')
      
    } catch (error) {
      console.error('Failed to save to leaderboard:', error)
      setSaveError('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const savedResults = localStorage.getItem('quizResults')
    const alreadySaved = localStorage.getItem('resultsSaved') === 'true'
    
    if (!savedResults) {
      router.push('/')
      return
    }
    
    try {
      const parsedResults = JSON.parse(savedResults)
      setResults(parsedResults)
      
      // Hanya simpan ke database jika belum disimpan dari quiz page
      // Ini adalah fallback untuk kasus dimana save dari quiz page gagal
      if (!alreadySaved) {
        console.log('Data belum tersimpan, mencoba menyimpan ke leaderboard...')
        saveToLeaderboard(parsedResults)
      } else {
        console.log('Data sudah tersimpan sebelumnya dari quiz page')
      }
    } catch (error) {
      console.error('Error parsing results:', error)
      router.push('/')
    }
  }, [router])

  if (!results) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat hasil...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 90) return 'Luar biasa! 🎉'
    if (percentage >= 80) return 'Sangat baik! 👏'
    if (percentage >= 70) return 'Baik! 👍'
    if (percentage >= 60) return 'Cukup baik 😊'
    return 'Tetap semangat! 💪'
  }

  const handlePlayAgain = () => {
    // Clear previous results dan flag saved
    localStorage.removeItem('quizResults')
    localStorage.removeItem('resultsSaved')
    router.push('/')
  }

  const handleShare = async () => {
    const shareText = `Saya baru saja menyelesaikan Quiz Cerdas Cermat level ${results.level} dengan skor ${results.score}/${results.totalQuestions} dalam waktu ${formatTime(results.timeElapsed)}! 🎯`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Quiz Cerdas Cermat - Hasil Saya',
          text: shareText,
          url: window.location.origin
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText)
        alert('Hasil berhasil disalin ke clipboard!')
      } catch (error) {
        console.log('Error copying to clipboard:', error)
      }
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-white" size={40} />
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Hasil Quiz
            </h1>
            
            <p className="text-xl text-gray-600">
              {getScoreMessage(results.score, results.totalQuestions)}
            </p>
          </motion.div>

          {/* Status Saving */}
          {isSaving && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center"
            >
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-700">Menyimpan hasil ke leaderboard...</span>
              </div>
            </motion.div>
          )}

          {/* Error Saving */}
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            >
              <div className="text-center">
                <p className="text-red-700 mb-3">{saveError}</p>
                <Button
                  onClick={() => saveToLeaderboard(results)}
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-100"
                  disabled={isSaving}
                >
                  Coba Lagi
                </Button>
              </div>
            </motion.div>
          )}

          {/* Results Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-6"
          >
            {/* Player Info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{results.playerName}</h2>
              <p className="text-gray-600">Level: <span className="font-semibold text-blue-600">{results.level}</span></p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="bg-blue-50 rounded-xl p-4">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Skor</p>
                  <p className={`text-3xl font-bold ${getScoreColor(results.score, results.totalQuestions)}`}>
                    {results.score}/{results.totalQuestions}
                  </p>
                  <p className="text-sm text-gray-500">
                    {Math.round((results.score / results.totalQuestions) * 100)}%
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-green-50 rounded-xl p-4">
                  <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Waktu</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatTime(results.timeElapsed)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {Math.round(results.timeElapsed / results.totalQuestions)}s/soal
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-50 rounded-xl p-4">
                  <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Akurasi</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {Math.round((results.score / results.totalQuestions) * 100)}%
                  </p>
                  <p className="text-sm text-gray-500">
                    {results.score} benar
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Badge */}
            <div className="text-center mb-6">
              {(() => {
                const percentage = (results.score / results.totalQuestions) * 100
                if (percentage >= 90) {
                  return (
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full font-semibold">
                      🏆 Master
                    </div>
                  )
                } else if (percentage >= 80) {
                  return (
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full font-semibold">
                      ⭐ Excellent
                    </div>
                  )
                } else if (percentage >= 70) {
                  return (
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full font-semibold">
                      👍 Good
                    </div>
                  )
                } else if (percentage >= 60) {
                  return (
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-semibold">
                      😊 Fair
                    </div>
                  )
                } else {
                  return (
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-full font-semibold">
                      💪 Keep Trying
                    </div>
                  )
                }
              })()}
            </div>
          </motion.div>

          {/* Answer Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6"
          >
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <button
                onClick={() => setShowAnswerDetails(!showAnswerDetails)}
                className="flex items-center space-x-3 hover:bg-blue-100/50 rounded-lg p-2 transition-all duration-300 flex-1"
              >
                <Target className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-800">Detail Jawaban</span>
                {showAnswerDetails ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 ml-auto" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 ml-auto" />
                )}
              </button>
              
              {showAnswerDetails && (
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="ml-3 p-2 hover:bg-blue-100 rounded-lg transition-all duration-300 text-blue-600"
                  title={isFullscreen ? 'Keluar dari fullscreen' : 'Mode fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            {showAnswerDetails && !isFullscreen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 max-h-96 space-y-3 overflow-y-auto"
              >
                <div className="space-y-3">
                  {results.answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        answer.isCorrect
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {answer.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm font-medium text-gray-600">
                          Soal {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{answer.timeSpent}s</span>
                      </div>
                    </div>
                    
                    {answer.questionText && (
                      <p className="text-gray-800 mb-3 text-sm leading-relaxed">
                        {answer.questionText}
                      </p>
                    )}
                    
                    <div className="text-sm">
                      <p className="text-gray-600 font-medium mb-3">Jawaban Anda:</p>
                      
                      {/* Answer Options Table */}
                      <div className="space-y-2">
                        {[
                          { key: 'A', text: answer.optionA },
                          { key: 'B', text: answer.optionB },
                          { key: 'C', text: answer.optionC },
                          { key: 'D', text: answer.optionD }
                        ].filter(option => option.text && option.text.trim() !== '').map((option) => {
                          const isSelected = answer.selectedAnswer === option.key
                          const isCorrect = answer.correctAnswer === option.key
                          
                          let bgColor = 'bg-gray-50'
                          let textColor = 'text-gray-700'
                          let borderColor = 'border-gray-200'
                          let label = ''
                          
                          if (isCorrect) {
                            bgColor = 'bg-green-100'
                            textColor = 'text-green-800'
                            borderColor = 'border-green-300'
                            label = ' (Jawaban Benar)'
                          } else if (isSelected && !isCorrect) {
                            bgColor = 'bg-red-100'
                            textColor = 'text-red-800'
                            borderColor = 'border-red-300'
                            label = ' (Jawaban Salah)'
                          }
                          
                          return (
                            <div
                              key={option.key}
                              className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor} transition-all duration-200`}
                            >
                              <span className={`font-semibold ${textColor}`}>
                                {option.key}. {option.text}{label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
          >
            <Button
              onClick={() => router.push('/leaderboard')}
              variant="primary"
              className="flex items-center justify-center space-x-2"
            >
              <Trophy size={20} />
              <span>Lihat Leaderboard</span>
            </Button>
            
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <Share2 size={20} />
              <span>Bagikan Hasil</span>
            </Button>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Button
              onClick={handlePlayAgain}
              variant="secondary"
              className="flex items-center justify-center space-x-2"
            >
              <RotateCcw size={20} />
              <span>Main Lagi</span>
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              className="flex items-center justify-center space-x-2"
            >
              <Home size={20} />
              <span>Kembali ke Beranda</span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Fullscreen Modal Popup */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl w-full h-full max-w-7xl max-h-[90vh] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <Target className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Detail Jawaban</h2>
                  <p className="text-sm text-gray-600">{results.playerName} - Level {results.level}</p>
                </div>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-3 hover:bg-white/50 rounded-xl transition-all duration-300 text-gray-600 hover:text-gray-800"
                title="Tutup fullscreen"
              >
                <Minimize className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {results.answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      answer.isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {answer.isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-lg font-semibold text-gray-800">
                          Soal {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{answer.timeSpent}s</span>
                      </div>
                    </div>
                    
                    {answer.questionText && (
                      <p className="text-gray-800 mb-4 text-base leading-relaxed">
                        {answer.questionText}
                      </p>
                    )}
                    
                    <div className="space-y-3">
                      <p className="text-gray-700 font-semibold mb-3">Pilihan Jawaban:</p>
                      
                      {/* Answer Options */}
                      <div className="space-y-2">
                        {[
                          { key: 'A', text: answer.optionA },
                          { key: 'B', text: answer.optionB },
                          { key: 'C', text: answer.optionC },
                          { key: 'D', text: answer.optionD }
                        ].filter(option => option.text && option.text.trim() !== '').map((option) => {
                          const isSelected = answer.selectedAnswer === option.key
                          const isCorrect = answer.correctAnswer === option.key
                          
                          let bgColor = 'bg-gray-50'
                          let textColor = 'text-gray-700'
                          let borderColor = 'border-gray-200'
                          let label = ''
                          
                          if (isCorrect) {
                            bgColor = 'bg-green-100'
                            textColor = 'text-green-800'
                            borderColor = 'border-green-300'
                            label = ' ✓ Jawaban Benar'
                          }
                          
                          if (isSelected && !isCorrect) {
                            bgColor = 'bg-red-100'
                            textColor = 'text-red-800'
                            borderColor = 'border-red-300'
                            label = ' ✗ Jawaban Anda'
                          }
                          
                          if (isSelected && isCorrect) {
                            label = ' ✓ Jawaban Anda (Benar)'
                          }
                          
                          return (
                            <div
                              key={option.key}
                              className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor} transition-all duration-200`}
                            >
                              <div className="flex items-start space-x-3">
                                <span className={`font-bold ${textColor} flex-shrink-0`}>
                                  {option.key}.
                                </span>
                                <div className="flex-1">
                                  <span className={textColor}>{option.text}</span>
                                  {label && (
                                    <span className={`ml-2 text-sm font-semibold ${textColor}`}>
                                      {label}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  )
}