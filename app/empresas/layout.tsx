"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, Briefcase, Users, Settings, Bell } from "lucide-react"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export default function EmpresasLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [isLoading, setIsLoading] = useState(true)
    const [companyName, setCompanyName] = useState("Empresa")

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/login')
                return
            }

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid))
                if (userDoc.exists()) {
                    const data = userDoc.data()
                    setCompanyName(data.companyName || "Empresa")

                    // Check if onboarding is completed
                    if (!data.onboardingCompleted && pathname !== '/empresas/perfil/completar') {
                        router.push('/empresas/perfil/completar')
                    }
                }
            } catch (error) {
                console.error("Error checking onboarding:", error)
            } finally {
                setIsLoading(false)
            }
        })

        return () => unsubscribe()
    }, [pathname, router])

    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false) // Scrolling down
            } else {
                setIsVisible(true) // Scrolling up
            }
            setLastScrollY(currentScrollY)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [lastScrollY])

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
    }

    return (
        <div className="flex min-h-screen flex-col">
            {/* Mobile Header */}
            <div className={`fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 lg:hidden transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="flex items-center justify-between px-4 h-16">
                    <Link href="/empresas/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#1890ff] flex items-center justify-center text-white font-bold">
                            R
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            <span className="text-[#1890ff]">Re</span>
                            <span className="text-gray-900">clu</span>
                        </span>
                    </Link>
                    <Button variant="ghost" size="icon">
                        <Users className="h-6 w-6" />
                    </Button>
                </div>
            </div>
            <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'} hidden lg:block`}>
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/empresas/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#1890ff] flex items-center justify-center text-white font-bold text-xl">
                            R
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            <span className="text-[#1890ff]">Re</span>
                            <span className="text-gray-900">clu</span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/empresas/dashboard"
                            className="flex items-center gap-2 transition-colors hover:text-orange-600"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link
                            href="/empresas/mis-publicaciones"
                            className="flex items-center gap-2 transition-colors hover:text-orange-600"
                        >
                            <Briefcase className="h-4 w-4" />
                            Mis Publicaciones
                        </Link>
                        <Link
                            href="/empresas/candidatos"
                            className="flex items-center gap-2 transition-colors hover:text-orange-600"
                        >
                            <Users className="h-4 w-4" />
                            Candidatos
                        </Link>
                        <Link
                            href="/empresas/configuracion"
                            className="flex items-center gap-2 transition-colors hover:text-orange-600"
                        >
                            <Settings className="h-4 w-4" />
                            Configuración
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 cursor-pointer">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${companyName}`} />
                                <AvatarFallback>{companyName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block text-sm">
                                <p className="font-medium">{companyName}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}
