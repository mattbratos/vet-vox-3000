# VetVox 3000 🐾


> 🚀 An 8-hour demo project showcasing modern web development skills with Next.js 15, TypeScript, and Prisma. Built as a recruitment task to demonstrate proficiency in full-stack development.

## Project Overview

This is a demo veterinary management system that demonstrates my ability to:
- Build full-stack applications with modern TypeScript and Next.js
- Design and implement database schemas with Prisma
- Create beautiful, responsive UIs with Shadcn/UI and Tailwind
- Integrate AI capabilities with OpenAI
- Follow best practices and write clean, maintainable code

⏱️ **Build Time**: Approximately 8h hours from concept to deployment

## Key Features

- 🏥 Basic Veterinary Visit Management
- 👩‍⚕️ Demo Veterinarian Profiles
- 🐕 Sample Patient Records
- 💊 Medication Tracking Demo
- 📝 Visit Notes System
- 🎨 Modern UI with Shadcn/UI Components
- 🌙 Dark/Light Mode Support

## Tech Stack Showcase

- **Framework**: Next.js 15 (App Router) for modern React development
- **Language**: TypeScript for type safety and better DX
- **Database**: PostgreSQL with Prisma ORM for type-safe queries
- **UI**: Shadcn UI + Radix UI for accessible components
- **Styling**: Tailwind CSS for rapid UI development
- **Architecture**: React Server Components + nuqs for optimal performance
- **AI**: OpenAI API integration example
- **Deployment**: Vercel

## Quick Start

1. Clone and install:
   ```bash
   git clone <repository-url>
   cd vet-vox-3000
   pnpm install
   ```

2. Set up environment:
   ```bash
   cp .env.example .env
   ```
   Add your:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`

3. Initialize database:
   ```bash
   pnpm prisma db push
   pnpm prisma generate
   pnpm seed
   ```

4. Run it:
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000` to explore the demo.

## Project Structure

```
├── app/                # Next.js app router pages
├── components/         # React components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── prisma/            # Database schema
└── public/            # Static assets
```

## Demo Data Model

Simple PostgreSQL schema demonstrating data modeling skills:
- `Visit`: Example model for vet visits with patient details and notes

## Development Commands

- `pnpm dev`: Run with Turbopack
- `pnpm build`: Production build
- `pnpm start`: Serve production build
- `pnpm lint`: Run ESLint
- `pnpm seed`: Add demo data

## Technical Highlights

- ⚡ React Server Components (RSC) for optimal performance
- 📱 Responsive design with Tailwind CSS
- 🔒 Type-safe with TypeScript
- 📊 Core Web Vitals optimization
- 🛡️ Error boundaries and loading states

## Note

This is a demonstration project built in a limited timeframe to showcase development capabilities. While it implements core features and follows best practices, it's intended as a technical demonstration rather than a production system.

## License

MIT License - feel free to use this code for learning or inspiration!
