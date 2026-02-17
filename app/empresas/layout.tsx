"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    HelpCircle, ChevronRight, Menu, X,
    LayoutDashboard, Briefcase, Users, Play,
    Settings, LogOut, Building2, Zap
} from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Loader2 } from "lucide-react"



export default function EmpresasLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [isLoading, setIsLoading] = useState(true)
    const [companyName, setCompanyName] = useState("Empresa")
    const [companyEmail, setCompanyEmail] = useState("")
    const [plan, setPlan] = useState("Plan Gratuito")
    const [activeJobs, setActiveJobs] = useState(0)
    const [mobileMenu, setMobileMenu] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)

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
                    setCompanyEmail(user.email || "")
                    setPlan(data.plan || "Plan Gratuito")
                    if (!data.onboardingCompleted && pathname !== '/empresas/perfil/completar') {
                        router.push('/empresas/perfil/completar')
                    }
                }
            } catch (error) {
                console.error("Error:", error)
            } finally {
                setIsLoading(false)
            }
        })
        return () => unsubscribe()
    }, [pathname, router])

    const handleSignOut = async () => {
        await signOut(auth)
        router.push("/")
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-[#1890ff]" /></div>
    }

    const initials = companyName.substring(0, 2).toUpperCase()

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Desktop Sidebar */}
            {/* Desktop Sidebar */}
            <Sidebar
                isCollapsed={isCollapsed}
                toggleSidebar={() => setIsCollapsed(!isCollapsed)}
                companyName={companyName}
                plan={plan}
                activeJobs={activeJobs}
                onSignOut={handleSignOut}
            />

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
                <div className="flex items-center justify-between px-4 h-16">
                    <Link href="/empresas/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#1890ff] flex items-center justify-center text-white font-bold">R</div>
                        <span className="text-lg font-bold">Re<span className="text-[#1890ff]">clut</span></span>
                    </Link>
                    <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
                        {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
                {mobileMenu && (
                    <div className="px-4 py-3 border-t border-slate-100 bg-white space-y-1">
                        {/* Mobile Logic needs update but reducing scope */}
                        {/* Re-implementing NAV_ITEMS logic inside map since I removed the constant */}
                        {[
                            { name: "Dashboard", href: "/empresas/dashboard", icon: LayoutDashboard },
                            { name: "Mis Publicaciones", href: "/empresas/mis-publicaciones", icon: Briefcase },
                            { name: "Candidatos", href: "/empresas/candidatos", icon: Users },
                            { name: "Entrevistas IA", href: "/empresas/entrevistas", icon: Play },
                        ].map((item) => (
                            <Link key={item.href} href={item.href} onClick={() => setMobileMenu(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                                <item.icon className="w-5 h-5 text-slate-400" /> {item.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content area with top bar */}
            <div className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                {/* Top bar with profile dropdown */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 hidden md:block">
                    <div className="flex items-center justify-end h-16 px-8">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none">
                                    <div className="text-right hidden lg:block">
                                        <p className="text-sm font-semibold text-slate-900">{companyName}</p>
                                        <p className="text-xs text-slate-500">{plan}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1890ff] to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                        {initials}
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 rounded-xl shadow-xl border-slate-200/80 mt-2" align="end" forceMount>
                                <DropdownMenuLabel className="px-4 py-3">
                                    <p className="text-sm font-semibold text-slate-900">{companyName}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{companyEmail}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push("/empresas/configuracion")} className="px-4 py-2.5 cursor-pointer">
                                    <Building2 className="mr-3 h-4 w-4 text-slate-400" />
                                    Perfil de Empresa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push("/empresas/configuracion")} className="px-4 py-2.5 cursor-pointer">
                                    <Settings className="mr-3 h-4 w-4 text-slate-400" />
                                    Configuración
                                </DropdownMenuItem>
                                <DropdownMenuItem className="px-4 py-2.5 cursor-pointer" disabled>
                                    <HelpCircle className="mr-3 h-4 w-4 text-slate-400" />
                                    Soporte (Próximamente)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut} className="px-4 py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                    <LogOut className="mr-3 h-4 w-4" />
                                    Cerrar Sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 mt-16 md:mt-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
