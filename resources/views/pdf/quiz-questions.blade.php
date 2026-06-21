<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>{{ $quiz->title }} - Soal</title>
    <style>
        @page {
            margin: 15mm 14mm 16mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #1f2937;
            font-family: "DejaVu Sans", sans-serif;
            font-size: 10.5pt;
            line-height: 1.45;
        }

        .header {
            width: 100%;
            border-bottom: 2px solid #1f2937;
            padding-bottom: 10px;
        }

        .header td {
            vertical-align: middle;
        }

        .logo {
            width: 64px;
            max-height: 64px;
            object-fit: contain;
        }

        .school-name {
            margin: 0 0 2px;
            font-size: 15pt;
            font-weight: bold;
            text-align: center;
        }

        .document-title {
            margin: 0;
            font-size: 12pt;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
        }

        .quiz-title {
            margin: 3px 0 0;
            font-size: 11pt;
            text-align: center;
        }

        .meta-table,
        .identity-table {
            width: 100%;
            margin-top: 10px;
            border-collapse: collapse;
        }

        .meta-table td {
            width: 25%;
            padding: 2px 8px 2px 0;
            vertical-align: top;
        }

        .identity-table td {
            width: 50%;
            padding: 5px 12px 5px 0;
        }

        .line {
            display: inline-block;
            width: 70%;
            height: 14px;
            border-bottom: 1px solid #4b5563;
            vertical-align: bottom;
        }

        .instructions {
            margin: 10px 0 14px;
            padding: 7px 9px;
            border: 1px solid #d1d5db;
            background: #f9fafb;
            font-size: 9pt;
        }

        .question {
            margin: 0 0 14px;
            page-break-inside: avoid;
        }

        .question-heading {
            width: 100%;
            margin-bottom: 5px;
            border-collapse: collapse;
        }

        .question-number {
            width: 28px;
            vertical-align: top;
            font-weight: bold;
        }

        .question-points {
            width: 62px;
            color: #4b5563;
            font-size: 8.5pt;
            text-align: right;
            vertical-align: top;
        }

        .question-text {
            font-weight: 600;
            white-space: pre-wrap;
        }

        .question-media {
            display: block;
            max-width: 360px;
            max-height: 190px;
            margin: 7px auto 9px;
            border: 1px solid #e5e7eb;
        }

        .options {
            width: 100%;
            margin: 4px 0 0 28px;
            border-collapse: collapse;
        }

        .options td {
            padding: 3px 4px;
            vertical-align: top;
        }

        .option-label {
            width: 25px;
            font-weight: bold;
        }

        .matching-table {
            width: calc(100% - 28px);
            margin: 6px 0 0 28px;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .matching-table th,
        .matching-table td {
            border: 1px solid #cbd5e1;
            padding: 6px;
            vertical-align: middle;
        }

        .matching-table th {
            background: #f1f5f9;
            font-size: 9pt;
            text-align: center;
        }

        .matching-index {
            width: 28px;
            font-weight: bold;
            text-align: center;
        }

        .matching-gap {
            width: 22mm;
            padding: 0 !important;
            border: 0 !important;
            background: transparent !important;
        }

        .matching-media {
            display: block;
            max-width: 125px;
            max-height: 85px;
            margin: 0 auto 4px;
        }

        .matching-text {
            text-align: center;
            white-space: pre-wrap;
        }

        .answer-area {
            margin: 7px 0 0 28px;
        }

        .answer-line {
            height: 22px;
            border-bottom: 1px solid #9ca3af;
        }

        .empty-state {
            margin-top: 24px;
            padding: 16px;
            border: 1px dashed #9ca3af;
            color: #6b7280;
            text-align: center;
        }

        .footer {
            position: fixed;
            right: 0;
            bottom: -9mm;
            left: 0;
            color: #6b7280;
            font-size: 7.5pt;
            text-align: center;
        }
    </style>
</head>
<body>
@php
    $typeLabels = [
        'multiple_choice' => 'Pilihan Ganda',
        'true_false' => 'Benar / Salah',
        'short_answer' => 'Isian Singkat',
        'long_answer' => 'Jawaban Panjang',
        'matching_pairs' => 'Mencocokkan',
    ];
    $schoolName = $quiz->jenjang?->nama_sekolah ?: 'SMP Al-Falah';
@endphp

<table class="header">
    <tr>
        <td style="width: 74px;">
            @if ($logoSrc)
                <img src="{{ $logoSrc }}" alt="Logo sekolah" class="logo">
            @endif
        </td>
        <td>
            <p class="school-name">{{ $schoolName }}</p>
            <p class="document-title">{{ $quiz->category?->name ?: '-' }}</p>
            <p class="document-title">{{ $quiz->title }}</p>
        </td>
        <td style="width: 74px;"></td>
    </tr>
</table>

<table class="meta-table">
    <tr>
        <td><strong>Jenjang:</strong>{{ $quiz->jenjang?->jenjang ?: '-' }}</td>
        <td><strong>Kelas:</strong>{{ $quiz->kelas?->nama_kelas ?: '-' }}</td>
    </tr>
    <tr>
        <td><strong>Jumlah soal:</strong>{{ $quiz->questions->count() }}</td>
        <td><strong>Durasi:</strong>{{ $quiz->duration ? $quiz->duration.' menit' : 'Tidak dibatasi' }}</td>
    </tr>
</table>

<table class="identity-table">
    <tr>
        <td><strong>Nama:</strong> <span class="line"></span></td>
        <td><strong>Tanggal:</strong> <span class="line" style="width: 65%;"></span></td>
    </tr>
    <tr>
        <td></td>
        <td></td>
    </tr>
</table>

<div class="instructions">
    Bacalah setiap soal dengan teliti. Untuk soal mencocokkan, tarik garis dari sisi kiri ke pilihan sisi kanan yang sesuai.
</div>

@forelse ($quiz->questions as $questionIndex => $question)
    <div class="question">
        <table class="question-heading">
            <tr>
                <td class="option-label">{{ $questionIndex + 1 }}.</td>
                <td class="question-text">{{ $question->question_text }}</td>
                <td class="question-points">
                    
                </td>
            </tr>
        </table>

        @if ($question->pdf_media_src)
            <img src="{{ $question->pdf_media_src }}" alt="Media soal" class="question-media">
        @endif

        @if (in_array($question->question_type, ['multiple_choice', 'true_false'], true))
            <table class="options">
                @foreach ($question->options as $optionIndex => $option)
                    <tr>
                        <td class="option-label">{{ chr(65 + $optionIndex) }}.</td>
                        <td>{{ $option->option_text }}</td>
                    </tr>
                @endforeach
            </table>
        @elseif ($question->question_type === 'matching_pairs')
            @php
                $leftPairs = $question->matchingPairs->values();
                $rightPairs = $question->matchingPairs->values();
                if ($rightPairs->count() > 1) {
                    $rightPairs = $rightPairs->slice(1)->concat($rightPairs->take(1))->values();
                }
            @endphp
            <table class="matching-table">
                <colgroup>
                    <col style="width: 28px;">
                    <col>
                    <col style="width: 22mm;">
                    <col style="width: 28px;">
                    <col>
                </colgroup>
                <thead>
                    <tr>
                        <th colspan="2">Sisi Kiri</th>
                        <th class="matching-gap"></th>
                        <th colspan="2">Pilihan Sisi Kanan</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($leftPairs as $pairIndex => $leftPair)
                        @php($rightPair = $rightPairs->get($pairIndex))
                        <tr>
                            <td class="matching-index">{{ $pairIndex + 1 }}</td>
                            <td>
                                @if ($leftPair->pdf_left_media_src)
                                    <img src="{{ $leftPair->pdf_left_media_src }}" alt="Media sisi kiri" class="matching-media">
                                @endif
                                @if (filled($leftPair->left_text))
                                    <div class="matching-text">{{ $leftPair->left_text }}</div>
                                @endif
                            </td>
                            <td class="matching-gap"></td>
                            <td class="matching-index">{{ chr(65 + $pairIndex) }}</td>
                            <td>
                                @if ($rightPair?->pdf_right_media_src)
                                    <img src="{{ $rightPair->pdf_right_media_src }}" alt="Media sisi kanan" class="matching-media">
                                @endif
                                @if (filled($rightPair?->right_text))
                                    <div class="matching-text">{{ $rightPair->right_text }}</div>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @elseif ($question->question_type === 'long_answer')
            <div class="answer-area">
                @for ($line = 0; $line < 6; $line++)
                    <div class="answer-line"></div>
                @endfor
            </div>
        @elseif ($question->question_type === 'short_answer')
            <div class="answer-area">
                <div class="answer-line"></div>
            </div>
        @endif
    </div>
@empty
    <div class="empty-state">Belum ada soal pada kuis ini.</div>
@endforelse

<div class="footer">
    {{ $quiz->title }} &middot; Dibuat {{ $generatedAt->format('d/m/Y H:i') }}
</div>
</body>
</html>
