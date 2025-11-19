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

## 👤 User management & permissions

- **Roles**
  - `superadmin`: unrestricted access, can assign any role or permission.
  - `admin`: full CRUD on dashboard modules (no system settings yet).
  - `user`: read-only defaults (dashboard, KPIs, read-only module access).
- **Permission groups** (grant whatever the role does not already provide):
  - Dashboard & KPIs (`dashboard:view`, `kpis:view`)
  - Users (`users:create|read|update|delete`)
  - Assets (`assets:create|read|update|delete`)
  - Live feed, Decommissioning, Reports (read/update/export as applicable)
- **Invitation workflow**
  1. Go to **Dashboard → Users → Add User**.
  2. Provide email, optional display name, choose role & fine-grained permissions.
  3. Leave “Send invitation email” enabled to email the invite token. Invites land on `/auth/accept-invite`, where users set their password before first login.
  4. You can resend or cancel invites from the edit form or directly inside the users table whenever `status = invited`.
  5. Once the user accepts the invite, their status flips to `active` automatically.

All new API endpoints (`/api/users`, `/api/users/[id]`, `/api/users/stats`, `/api/users/permissions`) enforce Better Auth sessions plus the relevant `users:*` permission.

## 🗃️ Database & seeding

1. Set `DATABASE_URL` in your environment (e.g. `.env.local`).
2. Apply the new roles/permissions migration:
   ```sh
   pnpm db:push
   ```
3. Seed or update the super admin (grants every permission):
   ```sh
   pnpm db:seed:superadmin
   ```

The seeder will create/update the user defined in `scripts/seed-superadmin.ts`, ensure they are `superadmin`, verified, and provision a credential login.

## ✅ Manual verification checklist

- Invite a user via `/dashboard/users/new`, confirm a row with `status=invited` appears and `/api/users` responds with the new entry.
- Edit a user to change role and fine-grained permissions; ensure the UI reflects the updated badges in the table.
- Resend an invitation from the edit form and observe the console log of the refreshed token (until email delivery is wired up).
- Use the “Resend” chip in the users table to verify pending invites can be re-sent without opening the detail page.
- Follow an invitation link, ensure `/auth/accept-invite` loads the recipient info, set a password, and confirm the user is activated afterwards.
- Delete a user from the table actions and confirm the entry disappears (Better Auth cascades accounts/sessions).
- Review the KPI cards—counts for invited/active/admin seats should update after the above actions.

## 🛠️ Tech Stack

- **Next.js 16** - React framework
- **Better Auth** - Authentication
- **Drizzle ORM** - Database layer
- **shadcn/ui** - UI components
- **TypeScript** - Type safety

---

Made with ❤️ by [Achour Meguenni](https://github.com/Achour)
