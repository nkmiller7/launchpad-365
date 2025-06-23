"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { UserCircle } from "lucide-react"
import { signOut } from "@/src/components/templates/_utils/actions"

interface HeaderProps {
  user: User | null
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-inherit">
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Launchpad 365</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">

            <Link
              href="/test"
              className={`text-sm transition-color ${
                pathname === "/test" ? "opacity-75" : "opacity-50"
              }`}
            >
              Start Here
            </Link>

          </nav>
        </div>

        <div className="flex items-center space-x-4">

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <UserCircle />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 !bg-[var(--accent)] border-0">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}