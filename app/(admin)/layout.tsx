import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-slate-950 text-white">
                <div className="flex h-16 items-center px-4 container mx-auto">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-8">
                        <span className="text-white">
                            TalentAI
                        </span>
                        <span className="text-red-400 text-xs uppercase tracking-widest border border-red-400 px-1 rounded">Admin</span>
                    </Link>
                    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
                        <Link
                            href="/admin"
                            className="text-sm font-medium transition-colors hover:text-red-400"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/admin/users"
                            className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
                        >
                            Users
                        </Link>
                        <Link
                            href="/admin/settings"
                            className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
                        >
                            Settings
                        </Link>
                    </nav>
                    <div className="ml-auto flex items-center space-x-4">
                        <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">Logout</Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 container mx-auto py-6">
                {children}
            </main>
        </div>
    )
}
