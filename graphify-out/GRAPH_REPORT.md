# Graph Report - quiz-app  (2026-08-25)

## Corpus Check
- 305 files · ~115,428 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1651 nodes · 3236 edges · 185 communities (130 shown, 55 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `159f21b5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- questions.tsx
- quizzes/index.tsx
- input.tsx
- app-layout.tsx
- users/edit.tsx
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Deploy ke Shared Hosting
- Controller
- quizzes/create.tsx
- Quiz
- sidebar.tsx
- button.tsx
- User
- Illuminate\Database\Seeder
- Role
- QuizAttempt
- Changes Made
- Jenjang
- app-header.tsx
- What You Must Do When Invoked
- Cara Menggunakan Custom Authentication
- Database Documentation
- dropdown-menu.tsx
- FortifyServiceProvider.php
- Illuminate\Http\Request
- User.php
- cn
- compilerOptions
- UserBulkImportService
- components.json
- Dokumentasi Quiz Attempt dan Penilaian
- Illuminate\Database\Eloquent\Relations\HasMany
- utils.ts
- CheckMenuAccess.php
- use-appearance.tsx
- index.d.ts
- devDependencies
- app-shell.tsx
- CatatanTelaahSoal
- UserImportTemplateService
- composer.json
- breadcrumbs.tsx
- optionalDependencies
- scripts
- scripts
- dependencies
- QuizBackground
- QuizCategory
- require
- require-dev
- Gallery
- graphify reference: extra exports and benchmark
- history.tsx
- QuizStudentAccess
- UserFactory
- setup
- Dokumentasi Sistem Hak Akses (Role & Menu Permissions)
- config
- Format Import Pengguna Excel
- graphify reference: query, path, explain
- dev:ssr
- Quiz App
- quiz.d.ts
- psr-4
- .scopeAvailableAt
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- post-create-project-cmd
- 2026_06_21_000001_create_user_guides_table.php
- summary-card.tsx
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- extra
- laravel-boost
- TestCase
- ui/icon.tsx
- placeholder-pattern.tsx
- AGENTS.md
- clsx
- extraction-spec.md
- concurrently
- @eslint/js
- globals
- @headlessui/react
- @inertiajs/react
- input-otp
- laravel-vite-plugin
- @laravel/vite-plugin-wayfinder
- lucide-react
- @radix-ui/react-avatar
- @radix-ui/react-collapsible
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-label
- @radix-ui/react-navigation-menu
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-slot
- @radix-ui/react-switch
- @radix-ui/react-tabs
- @radix-ui/react-toggle-group
- @radix-ui/react-tooltip
- react-dom
- react-dropzone
- tailwind-merge
- tailwindcss
- @tailwindcss/vite
- tw-animate-css
- @types/react
- @types/react-dom
- typescript
- @vitejs/plugin-react
- ziggy-js
- prettier
- prettier-plugin-tailwindcss
- @types/node

## God Nodes (most connected - your core abstractions)
1. `cn()` - 137 edges
2. `User` - 78 edges
3. `Quiz` - 62 edges
4. `Button()` - 62 edges
5. `Input()` - 40 edges
6. `Controller` - 38 edges
7. `Label()` - 33 edges
8. `QuizController` - 30 edges
9. `Jenjang` - 30 edges
10. `Role` - 30 edges

## Surprising Connections (you probably didn't know these)
- `createDashboardStudent()` --calls--> `Role`  [INFERRED]
  tests/Feature/DashboardTest.php → app/Models/Role.php
- `createUserWithRole()` --calls--> `Role`  [INFERRED]
  tests/Feature/GuestAudienceIsolationTest.php → app/Models/Role.php
- `createImportRole()` --references--> `Role`  [EXTRACTED]
  tests/Feature/Master/UserImportTest.php → app/Models/Role.php
- `createPdfTestUserWithRole()` --calls--> `Role`  [INFERRED]
  tests/Feature/QuizQuestionsPdfTest.php → app/Models/Role.php
- `createDashboardQuiz()` --references_constant--> `Quiz`  [EXTRACTED]
  tests/Feature/DashboardTest.php → app/Models/Quiz.php

## Import Cycles
- None detected.

## Communities (185 total, 55 thin omitted)

### Community 0 - "questions.tsx"
Cohesion: 0.06
Nodes (47): NilaiFilterBar(), Badge(), badgeVariants, Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter() (+39 more)

### Community 1 - "quizzes/index.tsx"
Cohesion: 0.05
Nodes (40): AlertError(), AppLogoIcon(), TwoFactorRecoveryCodes(), TwoFactorRecoveryCodesProps, TwoFactorSetupModal(), TwoFactorSetupModalProps, TwoFactorSetupStep(), Card() (+32 more)

### Community 2 - "input.tsx"
Cohesion: 0.10
Nodes (20): HeadingSmall(), InputError(), LinkProps, TextLink(), Input(), Label(), PasswordInput(), Spinner() (+12 more)

### Community 3 - "app-layout.tsx"
Cohesion: 0.08
Nodes (33): Pagination(), PaginationLink, PaginationProps, Alert(), AlertDescription(), AlertTitle(), alertVariants, AppLayoutProps (+25 more)

### Community 4 - "users/edit.tsx"
Cohesion: 0.08
Nodes (32): Filters, JenjangItem, NilaiFilterBarProps, Select(), SelectContent(), SelectItem(), SelectTrigger(), SelectValue() (+24 more)

### Community 5 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.08
Nodes (8): QuizAnswer, QuizAnswerMatchingPair, QuizQuestionOption, QuizShortAnswerField, QuizTeacherAccess, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Eloquent\Model, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 6 - "Deploy ke Shared Hosting"
Cohesion: 0.05
Nodes (43): 1.1 Build Frontend (Wajib), 1.2 Install Dependensi PHP (Production), 1.3 Bersihkan Cache Lama, 3.1 Struktur Direktori di Hosting, 3.2 Upload File Aplikasi, 500 Internal Server Error, Checklist Deploy, CSS/JS Tidak Muncul (+35 more)

### Community 7 - "Controller"
Cohesion: 0.10
Nodes (13): PasswordResetRequestController, Controller, UserGuideController, PasswordController, ProfileController, TwoFactorAuthenticationController, UserGuideController, UserGuide (+5 more)

### Community 8 - "quizzes/create.tsx"
Cohesion: 0.06
Nodes (27): MatchingPairContent(), MatchingPairContentProps, Textarea, breadcrumbs, Jenjang, Kelas, Props, Answer (+19 more)

### Community 10 - "sidebar.tsx"
Cohesion: 0.10
Nodes (32): AppSidebar(), NavFooter(), NavMain(), NavMainWithDropdown(), NavUser(), Sidebar(), SidebarContent(), SidebarContext (+24 more)

### Community 11 - "button.tsx"
Cohesion: 0.10
Nodes (19): FileUploader(), FileUploaderProps, Button(), buttonVariants, Checkbox(), breadcrumbs, Props, StudentQuiz (+11 more)

### Community 12 - "User"
Cohesion: 0.09
Nodes (8): User, Illuminate\Foundation\Auth\User, createDashboardQuiz(), createDashboardStudent(), createGuestQuizFor(), createUserWithRole(), createPdfTestQuiz(), createPdfTestUserWithRole()

### Community 13 - "Illuminate\Database\Seeder"
Cohesion: 0.08
Nodes (11): CatatanTelaahSoalSeeder, DatabaseSeeder, JenjangSeeder, KelasSeeder, QuizCategorySeeder, QuizQuestionOptionSeeder, QuizQuestionSeeder, QuizSeeder (+3 more)

### Community 14 - "Role"
Cohesion: 0.11
Nodes (7): RoleController, RoleMenuController, Menu, Role, MenuSeeder, createPasswordResetRole(), createUserGuideUser()

### Community 15 - "QuizAttempt"
Cohesion: 0.14
Nodes (3): NilaiController, QuizAttemptController, QuizAttempt

### Community 16 - "Changes Made"
Cohesion: 0.07
Nodes (27): 1. Database Migration, 2. Models, 3. Seeders, 4. Quiz CRUD, 5. Nilai Controller, 6. New Frontend Components, 7. Nilai Pages, Changes Made (+19 more)

### Community 17 - "Jenjang"
Cohesion: 0.13
Nodes (7): JenjangController, KelasController, Jenjang, Kelas, Illuminate\Http\UploadedFile, createImportRole(), makeUserImportFile()

### Community 18 - "app-header.tsx"
Cohesion: 0.13
Nodes (18): AppHeader(), AppHeaderProps, mainNavItems, AppLogo(), Avatar(), AvatarFallback(), AvatarImage(), navigationMenuTriggerStyle (+10 more)

### Community 19 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 20 - "Cara Menggunakan Custom Authentication"
Cohesion: 0.08
Nodes (24): 1. Aktifkan Custom Routes, 1. Buat User untuk Testing, 2. Akses Custom Login, 2. Test Login, 3. Test Logout, 3. Update Navigation (Opsional), 4. Test Auth Check, Backend (Laravel) (+16 more)

### Community 21 - "Database Documentation"
Cohesion: 0.08
Nodes (24): Additional Tables, Authentication & User Management, Cache System, Database Documentation, Database Relationships, Entity Relationship Summary, ER Diagram, Job Queue System (+16 more)

### Community 22 - "dropdown-menu.tsx"
Cohesion: 0.15
Nodes (15): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+7 more)

### Community 23 - "FortifyServiceProvider.php"
Cohesion: 0.13
Nodes (8): CreateNewUser, ResetUserPassword, AppServiceProvider, FortifyServiceProvider, Illuminate\Support\ServiceProvider, Laravel\Fortify\Contracts\CreatesNewUsers, Laravel\Fortify\Contracts\ResetsUserPasswords, PasswordValidationRules

### Community 24 - "Illuminate\Http\Request"
Cohesion: 0.17
Nodes (4): PasswordResetRequestController, UserController, PasswordResetRequest, Illuminate\Http\Request

### Community 25 - "User.php"
Cohesion: 0.11
Nodes (6): ProfileUpdateRequest, TwoFactorAuthenticationRequest, Illuminate\Foundation\Http\FormRequest, Illuminate\Notifications\Notifiable, Laravel\Fortify\InteractsWithTwoFactorState, Laravel\Fortify\TwoFactorAuthenticatable

### Community 26 - "cn"
Cohesion: 0.15
Nodes (17): Icon(), IconProps, NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList() (+9 more)

### Community 27 - "compilerOptions"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 29 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 30 - "Dokumentasi Quiz Attempt dan Penilaian"
Cohesion: 0.11
Nodes (17): 1. Tabel quiz_attempts, 2. Tabel quiz_answers, 3. Tabel quiz_answer_matching_pairs, 4. Tabel quiz_student_access (pendukung), A. Multiple Choice dan True/False, B. Short Answer, C. Matching Pairs, Catatan Implementasi Penting (+9 more)

### Community 31 - "Illuminate\Database\Eloquent\Relations\HasMany"
Cohesion: 0.17
Nodes (3): QuizMatchingPair, QuizQuestion, Illuminate\Database\Eloquent\Relations\HasMany

### Community 32 - "utils.ts"
Cohesion: 0.21
Nodes (11): Heading(), Separator(), ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants, SettingsLayout() (+3 more)

### Community 33 - "CheckMenuAccess.php"
Cohesion: 0.18
Nodes (7): CheckMenuAccess, HandleAppearance, HandleInertiaRequests, Closure, Illuminate\Foundation\Configuration\Middleware, Inertia\Middleware, Symfony\Component\HttpFoundation\Response

### Community 34 - "use-appearance.tsx"
Cohesion: 0.24
Nodes (10): AppearanceToggleTab(), Appearance, applyTheme(), handleSystemThemeChange(), initializeTheme(), mediaQuery(), prefersDark(), setCookie() (+2 more)

### Community 35 - "index.d.ts"
Cohesion: 0.12
Nodes (15): Auth, BreadcrumbItem, CatatanTelaahSoal, Gallery, Jenjang, Kelas, NavGroup, NavItem (+7 more)

### Community 36 - "devDependencies"
Cohesion: 0.13
Nodes (15): babel-plugin-react-compiler, eslint-config-prettier, eslint-plugin-react, eslint-plugin-react-hooks, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-prettier (+7 more)

### Community 37 - "app-shell.tsx"
Cohesion: 0.17
Nodes (10): AppContent(), AppContentProps, AppShell(), AppShellProps, SidebarInset(), SidebarProvider(), isSmallerThanBreakpoint(), mediaQueryListener() (+2 more)

### Community 40 - "composer.json"
Cohesion: 0.14
Nodes (13): autoload-dev, psr-4, description, keywords, license, minimum-stability, name, prefer-stable (+5 more)

### Community 41 - "breadcrumbs.tsx"
Cohesion: 0.22
Nodes (11): AppSidebarHeader(), AppearanceToggleDropdown(), Breadcrumbs(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList() (+3 more)

### Community 42 - "optionalDependencies"
Cohesion: 0.15
Nodes (13): lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, @rollup/rollup-linux-x64-gnu, @rollup/rollup-win32-x64-msvc, @tailwindcss/oxide-linux-x64-gnu (+5 more)

### Community 43 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, post-autoload-dump, post-update-cmd, pre-package-uninstall, test, Illuminate\\Foundation\\ComposerScripts::postAutoloadDump, Illuminate\\Foundation\\ComposerScripts::prePackageUninstall, @php artisan boost:update --ansi (+4 more)

### Community 44 - "scripts"
Cohesion: 0.17
Nodes (11): private, $schema, scripts, build, build:ssr, dev, format, format:check (+3 more)

### Community 45 - "dependencies"
Cohesion: 0.18
Nodes (11): class-variance-authority, dependencies, class-variance-authority, @radix-ui/react-checkbox, @radix-ui/react-toggle, react, vite, @radix-ui/react-checkbox (+3 more)

### Community 48 - "require"
Cohesion: 0.20
Nodes (10): require, barryvdh/laravel-dompdf, inertiajs/inertia-laravel, laravel/fortify, laravel/framework, laravel/tinker, laravel/wayfinder, php (+2 more)

### Community 49 - "require-dev"
Cohesion: 0.20
Nodes (10): require-dev, fakerphp/faker, laravel/boost, laravel/pail, laravel/pint, laravel/sail, mockery/mockery, nunomaduro/collision (+2 more)

### Community 51 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 52 - "history.tsx"
Cohesion: 0.33
Nodes (8): AttemptData, formatDateTime(), formatDuration(), getScoreColor(), getScoreGradient(), Props, QuizHistory(), QuizInfo

### Community 54 - "UserFactory"
Cohesion: 0.36
Nodes (3): UserFactory, Illuminate\Database\Eloquent\Factories\Factory, static

### Community 55 - "setup"
Cohesion: 0.25
Nodes (8): post-root-package-install, setup, composer install, npm install, npm run build, @php artisan key:generate, @php artisan migrate --force, @php -r \"file_exists('.env') || copy('.env.example', '.env');\

### Community 56 - "Dokumentasi Sistem Hak Akses (Role & Menu Permissions)"
Cohesion: 0.25
Nodes (7): 1. Struktur Database, 2. Models & Relasi, 3. Inisialisasi Data (Seeder), 4. Antarmuka Manajemen Hak Akses, 5. Render Sidebar Dinamis, 6. Proteksi Rute (Middleware), Dokumentasi Sistem Hak Akses (Role & Menu Permissions)

### Community 57 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 58 - "Format Import Pengguna Excel"
Cohesion: 0.29
Nodes (6): Aturan Import, Contoh Baris, Dependency, Format Import Pengguna Excel, Kolom Sheet Import Pengguna, Setup Server Live

### Community 59 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 60 - "dev:ssr"
Cohesion: 0.33
Nodes (6): dev, dev:ssr, Composer\\Config::disableProcessTimeout, npm run build:ssr, npx concurrently -c \"#93c5fd,#c4b5fd,#fb7185,#fdba74\" \"php artisan serve\" \"php artisan queue:listen --tries=1\" \"php artisan pail --timeout=0\" \"php artisan inertia:start-ssr\" --names=server,queue,logs,ssr --kill-others, npx concurrently -c \"#93c5fd,#c4b5fd,#fdba74\" \"php artisan serve\" \"php artisan queue:listen --tries=1\" \"npm run dev\" --names='server,queue,vite

### Community 61 - "Quiz App"
Cohesion: 0.33
Nodes (5): Cara Menjalankan Aplikasi, Cara Setup Project (Setelah Clone), Persyaratan Sistem, Quiz App, Setup Manual (Alternatif)

### Community 62 - "quiz.d.ts"
Cohesion: 0.33
Nodes (5): Quiz, QuizMatchingPair, QuizQuestion, QuizQuestionOption, QuizShortAnswerField

### Community 63 - "psr-4"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 65 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 66 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 67 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 68 - "post-create-project-cmd"
Cohesion: 0.50
Nodes (4): post-create-project-cmd, @php artisan key:generate --ansi, @php artisan migrate --graceful --ansi, @php -r \"file_exists('database/database.sqlite') || touch('database/database.sqlite');\

### Community 70 - "summary-card.tsx"
Cohesion: 0.50
Nodes (3): colorMap, SummaryCard(), SummaryCardProps

### Community 74 - "extra"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

## Knowledge Gaps
- **490 isolated node(s):** `php`, `$schema`, `style`, `rsc`, `tsx` (+485 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **55 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `questions.tsx`, `quizzes/index.tsx`, `input.tsx`, `use-appearance.tsx`, `app-layout.tsx`, `users/edit.tsx`, `utils.ts`, `app-shell.tsx`, `quizzes/create.tsx`, `breadcrumbs.tsx`, `sidebar.tsx`, `button.tsx`, `app-header.tsx`, `dropdown-menu.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `Button()` connect `button.tsx` to `questions.tsx`, `quizzes/index.tsx`, `input.tsx`, `app-layout.tsx`, `users/edit.tsx`, `utils.ts`, `quizzes/create.tsx`, `sidebar.tsx`, `app-header.tsx`, `history.tsx`, `dropdown-menu.tsx`, `cn`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `User` connect `User` to `Illuminate\Database\Eloquent\Relations\BelongsTo`, `CatatanTelaahSoal`, `UserImportTemplateService`, `Quiz`, `Role`, `QuizAttempt`, `Jenjang`, `FortifyServiceProvider.php`, `Illuminate\Http\Request`, `User.php`, `UserBulkImportService`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `User` (e.g. with `.store()` and `.configureActions()`) actually correct?**
  _`User` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `php`, `$schema`, `style` to the rest of the system?**
  _490 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `questions.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05901639344262295 - nodes in this community are weakly interconnected._
- **Should `quizzes/index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05367231638418079 - nodes in this community are weakly interconnected._