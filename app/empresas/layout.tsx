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
    LayoutDashboard, Briefcase, Users, Plus, Play,
    Settings, LogOut, Building2, Zap, HelpCircle,
    ChevronRight, Menu, X
} from "lucide-react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Loader2 } from "lucide-react"

const NAV_ITEMS = [
    { name: "Dashboard", href: "/empresas/dashboard", icon: LayoutDashboard },
    { name: "Publicar Empleo", href: "/empresas/vacantes/nueva", icon: Plus },
    { name: "Mis Vacantes", href: "/empresas/mis-publicaciones", icon: Briefcase },
    { name: "Candidatos", href: "/empresas/candidatos", icon: Users },
    { name: "Entrevistas IA", href: "/empresas/entrevistas", icon: Play },
]

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
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed inset-y-0 z-50">
                {/* Logo */}
                <div className="p-6 pb-4">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#1890ff] flex items-center justify-center shadow-lg shadow-[#1890ff]/20">
                            <span className="text-white font-bold text-lg">R</span>
                        </div>
                        <span className="font-bold text-xl text-slate-900">
                            Re<span className="text-[#1890ff]">clut</span>
                        </span>
                    </Link>
                    <div className="mt-2 px-0.5">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Empresa</span>
                    </div>
                </div>

                {/* Company Info */}
                <div className="mx-4 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1890ff] to-blue-600 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-semibold text-slate-900 truncate">{companyName}</p>
                            <p className="text-xs text-slate-500">{plan}</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-0.5">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? "text-[#1890ff] bg-blue-50 border-l-2 border-[#1890ff]"
                                        : "text-slate-600 hover:text-[#1890ff] hover:bg-slate-50 group"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "text-[#1890ff]" : "text-slate-400 group-hover:text-[#1890ff]"} transition-colors`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* Plan CTA */}
                <div className="mx-4 mb-3">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-[#1890ff]">{plan}</p>
                            <span className="text-[10px] bg-white text-[#1890ff] px-2 py-0.5 rounded-full border border-blue-100 font-semibold">Básico</span>
                        </div>
                        <div className="mb-3">
                            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                                <span>Vacantes</span>
                                <span>{activeJobs}/3</span>
                            </div>
                            <div className="w-full bg-white rounded-full h-1.5">
                                <div className="bg-[#1890ff] h-1.5 rounded-full transition-all" style={{ width: `${(activeJobs / 3) * 100}%` }} />
                            </div>
                        </div>
                        <Link href="/empresas/planes">
                            <Button size="sm" className="w-full bg-[#1890ff] hover:bg-blue-600 text-white text-xs h-8 rounded-lg font-semibold shadow-sm">
                                <Zap className="w-3 h-3 mr-1.5" />
                                Mejorar Plan
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Bottom - Settings & Logout */}
                <div className="p-3 border-t border-slate-100 space-y-0.5">
                    <Link
                        href="/empresas/configuracion"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === '/empresas/configuracion' ? 'text-[#1890ff] bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <Settings className="w-5 h-5 text-slate-400" />
                        Configuración
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all text-left"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

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
                        {NAV_ITEMS.map((item) => (
                            <Link key={item.href} href={item.href} onClick={() => setMobileMenu(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                                <item.icon className="w-5 h-5 text-slate-400" /> {item.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content area with top bar */}
            <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
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
