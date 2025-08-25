'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Clock, Target, Home, User, Medal, Crown, Award, CheckCircle, XCircle, ChevronDown, ChevronUp, Maximize, Minimize } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { supabase, LeaderboardEntry, DifficultyLevel } from '@/lib/supabase'

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>('Test')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null)
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [showAnswerDetails, setShowAnswerDetails] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const router = useRouter()

  const levels: DifficultyLevel[] = ['Test', 'Mudah', 'Sedang', 'Sulit']

  useEffect(() => {
    fetchLeaderboard()
  }, [selectedLevel])

  const fetchLeaderboard = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*, answers_detail')
        .eq('level', selectedLevel)
        .order('score', { ascending: false })
        .order('time_taken_seconds', { ascending: true })
        .limit(50)
      
      if (error) {
        console.error('Error fetching leaderboard:', error)
        setLeaderboardData([])
      } else {
        setLeaderboardData(data || [])
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      setLeaderboardData([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={24} />
      case 2:
        return <Medal className="text-gray-400" size={24} />
      case 3:
        return <Award className="text-amber-600" size={24} />
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
            {rank}
          </div>
        )
    }
  }

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200'
      default:
        return 'bg-white/80 border-white/20'
    }
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

  const handlePlayerClick = (player: LeaderboardEntry) => {
    setSelectedPlayer(player)
    setShowPlayerModal(true)
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-white" size={40} />
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Leaderboard
          </h1>
          
          <p className="text-xl text-gray-600">
            Papan peringkat pemain terbaik
          </p>
        </motion.div>

        {/* Level Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <div className="flex space-x-2">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedLevel === level
                      ? `bg-gradient-to-r ${getLevelColor(level)} text-white shadow-lg`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center space-x-2"
          >
            <Home size={20} />
            <span>Kembali ke Beranda</span>
          </Button>
        </div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat leaderboard...</p>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Belum ada data untuk level {selectedLevel}
              </h3>
              <p className="text-gray-500">
                Jadilah yang pertama bermain di level ini!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboardData.map((entry, index) => {
                const rank = index + 1
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    className={`${getRankBgColor(rank)} backdrop-blur-sm rounded-2xl p-4 shadow-lg border cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
                    onClick={() => handlePlayerClick(entry)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12">
                          {getRankIcon(rank)}
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {entry.player_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(entry.submitted_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="flex items-center space-x-1 text-blue-600">
                            <Target size={16} />
                            <span className="font-bold text-lg">{entry.score}</span>
                          </div>
                          <p className="text-xs text-gray-500">Skor</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center space-x-1 text-green-600">
                            <Clock size={16} />
                            <span className="font-bold text-lg">{formatTime(entry.time_taken_seconds)}</span>
                          </div>
                          <p className="text-xs text-gray-500">Waktu</p>
                        </div>
                        
                        <div className="text-center">
                          <User className="text-gray-400 mx-auto" size={20} />
                          <p className="text-xs text-gray-500 mt-1">Detail</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Player Detail Modal */}
      <Modal
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        title={`Detail Pemain: ${selectedPlayer?.player_name}`}
        size="lg"
      >
        {selectedPlayer && (
          <div className="space-y-6">
            {/* Player Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Skor</p>
                <p className="text-2xl font-bold text-blue-600">{selectedPlayer.score}</p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Waktu</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatTime(selectedPlayer.time_taken_seconds)}
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Level</p>
                <p className="text-2xl font-bold text-purple-600">{selectedPlayer.level}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Informasi Tambahan</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Tanggal:</span> {formatDate(selectedPlayer.submitted_at)}</p>
                <p><span className="font-medium">ID:</span> #{selectedPlayer.id}</p>
              </div>
            </div>

            {/* Answer Details Section */}
            {selectedPlayer.answers_detail && selectedPlayer.answers_detail.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAnswerDetails(!showAnswerDetails)}
                    className="flex-1 flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-800">Detail Jawaban</span>
                    </div>
                    {showAnswerDetails ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  
                  {showAnswerDetails && (
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-300 text-gray-600 hover:text-gray-800"
                      title="Buka fullscreen"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {showAnswerDetails && !isFullscreen && (
                  <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                    {selectedPlayer.answers_detail.map((answer, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border transition-all duration-300 ${
                          answer.isCorrect
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {answer.isCorrect ? (
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <span className="text-xs font-medium text-gray-600">
                              Soal {index + 1}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{answer.timeSpent}s</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-800 mb-2 text-xs leading-relaxed">
                          {answer.questionText}
                        </p>
                        
                        <div className="text-xs">
                          <p className="text-gray-600 font-medium mb-2">Jawaban:</p>
                          
                          {/* Answer Options Table */}
                          <div className="space-y-1">
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
                                label = ' (Benar)'
                              } else if (isSelected && !isCorrect) {
                                bgColor = 'bg-red-100'
                                textColor = 'text-red-800'
                                borderColor = 'border-red-300'
                                label = ' (Salah)'
                              }
                              
                              return (
                                <div
                                  key={option.key}
                                  className={`p-2 rounded border ${bgColor} ${borderColor} transition-all duration-200`}
                                >
                                  <span className={`font-semibold ${textColor} text-xs`}>
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
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Fullscreen Modal Popup */}
      {isFullscreen && selectedPlayer && selectedPlayer.answers_detail && (
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
                  <p className="text-sm text-gray-600">{selectedPlayer.player_name} - Level {selectedPlayer.level}</p>
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
                {selectedPlayer.answers_detail.map((answer, index) => (
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
                            label = ' ✗ Jawaban Player'
                          }
                          
                          if (isSelected && isCorrect) {
                            label = ' ✓ Jawaban Player (Benar)'
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