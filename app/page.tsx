import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  IconChevronRight,
  IconLockSquareRoundedFilled,
  IconShieldCheckFilled,
} from "@tabler/icons-react";

export default async function page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="border-b">
        <div className="container  flex h-16 items-center justify-between">
          <div className="flex items-center ">
            {/* <Lock size={24} className="text-primary" /> */}
            <span className="font-bold text-xl">RAMS</span>
          </div>
          <nav className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ModeToggle />
              {session?.user ? (
                <a href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </a>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth/forgot-password">
                    <Button size="sm" variant="ghost">
                      Forgot password
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-20">
        <div className="container flex flex-col items-center text-center gap-6">
          <IconShieldCheckFilled size={64} className="text-primary" />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            RAMS Asset Management
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Comprehensive asset management solution for tracking, managing, and optimizing your organization's resources.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/auth/login">
              <Button size="lg" className="gap-2">
                Log in <IconChevronRight size={18} />
              </Button>
            </Link>
            <Link href="/auth/forgot-password">
              <Button size="lg" variant="outline">
                Forgot password
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA section */}

      {/* Footer */}
      <footer className="border-t py-10 mt-auto">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <IconLockSquareRoundedFilled size={20} className="text-primary" />
            <span className="font-bold">RAMS Asset Management</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} RAMS Asset Management System
          </div>
        </div>
      </footer>
    </div>
  );
}
