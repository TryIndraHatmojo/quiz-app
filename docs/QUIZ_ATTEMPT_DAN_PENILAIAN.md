# Dokumentasi Quiz Attempt dan Penilaian

Dokumen ini menjelaskan struktur database dan alur penilaian pada fitur pengerjaan quiz.

## Ruang Lingkup

Dokumen ini fokus pada:

- Struktur tabel yang terlibat dalam pengerjaan quiz.
- Relasi antar tabel attempt dan jawaban.
- Mekanisme penilaian saat siswa menjawab dan menyelesaikan quiz.
- Catatan implementasi penting untuk akurasi nilai.

## Tabel Inti

### 1. Tabel quiz_attempts

Menyimpan sesi pengerjaan quiz oleh satu siswa.

| Kolom            | Tipe      | Aturan                           | Keterangan                   |
| ---------------- | --------- | -------------------------------- | ---------------------------- |
| id               | BIGINT    | PK, auto increment               | ID attempt                   |
| quiz_id          | BIGINT    | FK -> quizzes.id, cascade delete | Quiz yang dikerjakan         |
| user_id          | BIGINT    | FK -> users.id, cascade delete   | Siswa peserta                |
| started_at       | TIMESTAMP | nullable                         | Waktu mulai attempt          |
| completed_at     | TIMESTAMP | nullable                         | Waktu selesai attempt        |
| total_points     | INT       | default 0                        | Akumulasi poin semua jawaban |
| correct_count    | INT       | default 0                        | Jumlah jawaban benar         |
| wrong_count      | INT       | default 0                        | Jumlah jawaban salah         |
| duration_seconds | INT       | nullable                         | Durasi pengerjaan (detik)    |
| created_at       | TIMESTAMP | nullable                         | Timestamp dibuat             |
| updated_at       | TIMESTAMP | nullable                         | Timestamp diubah             |

Index penting:

- index (quiz_id, user_id)

### 2. Tabel quiz_answers

Menyimpan jawaban siswa per pertanyaan dalam satu attempt.

| Kolom                   | Tipe      | Aturan                                       | Keterangan                                                 |
| ----------------------- | --------- | -------------------------------------------- | ---------------------------------------------------------- |
| id                      | BIGINT    | PK, auto increment                           | ID jawaban                                                 |
| quiz_attempt_id         | BIGINT    | FK -> quiz_attempts.id, cascade delete       | Attempt pemilik jawaban                                    |
| quiz_question_id        | BIGINT    | FK -> quiz_questions.id, cascade delete      | Pertanyaan yang dijawab                                    |
| quiz_question_option_id | BIGINT    | FK -> quiz_question_options.id, nullOnDelete | Opsi terpilih (pilihan ganda/true-false)                   |
| quiz_matching_pair_id   | BIGINT    | FK -> quiz_matching_pairs.id, nullOnDelete   | Legacy field matching (dipertahankan untuk kompatibilitas) |
| answer_text             | TEXT      | nullable                                     | Jawaban teks (short/long/true-false payload)               |
| is_correct              | TINYINT   | default false                                | Benar/salah jawaban ini                                    |
| awarded_points          | INT       | default 0                                    | Poin untuk jawaban ini                                     |
| answered_at             | TIMESTAMP | nullable                                     | Waktu menjawab                                             |
| created_at              | TIMESTAMP | nullable                                     | Timestamp dibuat                                           |
| updated_at              | TIMESTAMP | nullable                                     | Timestamp diubah                                           |

Constraint penting:

- unique (quiz_attempt_id, quiz_question_id)

Makna constraint:

- Dalam satu attempt, satu pertanyaan hanya punya satu record jawaban aktif.
- Jawaban di-update menggunakan upsert (updateOrCreate), bukan tambah baris baru berkali-kali.

### 3. Tabel quiz_answer_matching_pairs

Menyimpan detail jawaban per pasangan kiri-kanan untuk soal matching pairs.

