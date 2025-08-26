'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle, XCircle, Home, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Layout from '@/components/Layout'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { supabase, Question, DifficultyLevel, CorrectOption, PlayerAnswer, DetailedPlayerAnswer } from '@/lib/supabase'

function QuizContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [playerAnswers, setPlayerAnswers] = useState<PlayerAnswer[]>([])
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [questionTimeSpent, setQuestionTimeSpent] = useState<{[key: string]: number}>({})
  const [previouslyAnsweredQuestions, setPreviouslyAnsweredQuestions] = useState<Set<string>>(new Set())
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>('Mudah')
  const [playerName, setPlayerName] = useState('')
  const [instantCorrection, setInstantCorrection] = useState(false)
  const [showInstantCorrectionAlert, setShowInstantCorrectionAlert] = useState(false)
  const [showFinalModal, setShowFinalModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)

  // Load data dari URL parameter dan localStorage
  useEffect(() => {
    // Ambil level dari URL parameter
    const levelFromUrl = searchParams.get('level') as DifficultyLevel
    const storedPlayerName = localStorage.getItem('playerName')
    const storedInstantCorrection = localStorage.getItem('instantCorrection') === 'true'
    const storedShowAlert = localStorage.getItem('showInstantCorrectionAlert') !== 'false'

    // Validasi level dari URL
    const validLevels: DifficultyLevel[] = ['Test', 'Mudah', 'Sedang', 'Sulit']
    if (!levelFromUrl || !validLevels.includes(levelFromUrl) || !storedPlayerName) {
      router.push('/')
      return
    }

    // Set semua state sekaligus
    setSelectedLevel(levelFromUrl)
    setPlayerName(storedPlayerName)
    setInstantCorrection(storedInstantCorrection)
    setShowInstantCorrectionAlert(storedShowAlert && storedInstantCorrection)
    setStartTime(new Date())
    setQuestionStartTime(new Date())
    
    // Reset state quiz
    setQuestions([])
    setPlayerAnswers([])
    setCurrentQuestionIndex(0)
    setPreviouslyAnsweredQuestions(new Set())
    setQuestionTimeSpent({})
    setTimeElapsed(0)
    setIsLoading(true)
    
    // Reset localStorage flags untuk memastikan data dapat disimpan
    localStorage.removeItem('resultsSaved')
    localStorage.removeItem('quizResults')
    
    // Load questions hanya sekali saat component mount
    loadQuestions(levelFromUrl)
  }, [searchParams, router])

  // Tidak perlu useEffect untuk level berubah karena sekarang menggunakan URL parameter

  // Timer effect
  useEffect(() => {
    if (!startTime || !isTimerActive) return

    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((new Date().getTime() - startTime.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime, isTimerActive])

  // Cleanup effect saat component unmount atau user meninggalkan halaman
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Reset semua state quiz
      setQuestions([])
      setPlayerAnswers([])
      setCurrentQuestionIndex(0)
      setPreviouslyAnsweredQuestions(new Set())
      setQuestionTimeSpent({})
      setTimeElapsed(0)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause timer saat tab tidak aktif
        setIsTimerActive(false)
      } else {
        // Resume timer saat tab aktif kembali
        setIsTimerActive(true)
      }
    }

    // Event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup saat component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      // Reset state saat component unmount
      setQuestions([])
      setPlayerAnswers([])
      setCurrentQuestionIndex(0)
      setPreviouslyAnsweredQuestions(new Set())
      setQuestionTimeSpent({})
    }
  }, [])

  const loadQuestions = async (level?: DifficultyLevel) => {
    try {
      setIsLoading(true)
      
      // Gunakan parameter level atau fallback ke selectedLevel
      const targetLevel = level || selectedLevel
      
      if (!targetLevel) {
        console.warn('Tidak ada level yang ditentukan')
        return
      }
      
      // Reset state sekali lagi sebelum load untuk memastikan bersih
      setQuestions([])
      setPlayerAnswers([])
      setCurrentQuestionIndex(0)
      
      // Tentukan jumlah soal berdasarkan level
      const getQuestionLimit = (levelParam: DifficultyLevel): number => {
        switch (levelParam) {
          case 'Test': return 10
          case 'Mudah': return 30
          case 'Sedang': return 25
          case 'Sulit': return 20
          default: return 20
        }
      }
      
      const questionLimit = getQuestionLimit(targetLevel)
      
      // Query soal berdasarkan level dengan limit untuk membatasi hasil
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('level', targetLevel)
        .order('id')
        .limit(questionLimit)

      if (error) throw error

      // Filter dan validasi data untuk memastikan level sesuai dan tidak ada data tercampur
      const validQuestions = (data || [])
        .filter(question => {
          // Validasi ketat: pastikan level benar-benar sesuai
          return question.level === targetLevel && 
                 question.level !== null && 
                 question.level !== undefined
        })
        .slice(0, questionLimit)
      
      // Validasi final: pastikan jumlah soal sesuai ekspektasi
      if (validQuestions.length === 0) {
        console.warn(`Tidak ada soal ditemukan untuk level: ${targetLevel}`)
        return
      }
      
      // Set questions dengan data yang sudah divalidasi dan dibatasi
      setQuestions(validQuestions)
    } catch (error) {
      console.error('Error loading questions:', error)
      // Reset state jika terjadi error
      setQuestions([])
      setPlayerAnswers([])
      setCurrentQuestionIndex(0)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentQuestionIndex]
  const selectedAnswer = playerAnswers.find(answer => answer.questionId === currentQuestion?.id)
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      // Save time spent on current question
      if (questionStartTime && currentQuestion) {
        const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000)
        setQuestionTimeSpent(prev => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + timeSpent
        }))
      }

      setCurrentQuestionIndex(index)
      setQuestionStartTime(new Date())
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1)
    }
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1)
    }
  }

  const shouldShowFinishButton = () => {
    // Tampilkan tombol selesai jika semua pertanyaan sudah dijawab
    const allQuestionsAnswered = playerAnswers.length === questions.length
    return allQuestionsAnswered
  }

  const proceedToNext = () => {
    if (shouldShowFinishButton()) {
      setShowFinalModal(true)
    } else {
      goToNextQuestion()
    }
  }

  const handleAnswerSelect = (selectedOption: CorrectOption) => {
    if (!currentQuestion) return

    // Jika instant correction aktif dan sudah ada jawaban, tidak bisa mengubah
    if (instantCorrection && selectedAnswer) {
      return
    }

    // Hitung waktu yang dihabiskan untuk pertanyaan ini
    const timeSpent = questionStartTime 
      ? Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000)
      : 0

    // Cek apakah jawaban benar
    const isCorrect = currentQuestion.correct_answer === selectedOption

    // Update player answers
    const newAnswer: PlayerAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedOption,
      isCorrect,
      timeSpent,
      questionText: currentQuestion.question_text,
      correctAnswer: currentQuestion.correct_answer
    }

    setPlayerAnswers(prev => {
      const filtered = prev.filter(answer => answer.questionId !== currentQuestion.id)
      return [...filtered, newAnswer]
    })

    // Update question time spent
    setQuestionTimeSpent(prev => ({
      ...prev,
      [currentQuestion.id]: timeSpent
    }))

    // Mark this question as previously answered
    setPreviouslyAnsweredQuestions(prev => new Set([...prev, currentQuestion.id.toString()]))

    // Auto-next logic: hanya jika instant correction tidak aktif ATAU pertanyaan belum pernah dijawab sebelumnya
    if (!instantCorrection || !previouslyAnsweredQuestions.has(currentQuestion.id.toString())) {
      // Cek apakah masih ada pertanyaan yang belum dijawab
      const totalAnswered = playerAnswers.length + 1 // +1 untuk jawaban yang baru saja dipilih
      const hasUnansweredQuestions = totalAnswered < questions.length
      
      if (hasUnansweredQuestions) {
        setTimeout(() => {
          proceedToNext()
        }, instantCorrection ? 1500 : 500)
      }
    }

    // Reset question start time
    setQuestionStartTime(new Date())
  }

  const dismissInstantCorrectionAlert = () => {
    setShowInstantCorrectionAlert(false)
    localStorage.setItem('showInstantCorrectionAlert', 'false')
  }

  const handleFinalConfirmation = async () => {
    try {
      // Show loading spinner
      setIsNavigating(true)
      
      // Stop timer
      setIsTimerActive(false)
      const finalTime = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000) : 0
      
      // Save final time for current question
      if (questionStartTime && currentQuestion) {
        const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000)
        setQuestionTimeSpent(prev => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + timeSpent
        }))
      }

      // Prepare detailed answers for saving
      const detailedAnswers: DetailedPlayerAnswer[] = questions.map(question => {
        const playerAnswer = playerAnswers.find(answer => answer.questionId === question.id)
        
        return {
          questionId: question.id,
          questionText: question.question_text,
          selectedAnswer: playerAnswer?.selectedAnswer || 'A',
          selectedAnswerText: playerAnswer ? 
            question[`option_${playerAnswer.selectedAnswer.toLowerCase()}` as keyof Question] as string || ''
            : '',
          correctAnswer: question.correct_answer,
          correctAnswerText: question[`option_${question.correct_answer.toLowerCase()}` as keyof Question] as string || '',
          isCorrect: playerAnswer?.isCorrect || false,
          timeSpent: questionTimeSpent[question.id] || 0,
          optionA: question.option_a,
          optionB: question.option_b,
          optionC: question.option_c,
          optionD: question.option_d
        }
      })

      // Calculate score
      const correctAnswers = detailedAnswers.filter(answer => answer.isCorrect).length
      
      // Prepare quiz results
      const quizResults = {
        playerName,
        level: selectedLevel,
        score: correctAnswers,
        totalQuestions: questions.length,
        timeElapsed: finalTime,
        answers: detailedAnswers,
        instantCorrection,
        completedAt: new Date().toISOString()
      }

      // Save to localStorage
      localStorage.setItem('quizResults', JSON.stringify(quizResults))

      // Save to leaderboard database
      const { data, error } = await supabase
        .from('leaderboard')
        .insert({
          player_name: playerName,
          level: selectedLevel as DifficultyLevel,
          score: correctAnswers,
          time_taken_seconds: finalTime,
          answers_detail: detailedAnswers
        })
        .select()

      if (error) {
        console.error('Error saving to leaderboard:', error)
        // Tetap lanjut ke results meskipun save gagal
        // User bisa melihat hasil dan data tersimpan di localStorage
      } else {
        console.log('Successfully saved to leaderboard:', data)
        // Tandai bahwa data sudah berhasil disimpan
        localStorage.setItem('resultsSaved', 'true')
      }

      // Navigate to results setelah save selesai (berhasil atau gagal)
      router.push('/results')
    } catch (error) {
      console.error('Error in final confirmation:', error)
      // Tetap redirect ke results meskipun ada error
      router.push('/results')
    }
  }

  const getOptionButtonClass = (optionKey: CorrectOption) => {
    if (!selectedAnswer) return 'border-gray-300 bg-white text-gray-800'
    
    if (selectedAnswer.selectedAnswer === optionKey) {
      if (instantCorrection) {
        return selectedAnswer.isCorrect
          ? 'border-green-500 bg-green-50 text-green-800'
          : 'border-red-500 bg-red-50 text-red-800'
      }
      return 'border-blue-500 bg-blue-50 text-blue-800'
    }
    
    if (instantCorrection && !selectedAnswer.isCorrect && currentQuestion.correct_answer === optionKey) {
      return 'border-green-500 bg-green-50 text-green-800'
    }
    
    return 'border-gray-300 bg-white text-gray-800'
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat pertanyaan...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (questions.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Tidak ada pertanyaan tersedia untuk level {selectedLevel}</p>
            <Button onClick={() => router.push('/')}>Kembali ke Beranda</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Progress Bar di paling atas */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-200 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 pt-6">
        {/* Header */}
        <div className="mb-6 bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="!p-2"
                aria-label="Kembali ke halaman utama"
              >
                <Home size={20} />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-heading font-bold text-gray-800">{selectedLevel}</h1>
                <p className="text-sm font-body text-gray-600">{playerName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock size={16} />
                <span className="font-mono text-sm">{formatTime(timeElapsed)}</span>
              </div>
              <div className="text-sm text-gray-600">
                {currentQuestionIndex + 1}/{questions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Layout Sidebar + Main Content */}
        <div className="flex gap-4">
          {/* Sidebar Kiri - Navigasi Pertanyaan (10%) */}
          <div className={`${questions.length <= 10 ? 'w-[5%]' : 'w-[8%]'} min-w-[80px]`}>
            <div className="sticky top-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/30">
                <h3 className="text-xs font-heading font-semibold text-gray-700 mb-3 text-center">Soal</h3>
                <div className={`grid gap-2 place-items-center justify-center ${
                  questions.length <= 20
                    ? 'grid-cols-1'
                    : 'grid-cols-2'
                } auto-rows-max`}>
                  {questions.map((_, index) => {
                    const questionAnswer = playerAnswers.find(answer => answer.questionId === questions[index].id)
                    const isAnswered = !!questionAnswer
                    const isCurrent = index === currentQuestionIndex
                    const isCorrect = questionAnswer?.isCorrect
                    
                    let buttonClass = 'w-8 h-8 rounded-lg font-semibold text-xs transition-all duration-150 '
                    
                    if (isCurrent) {
                      buttonClass += 'bg-blue-600 text-white shadow-lg'
                    } else if (isAnswered) {
                      if (instantCorrection) {
                        if (isCorrect) {
                          buttonClass += 'bg-green-500 text-white border border-green-600 hover:bg-green-600'
                        } else {
                          buttonClass += 'bg-red-500 text-white border border-red-600 hover:bg-red-600'
                        }
                      } else {
                        buttonClass += 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                      }
                    } else {
                      buttonClass += 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                    }
                    
                    return (
                      <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={buttonClass}
                        title={`Soal ${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Form Pertanyaan (90%) */}
          <div className={`${questions.length <= 10 ? 'w-[95%]' : 'w-[92%]'}`}>
            {/* Instant Correction Alert */}
            {showInstantCorrectionAlert && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-bold">!</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-blue-800 mb-1">
                        Mode Langsung Koreksi Aktif
                      </h3>
                      <p className="text-sm text-blue-700">
                        Jawaban yang dipilih akan langsung menampilkan indikator benar/salah dan tidak dapat diubah lagi.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={dismissInstantCorrectionAlert}
                    className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Back/Next Navigation */}
            <div className="flex justify-between items-center mb-6">
              <Button
                variant="ghost"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center space-x-2 min-w-[100px] px-4 py-2 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg font-heading font-medium"
              >
                <ChevronLeft size={16} />
                <span>Sebelumnya</span>
              </Button>
              
              <span className="text-sm text-gray-600 font-medium">
                Soal {currentQuestionIndex + 1} dari {questions.length}
              </span>
              
              {/* Tombol Navigasi */}
              <div className="flex items-center space-x-2">
                {/* Tombol Selesai - tampil jika semua pertanyaan sudah dijawab */}
                {shouldShowFinishButton() ? (
                  <Button
                    variant="primary"
                    onClick={() => setShowFinalModal(true)}
                    className="flex items-center space-x-2 min-w-[100px] px-4 py-2 transition-all duration-200 rounded-lg font-heading font-medium"
                  >
                    <span>Selesai</span>
                    <CheckCircle size={16} />
                  </Button>
                ) : (
                  /* Tombol Selanjutnya - hanya tampil jika instant correction tidak aktif dan belum semua pertanyaan dijawab */
                  !instantCorrection && currentQuestionIndex < questions.length - 1 && (
                    <Button
                      variant="ghost"
                      onClick={goToNextQuestion}
                      className="flex items-center space-x-2 min-w-[100px] px-4 py-2 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg font-heading font-medium"
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight size={16} />
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.15 }}
                className={`bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/40 ${
                  currentQuestionIndex === questions.length - 1 
                    ? 'border-l-4 border-l-yellow-400' 
                    : 'border-l-4 border-l-blue-400'
                }`}
              >
                {/* Subject Label */}
                <div className="mb-6">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-heading font-semibold px-3 py-2 rounded-full">
                    {currentQuestion.subject}
                  </span>
                </div>
                
                <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-semibold text-gray-800 mb-8 leading-relaxed">
                  {currentQuestion.question_text}
                </h2>

                {/* Options */}
                 <div className="space-y-4">
                   {[{key: 'A' as CorrectOption, text: currentQuestion.option_a}, 
                     {key: 'B' as CorrectOption, text: currentQuestion.option_b}, 
                     {key: 'C' as CorrectOption, text: currentQuestion.option_c}, 
                     {key: 'D' as CorrectOption, text: currentQuestion.option_d}].map((option) => {
                     const isAnswerDisabled = instantCorrection && !!selectedAnswer
                     
                     return (
                       <motion.button
                         key={option.key}
                         onClick={() => handleAnswerSelect(option.key)}
                         disabled={isAnswerDisabled}
                         className={`${getOptionButtonClass(option.key)} p-3 sm:p-4 mx-2 rounded-xl border-2 text-left transition-all duration-150 transform hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] font-body text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                         whileHover={{ scale: isAnswerDisabled ? 1 : 1.02 }}
                         whileTap={{ scale: isAnswerDisabled ? 1 : 0.98 }}
                         transition={{ type: "spring", stiffness: 300, damping: 20 }}
                         aria-label={`Pilihan ${option.key}: ${option.text}`}
                         role="button"
                         tabIndex={0}
                       >
                         <div className="flex items-center space-x-4">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                             selectedAnswer?.selectedAnswer === option.key
                               ? (instantCorrection && selectedAnswer.isCorrect
                                   ? 'bg-green-500 text-white'
                                   : instantCorrection && !selectedAnswer.isCorrect
                                   ? 'bg-red-500 text-white'
                                   : 'bg-blue-500 text-white')
                               : 'bg-gray-200 text-gray-600'
                           }`}>
                             {option.key}
                           </div>
                           <span className="flex-1">{option.text}</span>
                           {instantCorrection && selectedAnswer && (
                             <div className="flex-shrink-0">
                               {selectedAnswer.selectedAnswer === option.key ? (
                                 selectedAnswer.isCorrect ? (
                                   <CheckCircle className="text-green-500" size={20} />
                                 ) : (
                                   <XCircle className="text-red-500" size={20} />
                                 )
                               ) : (
                                 currentQuestion.correct_answer === option.key && !selectedAnswer.isCorrect && (
                                   <CheckCircle className="text-green-500" size={20} />
                                 )
                               )}
                             </div>
                           )}
                         </div>
                       </motion.button>
                     )
                   })}
                 </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Final Confirmation Modal */}
      <Modal isOpen={showFinalModal} onClose={() => !isNavigating ? setShowFinalModal(false) : undefined}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {isNavigating ? 'Menyimpan Hasil...' : 'Selesaikan Kuis?'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isNavigating ? (
              'Sedang menyimpan hasil kuis Anda ke leaderboard. Mohon tunggu sebentar...'
            ) : (
              'Apakah Anda yakin ingin menyelesaikan kuis ini? Anda tidak dapat mengubah jawaban setelah ini.'
            )}
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setShowFinalModal(false)}
              disabled={isNavigating}
              className={isNavigating ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Kembali
            </Button>
            <Button
              onClick={handleFinalConfirmation}
              className="px-6"
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Menyimpan...
                </>
              ) : (
                'Lihat Hasil'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat kuis...</p>
          </div>
        </div>
      </Layout>
    }>
      <QuizContent />
    </Suspense>
  )
}