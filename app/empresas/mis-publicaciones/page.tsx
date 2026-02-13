"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
    Plus, Briefcase, MapPin, Clock, Users, MoreHorizontal,
    Search, Filter, ChevronRight, Mail, Phone, Calendar, Check, Bookmark
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

    // Filters
    const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'saved' | 'contacted'>('all')

    // Initial Fetch
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) return
            setUser(currentUser)

            try {
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
                // Fetch applications for this job
                // Note: In production we would query by jobId. For now we fetch all and filter client side 
                // if we haven't set up the composite index yet, but let's try strict query

                // Optimized query:
                const q = query(
                    collection(db, "applications"),
                    where("jobId", "==", selectedJob.id),
                    // orderBy("aiScore", "desc") // Requires index, remove if causing issues
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
        return <div className="flex justify-center p-8">Cargando tus ofertas laborales...</div>
    }

    return (
        <div className="container h-[calc(100vh-65px)] max-w-[1600px] py-4 flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-[hsl(var(--gray-900))]">Mis Ofertas Laborales</h1>
                    <p className="text-sm text-[hsl(var(--gray-500))]">Gestiona tus vacantes y revisa postulantes</p>
                </div>
                <Link href="/empresas/mis-publicaciones/nueva">
                    <Button className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Oferta
                    </Button>
                </Link>
            </div>

            {jobs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-[hsl(var(--gray-300))] p-12">
                    <div className="w-16 h-16 bg-[hsl(var(--gray-100))] rounded-full flex items-center justify-center mb-4">
                        <Briefcase className="w-8 h-8 text-[hsl(var(--gray-400))]" />
                    </div>
                    <h2 className="text-xl font-semibold text-[hsl(var(--gray-900))] mb-2">No tienes ofertas activas</h2>
                    <p className="text-[hsl(var(--gray-500))] mb-6 text-center max-w-sm">
                        Comienza a publicar tus ofertas de empleo para encontrar al talento ideal.
                    </p>
                    <Link href="/empresas/mis-publicaciones/nueva">
                        <Button>Crear primera oferta</Button>
                    </Link>
                </div>
            ) : (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
                    {/* Left Panel: Jobs List */}
                    <div className="lg:col-span-4 bg-white rounded-xl border border-[hsl(var(--gray-200))] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-[hsl(var(--gray-100))] bg-gray-50/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input placeholder="Buscar oferta..." className="pl-9 bg-white" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {jobs.map(job => (
                                <div
                                    key={job.id}
                                    onClick={() => setSelectedJob(job)}
                                    className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedJob?.id === job.id
                                        ? "bg-blue-50 border-[#1890ff] shadow-sm"
                                        : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`font-semibold text-sm ${selectedJob?.id === job.id ? 'text-[#1890ff]' : 'text-gray-900'}`}>{job.title}</h3>
                                        <div className={`w-2 h-2 rounded-full ${job.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{job.description}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            <span>Ver candidatos</span>
                                        </div>
                                        <span>
                                            {job.createdAt?.seconds ? formatDistanceToNow(new Date(job.createdAt.seconds * 1000), { addSuffix: true, locale: es }) : 'Reciente'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Job Detail & Candidates */}
                    <div className="lg:col-span-8 bg-white rounded-xl border border-[hsl(var(--gray-200))] flex flex-col overflow-hidden">
                        {selectedJob ? (
                            <>
                                {/* Selected Job Header */}
                                <div className="p-6 border-b border-[hsl(var(--gray-100))] bg-gray-50/30 flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-xl font-bold text-gray-900">{selectedJob.title}</h2>
                                            <Badge variant={selectedJob.status === 'active' ? 'default' : 'secondary'} className={selectedJob.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}>
                                                {selectedJob.status === 'active' ? 'Activa' : 'Cerrada'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selectedJob.location}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedJob.workMode}</span>
                                            <span className="flex items-center gap-1 font-medium text-gray-700">{selectedJob.currency} {selectedJob.salaryMin?.toLocaleString()} - {selectedJob.salaryMax?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Editar</Button>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                                    </div>
                                </div>

                                {/* Candidates Section */}
                                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                                    <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                Candidatos ({filteredCandidates.length})
                                            </h3>
                                            <Button variant="outline" size="sm" className="h-8">
                                                <Filter className="w-3 h-3 mr-2" />
                                                Más filtros
                                            </Button>
                                        </div>

                                        {/* Filters Tabs */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setStatusFilter('all')}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${statusFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                Todos
                                            </button>
                                            <button
                                                onClick={() => setStatusFilter('new')}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${statusFilter === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                Interesados
                                            </button>
                                            <button
                                                onClick={() => setStatusFilter('saved')}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${statusFilter === 'saved' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                Guardados
                                            </button>
                                            <button
                                                onClick={() => setStatusFilter('contacted')}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${statusFilter === 'contacted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                Contactados
                                            </button>
                                        </div>
                                    </div>

                                    {isLoadingCandidates ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1890ff]"></div>
                                            <p className="text-sm">Cargando candidatos...</p>
                                        </div>
                                    ) : candidates.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                            <Users className="w-12 h-12 mb-2 opacity-20" />
                                            <p>Aún no hay postulantes para esta oferta.</p>
                                        </div>
                                    ) : filteredCandidates.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                                            <p>No se encontraron candidatos con este filtro.</p>
                                            <Button variant="link" onClick={() => setStatusFilter('all')}>Ver todos</Button>
                                        </div>
                                    ) : (
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                                            {filteredCandidates.map(candidate => (
                                                <motion.div
                                                    key={candidate.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group"
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
                                                                        <h4 className="font-bold text-gray-900 group-hover:text-[#1890ff] truncate cursor-pointer">
                                                                            {candidate.candidateName}
                                                                        </h4>
                                                                        {candidate.status === 'saved' && <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200 px-1.5 py-0">Guardado</Badge>}
                                                                        {candidate.status === 'contacted' && <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 px-1.5 py-0">Contactado</Badge>}
                                                                    </div>
                                                                    <p className="text-sm text-gray-500 flex items-center gap-2 truncate">
                                                                        <Mail className="w-3 h-3" /> {candidate.contactEmail}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right flex flex-col items-end">
                                                                    <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                                                        {candidate.aiScore || 0}% Match
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {candidate.aiAnalysis?.summary && (
                                                                <p className="text-xs text-gray-600 mt-2 line-clamp-2 bg-blue-50/50 p-2 rounded border border-blue-50">
                                                                    <span className="font-semibold text-blue-600">IA: </span>
                                                                    {candidate.aiAnalysis.summary}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col gap-2 border-l pl-3 ml-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={`h-8 w-8 ${candidate.status === 'saved' ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}
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
                                                                className={`h-8 w-8 ${candidate.status === 'contacted' ? 'text-green-500 bg-green-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
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
                            <div className="flex-1 flex items-center justify-center text-gray-400">
                                <p>Selecciona una oferta para ver los detalles</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
