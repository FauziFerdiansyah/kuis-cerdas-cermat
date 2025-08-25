-- Migration untuk menambahkan kolom answers_detail ke tabel leaderboard
-- Jalankan SQL ini di Supabase SQL Editor

-- Tambahkan kolom untuk menyimpan detail jawaban dalam format JSON
ALTER TABLE leaderboard 
ADD COLUMN answers_detail JSONB;

-- Tambahkan komentar untuk dokumentasi
COMMENT ON COLUMN leaderboard.answers_detail IS 'Detail jawaban pemain dalam format JSON: [{"questionId": number, "selectedAnswer": string, "isCorrect": boolean, "timeSpent": number, "questionText": string, "correctAnswer": string}]';

-- Index untuk pencarian berdasarkan detail jawaban (opsional)
CREATE INDEX idx_leaderboard_answers_detail ON leaderboard USING GIN (answers_detail);

-- Contoh struktur data yang akan disimpan (SUDAH TERMASUK PILIHAN GANDA):
-- [
--   {
--     "questionId": 1,
--     "selectedAnswer": "A",
--     "selectedAnswerText": "Soekarno",
--     "isCorrect": true,
--     "timeSpent": 15,
--     "questionText": "Siapa presiden pertama Indonesia?",
--     "correctAnswer": "A",
--     "correctAnswerText": "Soekarno",
--     "optionA": "Soekarno",
--     "optionB": "Soeharto",
--     "optionC": "Habibie",
--     "optionD": "Megawati"
--   },
--   {
--     "questionId": 2,
--     "selectedAnswer": "B",
--     "selectedAnswerText": "1944",
--     "isCorrect": false,
--     "timeSpent": 20,
--     "questionText": "Kapan Indonesia merdeka?",
--     "correctAnswer": "C",
--     "correctAnswerText": "1945",
--     "optionA": "1943",
--     "optionB": "1944",
--     "optionC": "1945",
--     "optionD": "1946"
--   }
-- ]