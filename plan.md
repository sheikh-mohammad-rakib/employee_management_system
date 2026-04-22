# 🏢 Employee Management System — Comprehensive Implementation Plan

> **Stack:** Next.js 16 (App Router) · Prisma ORM · NeonDB (PostgreSQL) · JWT Authentication · Tailwind CSS v4 · shadcn/ui (radix-nova)  
> **Assessment:** Full-Stack Developer Assessment  
> **Initialized via:** `npx shadcn@latest init --preset b0 --template next`

---

## 📋 Table of Contents

1. [Project Setup & Architecture](#phase-1-project-setup--architecture)
2. [Database Design & Prisma Schema](#phase-2-database-design--prisma-schema)
3. [Authentication & Authorization](#phase-3-authentication--authorization)
4. [API Routes — Core Backend](#phase-4-api-routes--core-backend)
5. [Frontend Pages & Components](#phase-5-frontend-pages--components)
6. [Password Management (OTP)](#phase-6-password-management-otp)
7. [Bonus Features](#phase-7-bonus-features-optional)
8. [Testing & Quality](#phase-8-testing--quality)
9. [Documentation & Submission](#phase-9-documentation--submission)

---

## Phase 1: Project Setup & Architecture ✅ COMPLETE

### Step 1.1 — Project Already Initialized

> The project was bootstrapped with the following command (already done):
> ```bash
> npx shadcn@latest init --preset b0 --template next
> ```

This sets up **Next.js 16** with **React 19**, **Tailwind CSS v4**, and **shadcn/ui** (radix-nova style) in a single command.

**Current workspace structure (flat — no `src/` directory):**

> ⚠️ `@/*` maps to the **root** (`./`), not `./src/`. Always place files at root level.

```
employee-management-system/          ← @/ root
├── app/                             ✅ exists
│   ├── globals.css                  ✅ Tailwind v4 tokens (@theme block)
│   ├── layout.tsx                   ✅ Root layout (Inter font + ThemeProvider)
│   ├── page.tsx                     ✅ Home page
│   ├── (auth)/                      🔲 to create
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/                 🔲 to create
│   │   ├── employee/
│   │   │   ├── page.tsx             # Employee dashboard
│   │   │   ├── attendance/page.tsx
│   │   │   ├── leaves/page.tsx
│   │   │   └── tasks/page.tsx
│   │   └── admin/
│   │       ├── page.tsx             # Admin/HR dashboard
│   │       ├── employees/page.tsx
│   │       ├── attendance/page.tsx
│   │       ├── leaves/page.tsx
│   │       └── tasks/page.tsx
│   └── api/                         🔲 to create
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   └── logout/route.ts
│       ├── attendance/
│       │   ├── checkin/route.ts
│       │   ├── checkout/route.ts
│       │   └── route.ts
│       ├── leaves/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── tasks/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── password/
│           ├── send-otp/route.ts
│           └── reset/route.ts
├── components/                      ✅ exists
│   ├── theme-provider.tsx           ✅ dark/light toggle (press "D")
│   ├── ui/
│   │   └── button.tsx               ✅ shadcn Button (radix-nova)
│   ├── auth/                        🔲 Login/Register forms
│   ├── dashboard/                   🔲 Dashboard widgets
│   ├── attendance/                  🔲
│   ├── leaves/                      🔲
│   ├── tasks/                       🔲
│   └── shared/                      🔲 Navbar, Sidebar, Notifications
├── hooks/                           ✅ exists (empty, for custom hooks)
├── lib/                             ✅ exists
│   ├── utils.ts                     ✅ cn() helper (clsx + tailwind-merge)
│   ├── prisma.ts                    🔲 Prisma client singleton (v7 + pg adapter)
│   ├── jwt.ts                       🔲 JWT sign/verify helpers
│   ├── auth.ts                      🔲 Auth middleware helpers
│   ├── otp.ts                       🔲 OTP generation utility
│   └── mailer.ts                    🔲 Email sending (optional)
├── middleware.ts                    🔲 Route protection (at root)
├── types/
│   └── index.ts                     🔲 Shared TypeScript types
├── prisma/
│   └── schema.prisma                ✅ created (models to be added)
├── prisma.config.ts                 ✅ Prisma v7 config (datasource URL + migration path)
├── components.json                  ✅ shadcn config (radix-nova, rsc: true)
├── .env                             ✅ created by prisma init (replace DATABASE_URL placeholder)
├── .env.local                       🔲 to create (JWT, SMTP secrets)
└── package.json                     ✅ Next 16 / React 19 / Tailwind v4 / Prisma v7
```


### Step 1.2 — Install Dependencies ✅ PARTIALLY COMPLETE

**Already installed** by the shadcn b0/next template:
- `next` 16, `react` 19, `react-dom` 19
- `next-themes`, `radix-ui`, `lucide-react`, `shadcn`
- `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`
- `tailwindcss` v4, `@tailwindcss/postcss`, `prettier`, `prettier-plugin-tailwindcss`, `typescript`, `eslint`

**Already installed** (done manually):
- `prisma` v7, `tsx`, `@types/pg` (dev)
- `@prisma/client` v7, `@prisma/adapter-pg`, `dotenv`, `pg`

**Still to install:**
```bash
# Authentication
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs

# Utilities
npm install cookies-next zod react-hot-toast

# OTP / Email (optional for bonus)
npm install nodemailer
npm install -D @types/nodemailer
```


### Step 1.3a — Design System Notes (Tailwind v4)

> ⚠️ **No `tailwind.config.ts`** — This project uses **Tailwind CSS v4 CSS-first configuration**. All tokens live in `app/globals.css` via the `@theme` block.

- **To add tokens:** extend the `@theme {}` block or add `--variable: value` in `:root` / `.dark` — do **not** create a `tailwind.config.ts`
- **shadcn components:** run `npx shadcn@latest add <component>` to install into `components/ui/`
- **Dark mode:** already wired — `ThemeProvider` wraps the app; press **D** to toggle light/dark
- **Style:** `radix-nova` — components use CSS custom properties (e.g. `var(--primary)`) not hardcoded colors
- **Fonts:** Inter (`--font-sans`) + Geist Mono (`--font-mono`) already loaded in `layout.tsx`

### Step 1.3 — Configure Environment Variables ✅ PARTIALLY COMPLETE

> **⚠️ Two env files required** with Prisma v7:
> - **`.env`** — created by `prisma init`; holds `DATABASE_URL` (read by Prisma via `dotenv/config`)
> - **`.env.local`** — for Next.js app secrets (JWT, SMTP, etc.)

**`.env`** (already created by `prisma init` — replace the placeholder URL):
```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

**`.env.local`** (create this — for Next.js only, not read by Prisma):
```env
# JWT
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# OTP
OTP_EXPIRY_MINUTES=10

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
```

> Add `.env` and `.env.local` to `.gitignore` (Prisma init warned about `.env` already).


---

## Phase 2: Database Design & Prisma Schema ✅ PARTIALLY COMPLETE

> **⚠️ Prisma v7 detected** — This version has significant differences from Prisma v5/v6.  
> Already done: `npm install prisma tsx @types/pg --save-dev`, `npm install @prisma/client @prisma/adapter-pg dotenv pg`, `npx prisma init --output ../app/generated/prisma`

### Step 2.1 — Prisma Already Initialized ✅

**What was generated:**

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Data models (no `url` here — moved to config) |
| `prisma.config.ts` | **New v7 config file** — datasource URL + migration path |
| `.env` | Database URL (loaded via `import "dotenv/config"` in prisma.config.ts) |

**`prisma.config.ts`** (already exists at root):
```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

> ⚠️ **`.env` vs `.env.local`**: Prisma v7 reads `.env` (via `dotenv/config`), **not** Next.js's `.env.local`. Keep DB credentials in `.env`. JWT secrets and app config can stay in `.env.local` for Next.js.

**Current `prisma/schema.prisma`** (generator now uses `prisma-client`, not `prisma-client-js`):
```prisma
generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"   // ← generated client goes here, NOT node_modules
}

datasource db {
  provider = "postgresql"
  // URL is configured in prisma.config.ts, not here
}
```

> ⚠️ **Generated client location**: The Prisma client is generated at `app/generated/prisma/` — import from there, **not** from `@prisma/client`.

### Step 2.2 — Configure NeonDB URL

Update `.env` with your NeonDB connection string:

```env
# Replace the placeholder with your actual NeonDB URL
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

> The `.env` file was created by Prisma init with a local `prisma+postgres://` placeholder. Replace it with your NeonDB URL.

Also add remaining app config to `.env.local` (for Next.js):

```env
# JWT
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# OTP (in-memory or email-based)
OTP_EXPIRY_MINUTES=10

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
```

### Step 2.3 — Define Data Models

Add models to `prisma/schema.prisma` (append after the existing generator/datasource blocks):

```prisma
enum Role {
  ADMIN
  HR
  EMPLOYEE
}

enum LeaveStatus {
  PENDING
  APPROVED
  DECLINED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

model User {
  id            String       @id @default(cuid())
  name          String
  email         String       @unique
  password      String       // bcrypt hashed
  role          Role         @default(EMPLOYEE)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  attendance    Attendance[]
  leaves        Leave[]
  createdTasks  Task[]       @relation("TaskCreator")
  assignedTasks Task[]       @relation("TaskAssignee")
  otpRecords    OtpRecord[]
}

model Attendance {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  checkIn   DateTime
  checkOut  DateTime?
  date      DateTime  @default(now())
  createdAt DateTime  @default(now())
}

model Leave {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  startDate DateTime
  endDate   DateTime
  reason    String
  status    LeaveStatus @default(PENDING)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  dueDate     DateTime
  status      TaskStatus @default(IN_PROGRESS)
  creatorId   String
  creator     User       @relation("TaskCreator", fields: [creatorId], references: [id])
  assigneeId  String?
  assignee    User?      @relation("TaskAssignee", fields: [assigneeId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model OtpRecord {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  otp       String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### Step 2.4 — Run Migration & Generate Client

```bash
# Applies schema to NeonDB and generates the Prisma client
npx prisma migrate dev --name init
```

> This also runs `prisma generate` automatically. The client is written to `app/generated/prisma/`.

### Step 2.5 — Create Prisma Client Singleton (Prisma v7 + pg adapter)

`lib/prisma.ts` (note: **flat path**, not `src/lib/prisma.ts`):

```typescript
import { PrismaClient } from "@/app/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"

// Create a pg Pool using the DATABASE_URL from environment
function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient>
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

> **Key differences from Prisma v5:**
> - Import from `@/app/generated/prisma` (not `@prisma/client`)
> - Must pass a **driver adapter** (`PrismaPg`) to `new PrismaClient()`
> - `DATABASE_URL` accessed via `process.env` at runtime (Next.js exposes it from `.env.local` or `.env`)


---

## Phase 3: Authentication & Authorization

### Step 3.1 — JWT Helpers

`src/lib/jwt.ts`:
- `signToken(payload)` — signs a JWT with `JWT_SECRET`
- `verifyToken(token)` — verifies and decodes a JWT
- Store the token in an **httpOnly cookie** (`access_token`) for security

### Step 3.2 — Password Hashing

`src/lib/auth.ts`:
- `hashPassword(plain)` — uses `bcryptjs.hash()` with salt rounds = 12
- `comparePassword(plain, hash)` — uses `bcryptjs.compare()`

### Step 3.3 — Route Protection Middleware

`src/middleware.ts`:
- Read `access_token` cookie on every request
- Verify JWT; redirect to `/login` if invalid
- Check user role for admin-only routes (`/admin/*`)
- Redirect authenticated users away from `/login` and `/register`

**Protected route matrix:**

| Route Pattern       | Allowed Roles       |
|---------------------|---------------------|
| `/employee/*`       | EMPLOYEE            |
| `/admin/*`          | ADMIN, HR           |
| `/api/attendance/*` | All authenticated   |
| `/api/leaves/*`     | All authenticated   |
| `/api/tasks/*`      | All authenticated   |
| `/api/password/*`   | All authenticated   |

### Step 3.4 — Auth API Routes

#### `POST /api/auth/register`
1. Validate request body with Zod (`name`, `email`, `password`, `role`)
2. Check if email already exists
3. Hash password with bcrypt
4. Create user in DB
5. Return `201` with sanitized user object (no password)

#### `POST /api/auth/login`
1. Validate `email` and `password`
2. Find user by email; return `401` if not found
3. Compare passwords; return `401` if mismatch
4. Sign JWT with `{ userId, email, role }`
5. Set `access_token` httpOnly cookie
6. Return `200` with user info

#### `POST /api/auth/logout`
1. Clear the `access_token` cookie
2. Return `200`

---

## Phase 4: API Routes — Core Backend

### Step 4.1 — Attendance API

#### `POST /api/attendance/checkin`
1. Extract `userId` from JWT
2. Verify no open check-in exists for today (no `checkOut` is null)
3. Create `Attendance` record with `checkIn = now()`
4. Return `201` with the attendance record

#### `POST /api/attendance/checkout`
1. Extract `userId` from JWT
2. Find the open attendance record (where `checkOut` is null)
3. Update `checkOut = now()`
4. Return `200` with updated record

#### `GET /api/attendance`
- **Employee:** Return own attendance records (filtered by `userId`)
- **Admin/HR:** Return all employee attendance records (join with User data)
- Accept optional query params: `?userId=&date=&startDate=&endDate=`

### Step 4.2 — Leave Management API

#### `POST /api/leaves`
1. Validate `startDate`, `endDate`, `reason`
2. Create `Leave` record with `status = PENDING`
3. Return `201`

#### `GET /api/leaves`
- **Employee:** Return own leave requests
- **Admin/HR:** Return all leave requests with employee details

#### `PATCH /api/leaves/[id]`
- **Admin/HR only:** Update `status` to `APPROVED` or `DECLINED`
- Verify route ownership/role before allowing update

#### `DELETE /api/leaves/[id]`
- **Employee:** Can delete own `PENDING` leave requests
- **Admin/HR:** Can delete any leave request

### Step 4.3 — Task Management API

#### `POST /api/tasks`
- **Employee:** Create task for themselves (`assigneeId = userId`, `status = IN_PROGRESS`)
- **Admin/HR:** Create and assign task to any employee (`status = TODO`)
- Validate `title`, `description`, `dueDate`, `assigneeId`

#### `GET /api/tasks`
- **Employee:** Return only tasks where `assigneeId = userId`
- **Admin/HR:** Return all tasks; support `?assigneeId=&status=` filters

#### `PATCH /api/tasks/[id]`
- **Employee:** Can update `status` of own tasks only (`IN_PROGRESS` → `DONE`)
- **Admin/HR:** Can update `status`, `assigneeId`, `title`, `description`, `dueDate`

#### `DELETE /api/tasks/[id]`
- **Admin/HR only:** Delete any task

---

## Phase 5: Frontend Pages & Components

### Step 5.1 — Design System

> Tailwind v4 CSS-first — tokens are already in `app/globals.css`. Extend the `@theme {}` block to add custom brand colors if needed.

- **Colors:** Extend `--color-success`, `--color-warning` etc. in `globals.css` under `@theme`
- **Typography:** Inter font is already loaded via `layout.tsx` (no Google Fonts CDN link needed)
- **shadcn/ui components:** Install via `npx shadcn@latest add <component>` — they go into `components/ui/`
- **Pre-installed:** `button.tsx` already exists; add more as needed (e.g., `card`, `dialog`, `badge`, `table`, `input`, `select`, `form`, `toast`)

### Step 5.2 — Shared Components

| Component                | Description                                                             |
|--------------------------|-------------------------------------------------------------------------|
| `<Navbar />`             | Logo, user info, logout button                                          |
| `<Sidebar />`            | Role-aware navigation links                                             |
| `<Toast />`              | Success/error notifications via `react-hot-toast` or shadcn `<Toaster>`|
| `<LoadingSpinner />`     | Full-page and inline loading states                                     |
| `<Modal />`              | Reusable modal (use shadcn `<Dialog>`)                                  |
| `<StatusBadge />`        | Colored badge for Leave/Task statuses (use shadcn `<Badge>`)            |
| `<DataTable />`          | Sortable, filterable table (use shadcn `<Table>`)                       |

### Step 5.3 — Auth Pages

#### `/login`
- Email + password form with validation
- Show error toast on failure
- Redirect to role-based dashboard on success

#### `/register`
- Name, email, password, confirm password, role selector
- Show success toast; redirect to login

### Step 5.4 — Employee Dashboard (`/employee`)

**Overview cards:**
- Today's check-in status
- Active tasks count
- Pending leave requests

**Sub-pages:**

| Page                    | Features                                                         |
|-------------------------|------------------------------------------------------------------|
| `/employee`             | Summary cards + recent activity feed                             |
| `/employee/attendance`  | Check-in/Check-out button (toggle based on state) + history table|
| `/employee/leaves`      | Submit leave form + personal leave request list with status       |
| `/employee/tasks`       | Task list with status columns + create task button               |

### Step 5.5 — Admin/HR Dashboard (`/admin`)

**Overview cards:**
- Total employees
- Today's present employees
- Pending leave requests
- Open tasks

**Sub-pages:**

| Page                    | Features                                                               |
|-------------------------|------------------------------------------------------------------------|
| `/admin`                | Analytics cards + recent activity                                      |
| `/admin/employees`      | Full employee list with details                                        |
| `/admin/attendance`     | All employee attendance; filter by user/date                           |
| `/admin/leaves`         | All leave requests; Approve/Decline buttons per row                    |
| `/admin/tasks`          | All tasks; filter by employee/status; assign/edit/delete               |

### Step 5.6 — Task Management UI

- **Kanban-style board** (optional): Three columns — To Do, In Progress, Done
- **List view** with filter dropdowns for employee and status
- Drag-and-drop cards (bonus, using `@dnd-kit/core`)

### Step 5.7 — Notifications

Use `react-hot-toast` for all key user actions:
- ✅ Login success / ❌ Login failed
- ✅ Check-in / Check-out recorded
- ✅ Leave request submitted
- ✅ Task created / updated
- ✅ Password changed
- ❌ Generic API error fallback

---

## Phase 6: Password Management (OTP)

### Step 6.1 — OTP Generation & Storage

`src/lib/otp.ts`:
- Generate 6-digit numeric OTP
- Store in `OtpRecord` table with `expiresAt = now() + 10 minutes`
- Mark `used = true` after consumption

### Step 6.2 — Send OTP API

#### `POST /api/password/send-otp`
1. Accept `email` in body
2. Find user by email; return `404` if not found
3. Generate OTP and save to `OtpRecord`
4. **Simple approach:** Return OTP in response (dev mode) — for production, send via email using `nodemailer`
5. Return `200`

### Step 6.3 — Reset Password API

#### `POST /api/password/reset`
1. Accept `email`, `otp`, `newPassword`
2. Find latest unused, non-expired OTP for the user
3. If invalid or expired, return `400`
4. Hash `newPassword` and update user record
5. Mark OTP as `used = true`
6. Return `200`

### Step 6.4 — Frontend Password Change Flow

1. User navigates to "Change Password" section in dashboard
2. Enters email → clicks "Send OTP"
3. Enters OTP + new password → clicks "Confirm"
4. Show success/error toast

---

## Phase 7: Bonus Features (Optional)

### Step 7.1 — Analytics Dashboard

- **Attendance Rate Chart:** Daily/weekly check-in counts using `recharts`
- **Leave Status Breakdown:** Pie chart of Pending/Approved/Declined
- **Task Completion Rate:** Bar chart of tasks by status
- **Admin-only** — shown as cards/charts in the admin overview page

### Step 7.2 — Role-based Middleware on API Routes

Create a helper `withAuth(handler, allowedRoles[])`:

```typescript
// Usage in route.ts
export const GET = withAuth(async (req, { userId, role }) => {
  // handler logic
}, ['ADMIN', 'HR'])
```

### Step 7.3 — Unit Tests

Use **Jest** + **@testing-library/react** for frontend, and **Jest** for API utilities:

| Test Target               | What to Test                                |
|---------------------------|---------------------------------------------|
| `lib/jwt.ts`              | Sign and verify token round-trip            |
| `lib/auth.ts`             | Hash and compare passwords                  |
| `lib/otp.ts`              | OTP generation uniqueness and expiry        |
| `api/auth/login`          | Valid and invalid login scenarios           |
| `api/tasks`               | CRUD operations with role enforcement       |
| `<LoginForm />`           | Form validation and submission              |

---

## Phase 8: Testing & Quality

### Step 8.1 — Manual Testing Checklist

- [ ] Register as Employee and Admin
- [ ] Login/Logout flow for both roles
- [ ] Employee: check-in, check-out, verify record
- [ ] Employee: submit leave request, view status
- [ ] Admin: approve/decline leave request
- [ ] Employee: create task, update status to Done
- [ ] Admin: assign task to employee, change status
- [ ] Password change with OTP flow
- [ ] Access `/admin/*` as Employee → should redirect
- [ ] Access `/employee/*` as Admin → should redirect

### Step 8.2 — Code Quality

- ESLint rules enforced (included with `create-next-app`)
- Consistent error handling with try/catch in all API routes
- Zod validation on all API inputs
- TypeScript strict mode enabled
- No `console.log` statements in production code

---

## Phase 9: Documentation & Submission

### Step 9.1 — Update README.md

The `README.md` should include:

1. **Project Overview** — what the system does
2. **Tech Stack** — Next.js, Prisma, NeonDB, JWT
3. **Getting Started:**
   ```bash
   git clone <repo-url>
   cd employee-management-system
   npm install
   # Set up .env.local (see .env.example)
   npx prisma migrate dev
   npm run dev
   ```
4. **Environment Variables** — table of all required vars
5. **API Reference** — table of all endpoints with method, path, auth, and description
6. **Default Credentials** — seed admin account details

### Step 9.2 — Seed Script (Optional but Recommended)

`prisma/seed.ts`:
- Create one Admin user and 2-3 Employee users with hashed passwords
- Add sample tasks, attendance, and leave records

```bash
npx prisma db seed
```

### Step 9.3 — GitHub Repository

1. Create a **public** GitHub repository
2. Add `.gitignore` (ensure `.env.local` is excluded)
3. Add `.env.example` with placeholder values
4. Push all code
5. Submit the repository link

---

## 📅 Suggested Development Timeline

| Phase | Task                                     | Estimated Time |
|-------|------------------------------------------|----------------|
| 1     | Project setup + folder structure         | 1–2 hours      |
| 2     | Database schema + Prisma migration       | 1–2 hours      |
| 3     | Auth APIs + JWT + middleware             | 2–3 hours      |
| 4     | Attendance, Leave, Task APIs             | 3–4 hours      |
| 5     | All frontend pages + components          | 5–7 hours      |
| 6     | OTP password management                  | 1–2 hours      |
| 7     | Bonus: analytics + tests                 | 2–4 hours      |
| 8     | Testing + bug fixes                      | 2–3 hours      |
| 9     | Docs + GitHub submission                 | 1 hour         |
| **—** | **Total**                                | **~18–28 hrs** |

---

## 🔑 Key Technical Decisions

| Decision                        | Rationale                                                                |
|---------------------------------|--------------------------------------------------------------------------|
| Next.js 16 App Router           | Unified frontend + API in one project; file-based routing with RSC       |
| shadcn/ui (radix-nova preset)   | Pre-built, accessible components; matches the b0 template style          |
| Tailwind CSS v4 (CSS-first)     | No config file; tokens in `globals.css`; `@theme` block for customization|
| `next-themes` + ThemeProvider   | System-aware dark/light mode; already wired in `layout.tsx`             |
| Prisma + NeonDB                 | Type-safe ORM with serverless-optimized PostgreSQL                       |
| JWT in httpOnly cookies         | More secure than localStorage; prevents XSS token theft                  |
| Zod for API validation          | Runtime type safety with great TypeScript integration                    |
| bcrypt (salt rounds = 12)       | Industry-standard password hashing with good cost factor                 |
| `react-hot-toast`               | Lightweight toast notifications (or shadcn Sonner)                       |
| Role middleware on API routes   | Centralized, reusable authorization enforcement                          |
| Turbopack (`next dev`)          | Faster dev server HMR; already configured in `package.json`              |

---

*Plan created: 2026-04-22 · Updated: 2026-04-22 (workspace inspected — `npx shadcn@latest init --preset b0 --template next`) · Based on Next.js Full Stack Developer Assessment requirements*