| Kolom                                | Tipe      | Aturan                                     | Keterangan                      |
| ------------------------------------ | --------- | ------------------------------------------ | ------------------------------- |
| id                                   | BIGINT    | PK, auto increment                         | ID detail jawaban matching      |
| quiz_answer_id                       | BIGINT    | FK -> quiz_answers.id, cascade delete      | Header jawaban per pertanyaan   |
| quiz_attempt_id                      | BIGINT    | FK -> quiz_attempts.id, cascade delete     | Attempt pemilik jawaban         |
| quiz_question_id                     | BIGINT    | FK -> quiz_questions.id, cascade delete    | Pertanyaan matching             |
| left_quiz_matching_pair_id           | BIGINT    | FK -> quiz_matching_pairs.id, nullOnDelete | Item kiri yang harus dicocokkan |
| selected_right_quiz_matching_pair_id | BIGINT    | FK -> quiz_matching_pairs.id, nullOnDelete | Item kanan yang dipilih siswa   |
| is_correct                           | TINYINT   | default false                              | Benar/salah untuk pasangan ini  |
| awarded_points                       | INT       | default 0                                  | Poin untuk pasangan ini         |
| answered_at                          | TIMESTAMP | nullable                                   | Waktu menjawab pasangan         |
| created_at                           | TIMESTAMP | nullable                                   | Timestamp dibuat                |
| updated_at                           | TIMESTAMP | nullable                                   | Timestamp diubah                |

Constraint penting:

- unique (quiz_attempt_id, left_quiz_matching_pair_id)
- unique (quiz_attempt_id, quiz_question_id, selected_right_quiz_matching_pair_id)

Makna constraint:

- Dalam satu attempt, tiap item kiri hanya boleh dipasangkan sekali.
- Dalam satu pertanyaan matching, item kanan tidak boleh dipilih lebih dari sekali.
- Struktur ini memungkinkan satu soal matching menyimpan banyak pasangan tanpa menabrak unique key di quiz_answers.

### 4. Tabel quiz_student_access (pendukung)

Mengontrol siswa mana yang boleh mengerjakan quiz.

Kolom yang relevan untuk attempt:

- quiz_id
- user_id
- attempt_count
- accessed_at

Constraint penting:

- unique (quiz_id, user_id)

## Relasi Data (Alur)

Relasi utama:

- quizzes 1..\* quiz_attempts
- users (siswa) 1..\* quiz_attempts
- quiz_attempts 1..\* quiz_answers
- quiz_answers 1..\* quiz_answer_matching_pairs (khusus matching pairs)
- quiz_questions 1..\* quiz_answers

Urutan data saat quiz dikerjakan:

1. Siswa membuka quiz.
2. Sistem validasi akses di quiz_student_access.
3. Jika belum ada attempt aktif (completed_at null), sistem membuat baris baru di quiz_attempts.
4. Saat siswa menjawab, sistem melakukan upsert ke quiz_answers per question.
5. Khusus matching pairs, sistem menyimpan detail pasangan di quiz_answer_matching_pairs.
6. Saat submit akhir, sistem menghitung ulang agregat di quiz_attempts:

- total_points = sum(awarded_points) dari quiz_answers non-matching + quiz_answer_matching_pairs
- correct_count dan wrong_count mengikuti aturan counting yang dipilih (per-soal atau per-pair)
- duration_seconds
- completed_at

## Mekanisme Penilaian

Penilaian dilakukan per jawaban, lalu diakumulasi ke attempt.

### A. Multiple Choice dan True/False

Logika:

- Cocokkan quiz_question_option_id yang dipilih dengan option is_correct.
- Jika benar, awarded_points = points pada quiz_question.
- Jika salah, awarded_points = 0.

### B. Short Answer

Logika saat ini:

