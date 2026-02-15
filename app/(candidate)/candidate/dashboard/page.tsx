"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    Briefcase, FileText, User, Play, Eye, TrendingUp,
    ChevronRight, Clock, MapPin, Sparkles
} from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { Loader2 } from "lucide-react"

export default function CandidateDashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const docRef = doc(db, "users", currentUser.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setUser({ ...docSnap.data(), uid: currentUser.uid, email: currentUser.email })
                } else {
                    setUser({ uid: currentUser.uid, email: currentUser.email })
                }
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#1890ff]" />
            </div>
        )
    }

    const firstName = user?.firstName || user?.name?.split(" ")[0] || "Usuario"
    const profileComplete = user?.title && user?.location && user?.bio ? 100 : user?.title || user?.location ? 60 : 30

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight">
                    ¡Hola, {firstName}! 👋
                </h1>
                <p className="text-slate-500 mt-1">Aquí está el resumen de tu actividad</p>
            </motion.div>

            {/* Profile Completion Banner */}
            {profileComplete < 100 && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-gradient-to-r from-[#1890ff] to-blue-600 rounded-xl p-5 mb-8 text-white shadow-lg shadow-blue-500/15"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Completa tu perfil</h3>
                                <p className="text-sm text-white/80">Un perfil completo aumenta tus oportunidades 3x</p>
                            </div>
                        </div>
                        <Link href="/candidate/profile">
                            <Button size="sm" className="bg-white text-[#1890ff] hover:bg-blue-50 font-medium shadow-sm">
                                Completar <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white/20 rounded-full h-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${profileComplete}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="bg-white rounded-full h-2"
                            />
                        </div>
                        <span className="text-sm font-semibold">{profileComplete}%</span>
                    </div>
                </motion.div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {[
                    { label: "Postulaciones", value: "0", icon: FileText, sub: "Activas", color: "text-[#1890ff]", bg: "bg-blue-50" },
                    { label: "Entrevistas", value: "0", icon: Play, sub: "Pendientes", color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Vistas de Perfil", value: "0", icon: Eye, sub: "Este mes", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Match IA", value: "—", icon: TrendingUp, sub: "Postúlate para ver", color: "text-amber-600", bg: "bg-amber-50" },
                ].map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all"
                    >
                        <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
                            <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                        <div className="text-sm text-slate-600 font-medium">{kpi.label}</div>
                        <div className="text-xs text-slate-400 mt-1">{kpi.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-3 gap-5 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Link href="/candidate/profile">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-[#1890ff] transition-all group cursor-pointer h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-[#1890ff] transition-colors">
                                    <User className="w-5 h-5 text-[#1890ff] group-hover:text-white transition-colors" />
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#1890ff] transition-colors" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Perfil Profesional</h3>
                            <p className="text-sm text-slate-500">Edita tu información, habilidades y experiencia</p>
                        </div>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <Link href="/candidate/applications">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-[#1890ff] transition-all group cursor-pointer h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                    <FileText className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#1890ff] transition-colors" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Mis Postulaciones</h3>
                            <p className="text-sm text-slate-500">Revisa el estado de tus postulaciones activas</p>
                        </div>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Link href="/empleos">
                        <div className="bg-gradient-to-br from-[#1890ff] to-blue-600 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-500/20 transition-all group cursor-pointer text-white h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-11 h-11 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-white" />
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="font-semibold mb-1">Explorar Empleos</h3>
                            <p className="text-sm text-white/80">Descubre ofertas que coinciden con tu perfil</p>
                        </div>
                    </Link>
                </motion.div>
            </div>

            {/* Quick Tips Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl border border-slate-200 p-6"
            >
                <h2 className="font-semibold text-slate-900 text-lg mb-4">Próximos Pasos</h2>
                <div className="space-y-3">
                    {[
                        { icon: User, text: "Completa tu perfil profesional para destacar", href: "/candidate/profile", done: profileComplete === 100 },
                        { icon: Briefcase, text: "Explora empleos y postúlate a los que más te interesen", href: "/empleos", done: false },
                        { icon: Play, text: "Prepárate para entrevistas con IA (próximamente)", href: "#", done: false },
                    ].map((step, i) => (
                        <Link key={i} href={step.href}>
                            <div className={`flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer ${step.done ? 'opacity-60' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {step.done ? '✓' : i + 1}
                                </div>
                                <span className={`text-sm flex-1 ${step.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{step.text}</span>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1890ff] transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
