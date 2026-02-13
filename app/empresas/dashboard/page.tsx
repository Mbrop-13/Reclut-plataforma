"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    Home, Briefcase, Users, Play, Settings, LogOut, Plus,
    TrendingUp, FileText, Clock, ChevronRight, Building2, Zap
} from "lucide-react"
import { db, auth } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"

const NAV_ITEMS = [
    { icon: Home, label: "Inicio", href: "/empresas/dashboard", active: true },
    { icon: Plus, label: "Publicar Empleo", href: "/empresas/vacantes/nueva" },
    { icon: Briefcase, label: "Mis Vacantes", href: "/empresas/vacantes" },
    { icon: Users, label: "Candidatos", href: "/empresas/candidatos" },
    { icon: Play, label: "Entrevistas IA", href: "/empresas/entrevistas" },
    { icon: Settings, label: "Configuración", href: "/empresas/configuracion" },
]

export default function EmpresaDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState({
        activeJobs: 0,
        totalApplications: 0,
        interviews: 0,
        conversionRate: 0
    })
    const [recentApplications, setRecentApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [companyName, setCompanyName] = useState("Empresa")

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Fetch basic stats (Mock implementation for structure, implies collections exist)
                    // In a real scenario, you would query 'jobs' where companyId == user.uid
                    // and 'applications' where companyId == user.uid

                    // For now, initialized to 0 as requested to remove fake data
                    // We will implement the actual fetch logic once the creation flows are ready
                    // const jobsQuery = query(collection(db, "jobs"), where("companyId", "==", user.uid));
                    // const jobsSnapshot = await getDocs(jobsQuery);
                    // ... 

                    // Leaving as 0 to reflect "Clean State"
                } catch (error) {
                    console.error("Error fetching stats:", error)
                } finally {
                    setLoading(false)
                }
            } else {
                router.push("/login")
            }
        })
        return () => unsubscribe()
    }, [router])

    const KPIS = [
        { label: "Vacantes Activas", value: stats.activeJobs.toString(), icon: Briefcase, change: "0 nuevas" },
        { label: "Total Postulaciones", value: stats.totalApplications.toString(), icon: FileText, change: "0 esta semana" },
        { label: "Entrevistas IA", value: stats.interviews.toString(), icon: Play, change: "0 pendientes" },
        { label: "Tasa de Conversión", value: `${stats.conversionRate}%`, icon: TrendingUp, change: "0% vs anterior" },
    ]

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

                {/* Company Info */}
                <div className="p-4 border-b border-[hsl(var(--gray-200))]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1890ff] flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-body font-medium text-[hsl(var(--gray-900))]">{companyName}</p>
                            <p className="text-small text-[hsl(var(--gray-500))]">Plan Gratuito</p>
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

                {/* Usage / Plan CTA */}
                <div className="p-4 border-t border-[hsl(var(--gray-200))]">
                    <div className="p-4 bg-[hsl(var(--primary-light))] rounded-lg border border-[#1890ff]/20">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-small font-semibold text-[#1890ff]">Plan Gratuito</p>
                            <span className="text-[10px] bg-white text-[#1890ff] px-2 py-0.5 rounded-full border border-[#1890ff]/20">
                                Básico
                            </span>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div>
                                <div className="flex justify-between text-[11px] text-[hsl(var(--gray-600))] mb-1">
                                    <span>Vacantes</span>
                                    <span>0 / 0</span>
                                </div>
                                <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-[#1890ff] h-1.5 rounded-full w-0" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[11px] text-[hsl(var(--gray-600))] mb-1">
                                    <span>Entrevistas</span>
                                    <span>0 / 0</span>
                                </div>
                                <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-[#1890ff] h-1.5 rounded-full w-0" />
                                </div>
                            </div>
                        </div>

                        <Link href="/empresas/planes">
                            <Button size="sm" className="w-full bg-[#1890ff] hover:bg-[#1890ff]/90 text-white border-0 shadow-sm text-xs h-8">
                                <Zap className="w-3 h-3 mr-1.5" />
                                Mejorar Plan
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-[hsl(var(--gray-200))]">
                    <button onClick={() => auth.signOut()} className="nav-item w-full text-[hsl(var(--destructive))]">
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-h1 text-[hsl(var(--gray-900))] mb-2">Dashboard</h1>
                        <p className="text-body text-[hsl(var(--gray-600))]">
                            Resumen de actividad de reclutamiento
                        </p>
                    </div>
                    <Link href="/empresas/vacantes/nueva">
                        <Button className="btn-primary">
                            <Plus className="w-4 h-4" />
                            Publicar Vacante
                        </Button>
                    </Link>
                </div>

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

                {/* Recent Applications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl border border-[hsl(var(--gray-200))] overflow-hidden"
                >
                    <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--gray-200))]">
                        <h2 className="text-h2 text-[hsl(var(--gray-900))]">Postulaciones Recientes</h2>
                        <Link href="/empresas/candidatos" className="text-body text-[#1890ff] font-medium hover:underline">
                            Ver todas
                        </Link>
                    </div>

                    <div className="divide-y divide-[hsl(var(--gray-200))]">
                        {recentApplications.length > 0 ? (
                            recentApplications.map((postulacion) => (
                                <div key={postulacion.id} className="flex items-center gap-4 p-4 hover:bg-[hsl(var(--gray-50))] transition-colors cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--gray-100))] flex items-center justify-center">
                                        <Users className="w-5 h-5 text-[hsl(var(--gray-400))]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-body font-medium text-[hsl(var(--gray-900))]">{postulacion.candidateName || "Candidato"}</p>
                                        <p className="text-small text-[hsl(var(--gray-500))]">{postulacion.jobTitle || "Vacante"}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-small text-[hsl(var(--gray-500))]">
                                        <Clock className="w-4 h-4" />
                                        <span>Reciente</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-[#1890ff]">
                                        Ver perfil
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-[hsl(var(--gray-500))]">
                                No hay postulaciones recientes
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