- Membandingkan answer_text dengan expected_answer (dengan opsi case_sensitive dan trim_whitespace).
- Jika sama persis, awarded_points = points; jika tidak, 0.

### C. Matching Pairs

Logika yang direkomendasikan setelah revisi database:

- Buat atau update satu baris header di quiz_answers untuk pertanyaan matching.
- Simpan tiap pasangan kiri-kanan sebagai satu baris di quiz_answer_matching_pairs.
- Hitung benar/salah per baris dengan membandingkan right_text milik left pair dengan pasangan kanan yang dipilih.
- awarded_points per pair = round(points_pertanyaan / jumlah_pair).
- Total skor pertanyaan matching = sum(awarded_points) dari semua row detail matching.

### D. Long Answer

Logika saat ini:

- Belum auto grading.
- awarded_points diset 0 (perlu penilaian manual jika dibutuhkan).

## Perhitungan Nilai Akhir Attempt

Saat attempt diselesaikan:

- correct_count = jumlah quiz_answers benar (non-matching) + jumlah pasangan benar di quiz_answer_matching_pairs (matching)
- wrong_count = jumlah quiz_answers salah (non-matching) + jumlah pasangan salah di quiz_answer_matching_pairs (matching)
- total_points = sum(quiz_answers.awarded_points untuk non-matching) + sum(quiz_answer_matching_pairs.awarded_points)

Persentase nilai dapat dihitung dari:

nilai_persen = (total_points / total_poin_maksimal_quiz) \* 100

Dengan:

- total_poin_maksimal_quiz = sum(points) dari seluruh quiz_questions pada quiz tersebut.

## Catatan Implementasi Penting

1. Frontend matching pairs wajib mengirim semua pasangan (left_id -> selected_right_id) dalam satu payload.
2. Backend perlu menyimpan detail pasangan ke quiz_answer_matching_pairs, bukan hanya ke kolom quiz_matching_pair_id di quiz_answers.
3. Untuk short answer multi-field, format pengiriman jawaban harus konsisten dengan logika grading backend.
4. Role check sebaiknya memakai slug role, bukan ID hardcoded, agar aman lintas environment.
5. Jika ingin nilai orang tua melihat nilai siswa, query cukup menggabungkan users (anak -> orang_tua_id), quiz_attempts, quizzes.

## Contoh Query Laporan Nilai Siswa

Contoh daftar nilai siswa tertentu:

```sql
SELECT
  qa.id AS attempt_id,
  q.title AS quiz_title,
  qa.total_points,
  qa.correct_count,
  qa.wrong_count,
  qa.duration_seconds,
  qa.completed_at
FROM quiz_attempts qa
JOIN quizzes q ON q.id = qa.quiz_id
WHERE qa.user_id = :student_id
  AND qa.completed_at IS NOT NULL
ORDER BY qa.completed_at DESC;
```

Contoh daftar nilai semua anak untuk satu orang tua:

```sql
SELECT
  parent.id AS parent_id,
  parent.name AS parent_name,
  child.id AS student_id,
  child.name AS student_name,
  q.title AS quiz_title,
  qa.total_points,
  qa.correct_count,
  qa.wrong_count,
  qa.completed_at
FROM users child
JOIN users parent ON parent.id = child.orang_tua_id
JOIN quiz_attempts qa ON qa.user_id = child.id
JOIN quizzes q ON q.id = qa.quiz_id
WHERE parent.id = :parent_id
  AND qa.completed_at IS NOT NULL
ORDER BY child.name, qa.completed_at DESC;
```

## Ringkasan

Secara struktur database:

- Fondasi attempt dan penilaian sudah tersedia dan baik.
- Integritas data terjaga dengan foreign key dan unique key.
- Alur evaluasi dapat dipakai untuk hasil siswa langsung setelah submit.

Untuk akurasi penuh lintas semua tipe soal, perlu sinkronisasi tambahan pada layer frontend-backend khususnya matching pairs dan short answer multi-field.
