"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Briefcase, Building2, MapPin, Clock, Calendar,
    ChevronRight, ArrowLeft, Loader2, FileText, CheckCircle2, XCircle, AlertCircle
} from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { collection, query, where, getDocs, orderBy, getDoc, doc } from "firebase/firestore"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ScoreCircle } from "@/components/ai/ScoreCircle"

export default function CandidateApplicationsPage() {
    const [user, setUser] = useState<any>(null)
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser({ uid: currentUser.uid, email: currentUser.email })
                await fetchApplications(currentUser.uid)
            } else {
                setLoading(false)
            }
        })
        return () => unsubscribe()
    }, [])

    const fetchApplications = async (userId: string) => {
        try {
            const q = query(
                collection(db, "applications"),
                where("candidateId", "==", userId)
            )
            const snapshot = await getDocs(q)
            const appsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as any[]

            // Sort client-side if no composite index exists for candidateId + createdAt
            appsData.sort((a, b) => {
                const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return dateB - dateA; // Descending
            })

            // Enrich with company names and job locations if possible
            const enrichedApps = await Promise.all(appsData.map(async (app) => {
                let companyName = "Empresa Confidencial"
                let companyLogo = null
                let location = "Ubicación no especificada"
                let mode = "Remoto/Presencial"

                if (app.companyId && app.companyId !== "unknown") {
                    try {
                        const companyDoc = await getDoc(doc(db, "users", app.companyId))
                        if (companyDoc.exists()) {
                            companyName = companyDoc.data().companyName || companyDoc.data().name || companyName
                            companyLogo = companyDoc.data().logoUrl || null
                        }
                    } catch (e) {
                        console.error("Error fetching company info for app:", app.id)
                    }
                }

                if (app.jobId) {
                    try {
                        const jobDoc = await getDoc(doc(db, "jobs", app.jobId))
                        if (jobDoc.exists()) {
                            location = jobDoc.data().location || location
                            mode = jobDoc.data().workMode || mode
                        }
                    } catch (e) {
                        console.error("Error fetching job info for app:", app.id)
                    }
                }

                return { ...app, companyName, companyLogo, location, mode }
            }))

            setApplications(enrichedApps)
        } catch (error) {
            console.error("Error fetching applications:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#1890ff]" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex flex-col h-screen items-center justify-center space-y-4">
                <AlertCircle className="w-12 h-12 text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-700">Debes iniciar sesión</h2>
                <Link href="/login">
                    <Button className="bg-[#1890ff] hover:bg-blue-600">Ir al Login</Button>
                </Link>
            </div>
        )
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "new":
                return { label: "Enviada", style: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock }
            case "reviewed":
                return { label: "En Revisión", style: "bg-amber-100 text-amber-700 border-amber-200", icon: FileText }
            case "interviewing":
                return { label: "En Entrevistas", style: "bg-purple-100 text-purple-700 border-purple-200", icon: Calendar }
            case "hired":
                return { label: "Contratado", style: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 }
            case "rejected":
                return { label: "Descartado", style: "bg-slate-100 text-slate-600 border-slate-200", icon: XCircle }
            default:
                return { label: "Procesando", style: "bg-slate-100 text-slate-600 border-slate-200", icon: Clock }
        }
    }

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="mb-8">
                <Link href="/candidate/dashboard" className="inline-flex items-center text-sm text-slate-500 hover:text-[#1890ff] transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver al Dashboard
                </Link>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-[#1890ff]" />
                        Mis Postulaciones
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm lg:text-base">
                        Haz seguimiento del estado de todas tus aplicaciones a ofertas de empleo.
                    </p>
                </motion.div>
            </div>

            {/* Applications List */}
            <AnimatePresence>
                {applications.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl border border-slate-200 p-12 text-center"
                    >
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">Aún no te has postulado a empleos</h2>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8">
                            Explora las oportunidades disponibles y encuentra tu próximo gran desafío profesional.
                        </p>
                        <Link href="/">
                            <Button className="bg-[#1890ff] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 px-8 rounded-xl h-12">
                                Explorar Vacantes
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app, index) => {
                            const date = app.createdAt?.toDate ? app.createdAt.toDate() : new Date()
                            const formattedDate = format(date, "d 'de' MMMM, yyyy", { locale: es })
                            const status = getStatusConfig(app.status)
                            const StatusIcon = status.icon

                            return (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-xl border border-slate-200 p-5 lg:p-6 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    <div className="flex items-start gap-5 flex-1">
                                        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {app.companyLogo ? (
                                                <img src={app.companyLogo} alt={app.companyName} className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <Building2 className="w-7 h-7 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">
                                                {app.jobTitle}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mb-3">
                                                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                                    <Building2 className="w-4 h-4 text-slate-400" />
                                                    {app.companyName}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    {app.location}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-[#1890ff]">
                                                    <Briefcase className="w-4 h-4" />
                                                    {app.mode}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Clock className="w-3.5 h-3.5" />
                                                Postulado el {formattedDate}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-between w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-slate-100">
                                        {/* Score (If analyzed) */}
                                        {typeof app.aiScore === 'number' && (
                                            <div className="flex items-center gap-2 mr-2">
                                                <ScoreCircle score={Number(app.aiScore)} size={40} />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Match IA</span>
                                                    <span className="text-sm font-semibold text-slate-700">{app.aiScore}%</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <Badge variant="outline" className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${status.style}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                <span className="font-semibold">{status.label}</span>
                                            </Badge>

                                            <Link href={`/empleos/${app.jobId}`} target="_blank" className="ml-auto sm:ml-0">
                                                <Button variant="ghost" size="icon" className="hover:bg-slate-50 hover:text-[#1890ff]">
                                                    <ChevronRight className="w-5 h-5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
