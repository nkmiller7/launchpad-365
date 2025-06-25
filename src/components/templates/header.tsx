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
              </DropdownMenuTrigger>              <DropdownMenuContent
                align="end"
                className="w-64 bg-white border border-gray-200 shadow-lg rounded-lg p-2"
              >
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500">Signed in</p>
                </div>
                <DropdownMenuItem asChild className="mt-1">
                  <Link 
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors cursor-pointer w-full" 
                    href="/profile"
                  >
                    <UserCircle className="h-4 w-4 mr-2 text-gray-500" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors cursor-pointer mt-1" 
                  onClick={handleSignOut}
                >
                  <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
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