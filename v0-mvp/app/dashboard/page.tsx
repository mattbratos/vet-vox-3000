import { ThemeToggle } from "@/components/ThemeToggle"

export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <ThemeToggle />
      </div>
      <p className="text-muted-foreground">
        Welcome to your Smart Voice Notes dashboard. Use the sidebar to navigate between different sections.
      </p>
    </div>
  )
}

