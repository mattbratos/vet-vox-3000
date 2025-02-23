"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Sign In to Smart Voice Notes</h1>
        <Button onClick={() => signIn("github", { callbackUrl: "/dashboard" })}>Sign in with GitHub</Button>
      </div>
    </div>
  )
}

