import { Button } from "@/components/ui/button"
import Link from "next/link"
// UserNav import removed - using placeholder


export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b">
                <div className="flex h-16 items-center px-4 container mx-auto">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-8">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Reclu
                        </span>
                        <span className="text-slate-800">Candidate</span>
                    </Link>
                    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
                        <Link
                            href="/candidate"
                            className="text-sm font-medium transition-colors hover:text-primary"
                        >
                            Overview
                        </Link>
                        <Link
                            href="/candidate/applications"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            My Applications
                        </Link>
                        <Link
                            href="/candidate/profile"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            Profile
                        </Link>
                    </nav>
                    <div className="ml-auto flex items-center space-x-4">
                        {/* User Profile placeholder */}
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">JD</div>
                    </div>
                </div>
            </header>
            <main className="flex-1 container mx-auto py-6">
                {children}
            </main>
        </div>
    )
}
