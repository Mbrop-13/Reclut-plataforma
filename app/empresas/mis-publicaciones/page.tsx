"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
    Plus, Briefcase, MapPin, Clock, Users, MoreHorizontal,
    Search, Filter, ChevronRight, Mail, Phone, Calendar, Check, Bookmark,
    Crown, AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScoreCircle } from "@/components/ai/ScoreCircle"
import { collection, query, where, getDocs, orderBy, doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

export default function MisPublicacionesPage() {
    const [jobs, setJobs] = useState<any[]>([])
    const [selectedJob, setSelectedJob] = useState<any | null>(null)
    const [candidates, setCandidates] = useState<any[]>([])
    const [filteredCandidates, setFilteredCandidates] = useState<any[]>([])
    const [isLoadingJobs, setIsLoadingJobs] = useState(true)
    const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [plan, setPlan] = useState<string>("free")
    const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({})

    // Filters
    const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'saved' | 'contacted'>('all')
    const [searchQuery, setSearchQuery] = useState("")

    const isFreePlan = !plan || plan === "free"

    // Initial Fetch
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) return
            setUser(currentUser)

            try {
                // Get plan
                const userDoc = await getDoc(doc(db, "users", currentUser.uid))
                if (userDoc.exists()) {
                    setPlan(userDoc.data().plan || "free")
                }

                const q = query(
                    collection(db, "jobs"),
                    where("companyId", "==", currentUser.uid),
                    orderBy("createdAt", "desc")
                )

                const querySnapshot = await getDocs(q)
                const jobsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                setJobs(jobsData)

                // Fetch applicant counts for all jobs
                const counts: Record<string, number> = {}
                for (const job of jobsData) {
                    const appsQuery = query(
                        collection(db, "applications"),
                        where("jobId", "==", job.id)
                    )
                    const appsSnapshot = await getDocs(appsQuery)
                    counts[job.id] = appsSnapshot.size
                }
                setApplicantCounts(counts)

                // Select first job by default if available
                if (jobsData.length > 0) {
                    setSelectedJob(jobsData[0])
                }
            } catch (error) {
                console.error("Error fetching jobs:", error)
            } finally {
                setIsLoadingJobs(false)
            }
        })

        return () => unsubscribe()
    }, [])

    // Fetch Candidates when Job Selected
    useEffect(() => {
        if (!selectedJob) return

        const fetchCandidates = async () => {
            setIsLoadingCandidates(true)
            try {
                const q = query(
                    collection(db, "applications"),
                    where("jobId", "==", selectedJob.id),
                )

                const querySnapshot = await getDocs(q)
                const appsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))

                // Manual sort by score desc
                appsData.sort((a: any, b: any) => (b.aiScore || 0) - (a.aiScore || 0))

                setCandidates(appsData)
                setFilteredCandidates(appsData)
            } catch (error) {
                console.error("Error fetching candidates:", error)
                toast.error("Error cargando candidatos")
            } finally {
                setIsLoadingCandidates(false)
            }
        }

        fetchCandidates()
    }, [selectedJob])

    // Filter Candidates
    useEffect(() => {
        let result = candidates

        if (statusFilter !== 'all') {
            result = result.filter(c => c.status === statusFilter || (statusFilter === 'new' && (!c.status || c.status === 'new')))
        }

        setFilteredCandidates(result)
    }, [statusFilter, candidates])


    const updateCandidateStatus = async (candidateId: string, newStatus: string) => {
        try {
            const appRef = doc(db, "applications", candidateId)
            await updateDoc(appRef, { status: newStatus })

            // Update local state
            setCandidates(prev => prev.map(c =>
                c.id === candidateId ? { ...c, status: newStatus } : c
            ))

            toast.success(`Candidato ${newStatus === 'saved' ? 'guardado' : newStatus === 'contacted' ? 'contactado' : 'actualizado'} exitosamente`)
        } catch (error) {
            console.error("Error updating status:", error)
            toast.error("Error al actualizar estado")
        }
    }

    if (isLoadingJobs) {
        return (
            <div className="flex justify-center items-center p-12 min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1890ff]" />
            </div>
        )
    }

    return (
        <div className="p-4 lg:p-6 h-[calc(100vh-65px)] flex flex-col max-w-[1600px] mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-4 flex-shrink-0"
            >
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mis Ofertas Laborales</h1>
                    <p className="text-sm text-slate-500">Gestiona tus vacantes y revisa postulantes</p>
                </div>
                <Link href="/empresas/mis-publicaciones/nueva">
                    <Button className="bg-[#1890ff] hover:bg-blue-600 text-white rounded-xl h-11 px-5 font-semibold shadow-lg shadow-blue-500/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Oferta
                    </Button>
                </Link>
            </motion.div>

            {/* Free plan limit warning */}
            {isFreePlan && jobs.length >= 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between flex-shrink-0"
                >
                    <div className="flex items-center gap-2 text-sm text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>Plan Gratuito: <strong>1/{jobs.length} publicación</strong> usada, límite de <strong>5 postulantes</strong> por vacante</span>
                    </div>
                    <Link href="/empresas/planes" className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5" />
                        Mejorar Plan
                    </Link>
                </motion.div>
            )}

            {jobs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-300 p-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <Briefcase className="w-8 h-8 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">No tienes ofertas activas</h2>
                    <p className="text-slate-500 mb-6 text-center max-w-sm">
                        Comienza a publicar tus ofertas de empleo para encontrar al talento ideal.
                    </p>
                    <Link href="/empresas/mis-publicaciones/nueva">
                        <Button className="bg-[#1890ff] hover:bg-blue-600 text-white rounded-xl h-11 px-6 font-semibold shadow-lg shadow-blue-500/20">
                            <Plus className="w-4 h-4 mr-2" />
                            Crear primera oferta
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
                    {/* Left Panel: Jobs List */}
                    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-slate-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar oferta..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-slate-50 border-slate-200 rounded-xl h-10 focus-visible:ring-[#1890ff]"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                            {jobs
                                .filter(job => !searchQuery || job.title?.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(job => {
                                    const count = applicantCounts[job.id] || 0
                                    const maxApps = job.maxApplicants
                                    const isFreeJob = job.planType === "free"

                                    return (
                                        <div
                                            key={job.id}
                                            onClick={() => setSelectedJob(job)}
                                            className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedJob?.id === job.id
                                                ? "bg-blue-50 border-[#1890ff]/50 shadow-sm"
                                                : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className={`font-semibold text-sm ${selectedJob?.id === job.id ? 'text-[#1890ff]' : 'text-slate-900'}`}>
                                                    {job.title}
                                                </h3>
                                                <div className="flex items-center gap-1.5">
                                                    {isFreeJob && (
                                                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded">
                                                            FREE
                                                        </span>
                                                    )}
                                                    <div className={`w-2 h-2 rounded-full ${job.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-1 mb-3">{job.description}</p>
                                            <div className="flex items-center justify-between text-xs text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    <span className={maxApps && count >= maxApps ? 'text-red-500 font-semibold' : ''}>
                                                        {count}{maxApps ? `/${maxApps}` : ''} postulantes
                                                    </span>
                                                </div>
                                                <span>
                                                    {job.createdAt?.seconds ? formatDistanceToNow(new Date(job.createdAt.seconds * 1000), { addSuffix: true, locale: es }) : 'Reciente'}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>

                    {/* Right Panel: Job Detail & Candidates */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
                        {selectedJob ? (
                            <>
                                {/* Selected Job Header */}
                                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-xl font-bold text-slate-900">{selectedJob.title}</h2>
                                            <Badge variant={selectedJob.status === 'active' ? 'default' : 'secondary'} className={selectedJob.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-0' : ''}>
                                                {selectedJob.status === 'active' ? 'Activa' : 'Cerrada'}
                                            </Badge>
                                            {selectedJob.planType === "free" && (
                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 text-[10px]">
                                                    Plan Gratuito
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selectedJob.location}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedJob.workMode}</span>
                                            <span className="flex items-center gap-1 font-medium text-slate-700">{selectedJob.currency} {selectedJob.salaryMin?.toLocaleString()} - {selectedJob.salaryMax?.toLocaleString()}</span>
                                        </div>
                                        {/* Applicant limit indicator for free plan */}
                                        {selectedJob.maxApplicants && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="flex-1 max-w-[200px] bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${(applicantCounts[selectedJob.id] || 0) >= selectedJob.maxApplicants ? 'bg-red-500' : 'bg-[#1890ff]'}`}
                                                        style={{ width: `${Math.min(100, ((applicantCounts[selectedJob.id] || 0) / selectedJob.maxApplicants) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-medium ${(applicantCounts[selectedJob.id] || 0) >= selectedJob.maxApplicants ? 'text-red-600' : 'text-slate-500'}`}>
                                                    {applicantCounts[selectedJob.id] || 0}/{selectedJob.maxApplicants} postulantes
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="rounded-lg">Editar</Button>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                                    </div>
                                </div>

                                {/* Candidates Section */}
                                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                                    <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                                Candidatos ({filteredCandidates.length})
                                            </h3>
                                        </div>

                                        {/* Filters Tabs */}
                                        <div className="flex items-center gap-2">
                                            {[
                                                { key: 'all', label: 'Todos', activeClass: 'bg-slate-900 text-white' },
                                                { key: 'new', label: 'Nuevos', activeClass: 'bg-blue-100 text-blue-700' },
                                                { key: 'saved', label: 'Guardados', activeClass: 'bg-yellow-100 text-yellow-700' },
                                                { key: 'contacted', label: 'Contactados', activeClass: 'bg-green-100 text-green-700' },
                                            ].map(f => (
                                                <button
                                                    key={f.key}
                                                    onClick={() => setStatusFilter(f.key as any)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${statusFilter === f.key ? f.activeClass : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                >
                                                    {f.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {isLoadingCandidates ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1890ff]"></div>
                                            <p className="text-sm">Cargando candidatos...</p>
                                        </div>
                                    ) : candidates.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                                                <Users className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium text-slate-600 mb-1">Aún no hay postulantes</p>
                                            <p className="text-sm text-center max-w-xs">Comparte tu oferta para empezar a recibir candidatos</p>
                                        </div>
                                    ) : filteredCandidates.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                                            <p>No se encontraron candidatos con este filtro.</p>
                                            <Button variant="link" onClick={() => setStatusFilter('all')}>Ver todos</Button>
                                        </div>
                                    ) : (
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                                            {filteredCandidates.map(candidate => (
                                                <motion.div
                                                    key={candidate.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-shrink-0 relative">
                                                            <ScoreCircle score={candidate.aiScore || 0} size={56} showLabel={false} strokeWidth={5} />
                                                            {candidate.status === 'saved' && (
                                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                                </div>
                                                            )}
                                                            {candidate.status === 'contacted' && (
                                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                                    <Check className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-bold text-slate-900 group-hover:text-[#1890ff] truncate cursor-pointer">
                                                                            {candidate.candidateName}
                                                                        </h4>
                                                                        {candidate.status === 'saved' && <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200 px-1.5 py-0">Guardado</Badge>}
                                                                        {candidate.status === 'contacted' && <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 px-1.5 py-0">Contactado</Badge>}
                                                                    </div>
                                                                    <p className="text-sm text-slate-500 flex items-center gap-2 truncate">
                                                                        <Mail className="w-3 h-3" /> {candidate.contactEmail}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right flex flex-col items-end">
                                                                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                                                        {candidate.aiScore || 0}% Match
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {candidate.aiAnalysis?.summary && (
                                                                <p className="text-xs text-slate-600 mt-2 line-clamp-2 bg-blue-50/50 p-2 rounded border border-blue-50">
                                                                    <span className="font-semibold text-blue-600">IA: </span>
                                                                    {candidate.aiAnalysis.summary}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col gap-2 border-l pl-3 ml-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={`h-8 w-8 ${candidate.status === 'saved' ? 'text-yellow-500 bg-yellow-50' : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50'}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    updateCandidateStatus(candidate.id, candidate.status === 'saved' ? 'new' : 'saved')
                                                                }}
                                                                title={candidate.status === 'saved' ? "Quitar de guardados" : "Guardar candidato"}
                                                            >
                                                                <Bookmark className={`w-4 h-4 ${candidate.status === 'saved' ? 'fill-current' : ''}`} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={`h-8 w-8 ${candidate.status === 'contacted' ? 'text-green-500 bg-green-50' : 'text-slate-400 hover:text-green-500 hover:bg-green-50'}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    updateCandidateStatus(candidate.id, 'contacted')
                                                                }}
                                                                title="Marcar como contactado"
                                                            >
                                                                <Phone className={`w-4 h-4 ${candidate.status === 'contacted' ? 'fill-current' : ''}`} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                                <Briefcase className="w-12 h-12 text-slate-200 mb-3" />
                                <p className="font-medium text-slate-500">Selecciona una oferta</p>
                                <p className="text-sm">para ver los detalles y candidatos</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
