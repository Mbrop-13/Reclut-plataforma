"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    Search, Filter, Download, MoreHorizontal, Mail,
    Calendar, Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScoreCircle } from "@/components/ai/ScoreCircle"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

export default function CandidatosPage({ searchParams }: { searchParams: { jobId?: string } }) {
    const [applications, setApplications] = useState<any[]>([])
    const [jobs, setJobs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedJobId, setSelectedJobId] = useState<string | null>(searchParams.jobId || "all")

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return

            try {
                // 1. Fetch Company Jobs (for filter)
                const jobsQuery = query(collection(db, "jobs"), where("companyId", "==", user.uid))
                const jobsSnapshot = await getDocs(jobsQuery)
                const jobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                setJobs(jobsData)

                // 2. Fetch Applications
                // Note: Complex queries require indexes. Fetching all company apps and filtering client-side for now.
                const appsQuery = query(
                    collection(db, "applications"),
                    where("companyId", "==", user.uid)
                )

                const appsSnapshot = await getDocs(appsQuery)
                const appsData = appsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

                // Sort client-side to avoid index issues during demo
                appsData.sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds)

                setApplications(appsData)

            } catch (error) {
                console.error("Error fetching data:", error)
                toast.error("Error al cargar candidatos")
            } finally {
                setIsLoading(false)
            }
        })

        return () => unsubscribe()
    }, [])

    const filteredApplications = selectedJobId === "all"
        ? applications
        : applications.filter(app => app.jobId === selectedJobId)

    if (isLoading) {
        return <div className="flex justify-center p-8">Cargando candidatos...</div>
    }

    return (
        <div className="container py-8 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--gray-900))]">Candidatos</h1>
                    <p className="text-[hsl(var(--gray-500))]">Gestiona y evalúa a tus postulantes con IA</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-[hsl(var(--gray-200))] shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--gray-400))]" />
                    <Input placeholder="Buscar por nombre o habilidades..." className="pl-9" />
                </div>

                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-[200px]"
                    value={selectedJobId || "all"}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                >
                    <option value="all">Todas las vacantes</option>
                    {jobs.map((job: any) => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                </select>

                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Más filtros
                </Button>
            </div>

            {/* Results */}
            {filteredApplications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-[hsl(var(--gray-300))]">
                    <div className="w-16 h-16 bg-[hsl(var(--gray-100))] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-[hsl(var(--gray-400))]" />
                    </div>
                    <h2 className="text-xl font-semibold text-[hsl(var(--gray-900))] mb-2">No se encontraron candidatos</h2>
                    <p className="text-[hsl(var(--gray-500))]">
                        {selectedJobId !== "all" ? "Esta vacante aún no tiene postulantes." : "Aún no has recibido postulaciones."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredApplications.map((app) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-xl border border-[hsl(var(--gray-200))] shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                {/* Basic Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {app.candidateName?.charAt(0).toUpperCase() || "C"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-[hsl(var(--gray-900))] group-hover:text-[#1890ff] transition-colors">
                                            {app.candidateName}
                                        </h3>
                                        <p className="text-sm text-[hsl(var(--gray-500))] mb-2">Postuló a: {app.jobTitle}</p>

                                        <div className="flex flex-wrap gap-3 text-sm text-[hsl(var(--gray-600))]">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {app.createdAt?.seconds ? format(new Date(app.createdAt.seconds * 1000), "d MMM yyyy", { locale: es }) : 'Reciente'}
                                            </span>
                                            {app.contactEmail && (
                                                <span className="flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {app.contactEmail}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* AI Score & Actions */}
                                <div className="flex items-center gap-6 self-end md:self-center w-full md:w-auto justify-between md:justify-end">
                                    {app.aiScore !== undefined && app.aiScore !== null ? (
                                        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl">
                                            <div className="text-right hidden sm:block">
                                                <div className="text-xs font-semibold text-[hsl(var(--gray-500))] uppercase tracking-wider">AI Match</div>
                                                <div className="text-xs text-[hsl(var(--gray-400))]">Compatibilidad</div>
                                            </div>
                                            <ScoreCircle score={app.aiScore} size={50} showLabel={true} />
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-400 italic px-4">Pendiente de análisis</div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="w-5 h-5 text-[hsl(var(--gray-500))]" />
                                        </Button>
                                        <Button className="btn-primary">Ver Perfil</Button>
                                    </div>
                                </div>
                            </div>

                            {/* AI Summary Snippet */}
                            {app.aiAnalysis?.summary && (
                                <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                                    <span className="font-semibold text-[#1890ff]">AI Insight: </span>
                                    {app.aiAnalysis.summary}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
