"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    Home, Briefcase, FileText, Play, User, Settings, LogOut,
    TrendingUp, Eye, Clock, CheckCircle2, ChevronRight
} from "lucide-react"

const NAV_ITEMS = [
    { icon: Home, label: "Inicio", href: "/candidatos", active: true },
    { icon: Briefcase, label: "Buscar Empleos", href: "/empleos" },
    { icon: FileText, label: "Mis Postulaciones", href: "/candidatos/aplicaciones" },
    { icon: Play, label: "Entrevistas", href: "/candidatos/entrevistas" },
    { icon: User, label: "Mi Perfil", href: "/candidatos/perfil" },
    { icon: Settings, label: "Configuración", href: "/candidatos/configuracion" },
]

const KPIS = [
    { label: "Postulaciones Activas", value: "8", icon: FileText, change: "+2 esta semana" },
    { label: "Entrevistas Pendientes", value: "2", icon: Play, change: "Próxima en 2 días" },
    { label: "Vistas de Perfil", value: "124", icon: Eye, change: "+15% vs mes anterior" },
    { label: "Match Promedio", value: "87%", icon: TrendingUp, change: "Excelente" },
]

const EMPLEOS_RECOMENDADOS = [
    { id: 1, titulo: "Senior Full Stack Developer", empresa: "TechCorp LATAM", match: 92, logo: "https://api.dicebear.com/7.x/initials/svg?seed=TC&backgroundColor=1890ff" },
    { id: 2, titulo: "Product Manager", empresa: "Fintech Innovators", match: 85, logo: "https://api.dicebear.com/7.x/initials/svg?seed=FI&backgroundColor=52c41a" },
    { id: 3, titulo: "UX/UI Designer", empresa: "Design Studio MX", match: 78, logo: "https://api.dicebear.com/7.x/initials/svg?seed=DS&backgroundColor=722ed1" },
]

export default function CandidatoDashboard() {
    return (
        <div className="min-h-screen bg-[hsl(var(--gray-50))] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-[hsl(var(--gray-200))] flex flex-col fixed h-full">
                {/* Logo */}
                <div className="p-6 border-b border-[hsl(var(--gray-200))]">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#1890ff] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">T</span>
                        </div>
                        <span className="text-xl font-semibold text-[hsl(var(--gray-900))]">TalentAI</span>
                    </Link>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-[hsl(var(--gray-200))]">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                            alt="Avatar"
                            className="w-10 h-10 rounded-full border border-[hsl(var(--gray-200))]"
                        />
                        <div>
                            <p className="text-body font-medium text-[hsl(var(--gray-900))]">Juan Pérez</p>
                            <p className="text-small text-[hsl(var(--gray-500))]">Full Stack Developer</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={item.active ? 'nav-item-active' : 'nav-item'}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-[hsl(var(--gray-200))]">
                    <button className="nav-item w-full text-[hsl(var(--destructive))]">
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-h1 text-[hsl(var(--gray-900))] mb-2">¡Hola, Juan!</h1>
                    <p className="text-body text-[hsl(var(--gray-600))]">
                        Aquí está el resumen de tu actividad
                    </p>
                </div>

                {/* Profile Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1890ff] rounded-xl p-6 mb-8 text-white"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-h3 mb-1">Completa tu perfil</h3>
                            <p className="text-body opacity-80">Un perfil completo aumenta tus chances 3x</p>
                        </div>
                        <Link href="/candidatos/perfil">
                            <Button className="bg-white text-[#1890ff] hover:bg-[hsl(var(--gray-100))]">
                                Completar
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-white/20 rounded-full h-2">
                            <div className="bg-white rounded-full h-2 w-3/4" />
                        </div>
                        <span className="text-body font-semibold">75%</span>
                    </div>
                </motion.div>

                {/* KPI Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {KPIS.map((kpi, i) => (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-xl border border-[hsl(var(--gray-200))] p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary-light))] flex items-center justify-center text-[#1890ff]">
                                    <kpi.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-h1 text-[hsl(var(--gray-900))] mb-1">{kpi.value}</div>
                            <div className="text-body text-[hsl(var(--gray-600))] mb-2">{kpi.label}</div>
                            <div className="text-small text-[hsl(var(--success))]">{kpi.change}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Recommended Jobs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl border border-[hsl(var(--gray-200))] p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-h2 text-[hsl(var(--gray-900))]">Empleos Recomendados</h2>
                        <Link href="/empleos" className="text-body text-[#1890ff] font-medium hover:underline">
                            Ver todos
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {EMPLEOS_RECOMENDADOS.map((empleo) => (
                            <Link key={empleo.id} href={`/empleos/${empleo.id}`}>
                                <div className="flex items-center gap-4 p-4 rounded-lg border border-[hsl(var(--gray-200))] hover:border-[#1890ff] hover:shadow-sm transition-all cursor-pointer">
                                    <img
                                        src={empleo.logo}
                                        alt={empleo.empresa}
                                        className="w-12 h-12 rounded-lg border border-[hsl(var(--gray-200))]"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-h3 text-[hsl(var(--gray-900))]">{empleo.titulo}</h3>
                                        <p className="text-body text-[hsl(var(--gray-600))]">{empleo.empresa}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-h3 text-[hsl(var(--success))]">{empleo.match}%</div>
                                        <div className="text-small text-[hsl(var(--gray-500))]">match</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
