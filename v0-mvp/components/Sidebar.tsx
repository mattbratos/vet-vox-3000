"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Mic, FileText, User, Menu, LogIn, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSession, signIn, signOut } from "next-auth/react"

const sidebarItems = [
  { icon: Mic, label: "Record", href: "/dashboard/record" },
  { icon: FileText, label: "Notes", href: "/dashboard/notes" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()

  const SidebarContent = () => (
    <div className="flex h-full flex-col space-y-4 py-4">
      {sidebarItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
          )}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      ))}
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="w-full justify-start px-4"
      >
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </Button>
      {session ? (
        <Button variant="ghost" size="sm" onClick={() => signOut()} className="w-full justify-start px-4">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => signIn()} className="w-full justify-start px-4">
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      )}
    </div>
  )

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>
      <div className="hidden h-screen w-64 flex-col md:flex">
        <SidebarContent />
      </div>
    </>
  )
}

