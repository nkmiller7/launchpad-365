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
            {/* Microsoft logo SVG */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="1" y="1" width="12" height="12" fill="#F25022" />
              <rect x="15" y="1" width="12" height="12" fill="#7FBA00" />
              <rect x="1" y="15" width="12" height="12" fill="#00A4EF" />
              <rect x="15" y="15" width="12" height="12" fill="#FFB900" />
            </svg>
            <span className="text-xl font-bold">Launchpad 365</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href={user ? "/dashboard" : "/login"}
              className={`text-sm transition-color ${
                (user && pathname === "/dashboard") ||
                (!user && pathname === "/login")
                  ? "opacity-75"
                  : "opacity-50"
              }`}
            >
              My Dashboard
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
              <DropdownMenuContent
                align="end"
                className="w-56 !bg-[var(--accent)] border-0"
              >
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