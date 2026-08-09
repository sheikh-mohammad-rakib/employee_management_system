# 🏢 Employee Management System

A full-stack **Employee Management System** built with **Next.js 16**, **Prisma 7**, **PostgreSQL (NeonDB)**, **Tailwind CSS v4**, and **Custom LLMs**. This application provides a complete suite of tools for managing employees, tracking attendance, handling leave requests, and assigning tasks — all enhanced by AI capabilities and protected by role-based access control.

---

## 🌟 Features

### ✨ AI-Powered Features
- **AI Copilot:** A floating chat assistant available across the dashboard for instant help.
- **AI Task Generation:** Automatically generate detailed task descriptions from a short title.
- **AI Leave Request Polisher:** Enhances and professionalizes employee leave reasons before submission.
- **AI Leave Risk Assessment:** Analyzes leave patterns to alert HR/Admin of potential scheduling conflicts.
- **AI Weekly Standup Report:** Generates a weekly summary of tasks and attendance for employees.
- **AI Executive Team Digest:** Summarizes team activities and overall progress for Admins.

### 🔐 Authentication & Security
- **JWT-based authentication** with secure HTTP-only cookies
- **bcrypt password hashing** for secure credential storage
- **OTP-based** password reset via email (Nodemailer)
- Role-based route protection via Next.js Middleware

### 👥 Role-Based Access Control
Three distinct roles with tailored dashboards:
| Role | Capabilities |
|------|-------------|
| **Admin** | Full system access — manage employees, approve leaves, assign tasks, view all attendance |
| **HR** | Manage employees and leaves |
| **Employee** | Check in/out, apply for leave, view assigned tasks, change password |

### 📅 Attendance Tracking
- Employees can **check in** and **check out** with timestamps
- Admin can view **all employee attendance records**
- Daily attendance history with date-based filtering

### 🏖️ Leave Management
- Employees submit **leave requests** with start/end dates and reason
- Admin/HR can **approve or decline** requests
- Status tracking: `PENDING`, `APPROVED`, `DECLINED`

### ✅ Task Management
- Admin can **create and assign tasks** to employees
- Employees can **update task status**: `TODO` → `IN_PROGRESS` → `DONE`
- Tasks include title, description, and due date

### 🔑 Password Management
- Employees can **change their own password** from the dashboard
- Secure OTP-based **forgot password** flow via email

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) with Turbopack |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL via [Neon](https://neon.tech/) (Serverless) |
| **ORM** | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg` |
| **AI Inference**| Custom LLM via `openai` library (Custom Base URL) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + `tw-animate-css` |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **Auth** | [jose](https://github.com/panva/jose) (JWT) + bcryptjs |
| **Email** | [Nodemailer](https://nodemailer.com/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Analytics** | [Vercel Analytics](https://vercel.com/analytics) |

---

## 📁 Project Structure

```
employee-management-system/
├── app/
│   ├── (auth)/                  # Public auth pages
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── admin/               # Admin-only pages
│   │   │   ├── attendance/      # View all attendance
│   │   │   ├── employees/       # Manage employees
│   │   │   ├── leaves/          # Approve/decline leave requests
│   │   │   └── tasks/           # Create and assign tasks
│   │   └── employee/            # Employee-only pages
│   │       ├── attendance/      # Check in/out
│   │       ├── change-password/ # Change password
│   │       ├── leaves/          # Apply for leave
│   │       └── tasks/           # View assigned tasks
│   └── api/                     # REST API routes
│       ├── ai/                  # Custom LLM integration routes
│       ├── auth/                # Login, register, logout
│       ├── attendance/          # Attendance endpoints
│       ├── leaves/              # Leave request endpoints
│       ├── password/            # Password reset (OTP)
│       ├── tasks/               # Task endpoints
│       └── users/               # User management endpoints
├── components/
│   ├── shared/                  # Shared layout components (AI tools, Copilot)
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── auth.ts                  # Auth helpers & session utils
│   ├── github-ai.ts             # Custom LLM inference wrapper
│   ├── jwt.ts                   # JWT sign/verify helpers
│   ├── otp.ts                   # OTP generation utilities
│   ├── prisma.ts                # Prisma client singleton
│   └── utils.ts                 # Utility functions
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Migration history
├── types/                       # Global TypeScript types
└── hooks/                       # Custom React hooks
```

---

## 🗄️ Database Schema

Built with Prisma and PostgreSQL (Neon), the schema includes:

- **User** — name, email, bcrypt-hashed password, role (`ADMIN` | `HR` | `EMPLOYEE`)
- **Attendance** — check-in/check-out timestamps, linked to User
- **Leave** — start/end dates, reason, status (`PENDING` | `APPROVED` | `DECLINED`)
- **Task** — title, description, due date, status (`TODO` | `IN_PROGRESS` | `DONE`), creator & assignee
- **OtpRecord** — OTP code, expiry, used flag for password reset flow

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Neon](https://neon.tech/) PostgreSQL database (free tier works)
- An SMTP email account (e.g., Gmail) for OTP emails
- An API Key and Base URL for Custom LLM Inference (using the `openai` library)

### 1. Clone the repository

```bash
git clone https://github.com/sheikh-mohammad-rakib/employee_management_system.git
cd employee-management-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Email (for OTP / password reset)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# AI Inference (OpenAI-compatible Custom LLM)
AI_API_KEY="your_custom_llm_api_key_here"
AI_BASE_URL="https://api.your-custom-llm.com/v1"
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |

---

## 🌐 Deployment

This project is optimized for deployment on **[Vercel](https://vercel.com/)**:

1. Push your code to GitHub
2. Import the repository on Vercel
3. Set all environment variables from `.env.local` in the Vercel project settings
4. Deploy — Vercel auto-detects Next.js and configures the build

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/sheikh-mohammad-rakib/employee-management-system/issues).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Sheikh Mohammad Rakib**

- GitHub: [@sheikh-mohammad-rakib](https://github.com/sheikh-mohammad-rakib)

---

<p align="center">Built with ❤️ using Next.js, Prisma, Neon & Custom LLMs</p>
