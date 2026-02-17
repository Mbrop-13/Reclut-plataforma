"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard, Briefcase, Users, Play,
    Settings, LogOut, Building2, Zap, ChevronRight, ChevronLeft
} from "lucide-react"

const NAV_ITEMS = [
    { name: "Dashboard", href: "/empresas/dashboard", icon: LayoutDashboard },
    { name: "Mis Publicaciones", href: "/empresas/mis-publicaciones", icon: Briefcase },
    { name: "Candidatos", href: "/empresas/candidatos", icon: Users },
    { name: "Entrevistas IA", href: "/empresas/entrevistas", icon: Play },
]

interface SidebarProps {
    isCollapsed: boolean
    toggleSidebar: () => void
    companyName: string
    plan: string
    activeJobs: number
    onSignOut: () => void
}

export function Sidebar({
    isCollapsed,
    toggleSidebar,
    companyName,
    plan,
    activeJobs,
    onSignOut
}: SidebarProps) {
    const pathname = usePathname()

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 256 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="bg-white border-r border-slate-200 hidden md:flex flex-col fixed inset-y-0 z-50 overflow-hidden"
        >
            {/* Logo & Toggle */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center p-4' : 'justify-between p-6 pb-4'}`}>
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#1890ff] flex items-center justify-center shadow-lg shadow-[#1890ff]/20 shrink-0">
                        <span className="text-white font-bold text-lg">R</span>
                    </div>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold text-xl text-slate-900 whitespace-nowrap"
                        >
                            Re<span className="text-[#1890ff]">clut</span>
                        </motion.span>
                    )}
                </Link>
                {!isCollapsed && (
                    <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isCollapsed && (
                <div className="flex justify-center mb-4">
                    <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {!isCollapsed && (
                <div className="px-6 pb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Empresa</span>
                </div>
            )}

            {/* Company Info */}
            {!isCollapsed ? (
                <div className="mx-4 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100 whitespace-nowrap overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1890ff] to-blue-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-semibold text-slate-900 truncate">{companyName}</p>
                            <p className="text-xs text-slate-500 truncate">{plan}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mx-auto mb-4 w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#1890ff]" />
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'} py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive
                                ? "text-[#1890ff] bg-blue-50"
                                : "text-slate-600 hover:text-[#1890ff] hover:bg-slate-50"
                                }`}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[#1890ff]" : "text-slate-400 group-hover:text-[#1890ff]"} transition-colors`} />
                            {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Plan CTA */}
            {!isCollapsed ? (
                <div className="mx-4 mb-3">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-[#1890ff]">{plan}</p>
                            <span className="text-[10px] bg-white text-[#1890ff] px-2 py-0.5 rounded-full border border-blue-100 font-semibold">Básico</span>
                        </div>
                        <div className="mb-3">
                            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                                <span>Publicaciones</span>
                                <span>{activeJobs}/3</span>
                            </div>
                            <div className="w-full bg-white rounded-full h-1.5">
                                <div className="bg-[#1890ff] h-1.5 rounded-full transition-all" style={{ width: `${Math.min((activeJobs / 3) * 100, 100)}%` }} />
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
            ) : (
                <div className="mx-3 mb-3 flex justify-center">
                    <Link href="/empresas/planes">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors">
                            <Zap className="w-5 h-5 text-[#1890ff]" />
                        </div>
                    </Link>
                </div>
            )}

            {/* Bottom - Settings & Logout */}
            <div className="p-3 border-t border-slate-100 space-y-0.5">
                <Link
                    href="/empresas/configuracion"
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-3 gap-3'} py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === '/empresas/configuracion' ? 'text-[#1890ff] bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    title={isCollapsed ? "Configuración" : undefined}
                >
                    <Settings className="w-5 h-5 text-slate-400 shrink-0" />
                    {!isCollapsed && <span>Configuración</span>}
                </Link>
                <button
                    onClick={onSignOut}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-3 gap-3'} py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all text-left`}
                    title={isCollapsed ? "Cerrar Sesión" : undefined}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>Cerrar Sesión</span>}
                </button>
            </div>
        </motion.aside>
    )
}
