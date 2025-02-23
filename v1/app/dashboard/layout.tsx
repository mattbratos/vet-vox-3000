import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="border-b">
          <div className="p-4">
            <SidebarTrigger />
          </div>
        </header>

        {/* Main content */}
        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
