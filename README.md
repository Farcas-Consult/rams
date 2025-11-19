# Next.js + Better Auth + Drizzle Starter Kit

🚀 A starter kit for building modern web applications with **Next.js 16**, **Better Auth**, **Drizzle ORM**, and **shadcn/ui**.

🔗 **[Live Demo](https://auth.achour.dev/)**

<a href="https://www.buymeacoffee.com/achour" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📌 Features

- ✅ **Next.js 16** with App Router
- ✅ **Better Auth** for authentication
- ✅ **Drizzle ORM** + **PostgreSQL**
- ✅ **shadcn/ui** for UI components
- ✅ **Dashboard** for authenticated users
- ✅ TypeScript support

## 📦 Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Achour/nextjs-better-auth.git
   cd nextjs-better-auth
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables:

   ```sh
   cp .env.example .env
   ```

   Minimum variables required:

   ```
   DATABASE_URL=postgres://...
   BETTER_AUTH_SECRET=your-generated-secret
   BETTER_AUTH_URL=http://localhost:3000
   RESEND_API_KEY=your-resend-key
   RESEND_FROM_EMAIL="RAMS <no-reply@yourdomain.com>"
   ```

   `RESEND_FROM_EMAIL` must be a verified sender/domain inside your [Resend](https://resend.com) account. When either the API key or sender address is missing, the app will log password reset links to the console for local development.

4. Set up the database (applies pending schema to your database):

   ```sh
   npm run db:push
   ```

5. Start the development server:
   ```sh
   npm run dev
   ```

## 🚀 Usage

- `npm run dev` — start the development server
- `npm run db:generate` — generate SQL migrations from the Drizzle schema
- `npm run db:push` — push schema changes to the database
- `npm run db:migrate` — run generated migrations
- Customize authentication using Better Auth settings.

## 🛠️ Tech Stack

- **Next.js 16** - React framework
- **Better Auth** - Authentication
- **Drizzle ORM** - Database layer
- **shadcn/ui** - UI components
- **TypeScript** - Type safety

---

Made with ❤️ by [Achour Meguenni](https://github.com/Achour)
