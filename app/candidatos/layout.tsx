import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Briefcase, User, FileText, Bell } from "lucide-react"

export default function CandidatosLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                            <span className="text-white font-bold">T</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">TalentAI Pro</span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/empleos"
                            className="flex items-center gap-2 transition-colors hover:text-blue-600"
                        >
                            <Briefcase className="h-4 w-4" />
                            Buscar Empleos
                        </Link>
                        <Link
                            href="/candidatos/aplicaciones"
                            className="flex items-center gap-2 transition-colors hover:text-blue-600"
                        >
                            <FileText className="h-4 w-4" />
                            Mis Aplicaciones
                        </Link>
                        <Link
                            href="/candidatos/perfil"
                            className="flex items-center gap-2 transition-colors hover:text-blue-600"
                        >
                            <User className="h-4 w-4" />
                            Mi Perfil
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                        </Button>
                        <Avatar className="h-8 w-8 cursor-pointer">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Usuario" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}
