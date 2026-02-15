"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    Briefcase, Users, Play, Plus,
    TrendingUp, FileText, Clock, ChevronRight, ArrowUpRight
} from "lucide-react"
import { db, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"

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
                    const userDoc = await import("firebase/firestore").then(m => m.getDoc(m.doc(db, "users", user.uid)))
                    if (userDoc.exists()) {
                        const userData = userDoc.data()
                        setCompanyName(userData.companyName || "Empresa")
                    }
                } catch (error) {
                    console.error("Error fetching data:", error)
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
        { label: "Vacantes Activas", value: stats.activeJobs.toString(), icon: Briefcase, change: "0 nuevas", color: "text-[#1890ff] bg-blue-50" },
        { label: "Postulaciones", value: stats.totalApplications.toString(), icon: FileText, change: "0 esta semana", color: "text-emerald-600 bg-emerald-50" },
        { label: "Entrevistas IA", value: stats.interviews.toString(), icon: Play, change: "0 pendientes", color: "text-indigo-600 bg-indigo-50" },
        { label: "Tasa de Conversión", value: `${stats.conversionRate}%`, icon: TrendingUp, change: "0% vs anterior", color: "text-amber-600 bg-amber-50" },
    ]

    const QUICK_ACTIONS = [
        { label: "Publicar Vacante", desc: "Crea una nueva oferta de empleo", icon: Plus, href: "/empresas/vacantes/nueva", gradient: "from-[#1890ff] to-blue-600" },
        { label: "Ver Candidatos", desc: "Revisa postulaciones recientes", icon: Users, href: "/empresas/candidatos", gradient: "from-indigo-500 to-purple-600" },
        { label: "Entrevistas IA", desc: "Monitorea entrevistas activas", icon: Play, href: "/empresas/entrevistas", gradient: "from-emerald-500 to-teal-600" },
    ]

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                        ¡Hola, {companyName}! 👋
                    </h1>
                    <p className="text-slate-500 mt-1">Resumen de tu actividad de reclutamiento</p>
                </div>
                <Link href="/empresas/vacantes/nueva">
                    <Button className="bg-[#1890ff] hover:bg-blue-600 text-white rounded-xl px-5 h-11 shadow-lg shadow-blue-500/20 font-semibold">
                        <Plus className="w-4 h-4 mr-2" />
                        Publicar Vacante
                    </Button>
                </Link>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
                {KPIS.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.05 }}
                        className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-11 h-11 rounded-xl ${kpi.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{kpi.value}</div>
                        <div className="text-sm text-slate-500 mb-2">{kpi.label}</div>
                        <div className="text-xs text-emerald-600 font-medium">{kpi.change}</div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4 lg:gap-5 mb-8">
                {QUICK_ACTIONS.map((action, i) => (
                    <motion.div
                        key={action.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                    >
                        <Link href={action.href}>
                            <div className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-slate-300 transition-all h-full">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <action.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-1">{action.label}</h3>
                                        <p className="text-sm text-slate-500">{action.desc}</p>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-[#1890ff] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Recent Applications */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Postulaciones Recientes</h2>
                    <Link href="/empresas/candidatos" className="text-sm text-[#1890ff] font-medium hover:underline flex items-center gap-1">
                        Ver todas
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="divide-y divide-slate-100">
                    {recentApplications.length > 0 ? (
                        recentApplications.map((postulacion) => (
                            <div key={postulacion.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">{postulacion.candidateName || "Candidato"}</p>
                                    <p className="text-xs text-slate-500 truncate">{postulacion.jobTitle || "Vacante"}</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Reciente</span>
                                </div>
                                <Button variant="ghost" size="sm" className="text-[#1890ff] text-xs font-semibold hover:bg-blue-50">
                                    Ver perfil
                                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                <Users className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Sin postulaciones recientes</p>
                            <p className="text-xs text-slate-400">Las postulaciones aparecerán aquí</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
