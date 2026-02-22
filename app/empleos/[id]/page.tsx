"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MainHeader } from "@/components/layout/main-header"
import {
    MapPin, Building2, CheckCircle2, Briefcase,
    DollarSign, Heart, ArrowLeft,
    Calendar, Globe, Loader2, BrainCircuit, Sparkles, Check, Clock, FileText
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { doc, getDoc, addDoc, collection, updateDoc, serverTimestamp, query, where, getDocs, getCountFromServer } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { EMPLEOS } from "@/lib/mock-data"

export default function EmpleoDetallePage({ params }: { params: { id: string } }) {
    const [job, setJob] = useState<any>(null)
    const [company, setCompany] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [userProfile, setUserProfile] = useState<any>(null)
    const router = useRouter()

    const { scrollY } = useScroll()

    // Application Flow State
    const [isApplicationOpen, setIsApplicationOpen] = useState(false)
    const [appStep, setAppStep] = useState<'idle' | 'analyzing' | 'success_interview' | 'success_standard' | 'scheduled'>('idle')
    const [analysisProgress, setAnalysisProgress] = useState(0)
    const [aiScore, setAiScore] = useState<number | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [isLimitReached, setIsLimitReached] = useState(false)
    const [hasApplied, setHasApplied] = useState(false)

    // OpenRouter AI Analysis State
    const [isAiAnalyzing, setIsAiAnalyzing] = useState(false)
    const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null)



    useEffect(() => {
        const fetchJob = async () => {
            try {
                // First check if it's a mock job
                const mockJob = EMPLEOS.find(e => e.id === params.id)
                if (mockJob) {
                    setJob({
                        id: mockJob.id,
                        title: mockJob.titulo,
                        location: mockJob.ubicacion,
                        workMode: mockJob.modalidad,
                        salaryMin: mockJob.salaryMin,
                        salaryMax: mockJob.salaryMax,
                        currency: mockJob.currency,
                        description: mockJob.descripcion,
                        requirements: mockJob.requirements,
                        responsibilities: mockJob.responsibilities,
                        benefits: mockJob.benefits,
                        enableAvatarInterview: true, // Default enabled for mock
                        minScore: 70
                    })
                    setCompany({
                        name: mockJob.empresa,
                        logoUrl: mockJob.logo,
                        description: mockJob.companyDescription,
                        website: mockJob.companyWebsite
                    })
                    setIsLoading(false)
                    return
                }

                const jobDoc = await getDoc(doc(db, "jobs", params.id))
                if (jobDoc.exists()) {
                    const jobData = jobDoc.data()
                    setJob({ id: jobDoc.id, ...jobData })

                    // Fetch Company Info if companyId exists
                    if (jobData.companyId) {
                        const userDoc = await getDoc(doc(db, "users", jobData.companyId))
                        if (userDoc.exists()) {
                            setCompany(userDoc.data())
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching job:", error)
            } finally {
                setIsLoading(false)
            }
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user)
            if (user) {
                try {
                    const profileDoc = await getDoc(doc(db, "users", user.uid))
                    if (profileDoc.exists()) setUserProfile(profileDoc.data())
                } catch (e) { console.error(e) }
            } else {
                setUserProfile(null)
            }
        })

        fetchJob()
        return () => unsubscribe()
    }, [params.id])

    const isCompanyUser = !!(userProfile?.role === 'RECRUITER' || userProfile?.companyName || userProfile?.userType === 'company')

    // Check if user has already applied
    useEffect(() => {
        const checkApplicationStatus = async () => {
            if (currentUser && job && !isCompanyUser) {
                try {
                    const q = query(
                        collection(db, "applications"),
                        where("jobId", "==", job.id),
                        where("candidateId", "==", currentUser.uid)
                    )
                    const snapshot = await getDocs(q)
                    if (!snapshot.empty) {
                        setHasApplied(true)
                    }
                } catch (error) {
                    console.error("Error checking application status:", error)
                }
            }
        }
        checkApplicationStatus()
    }, [currentUser, job, isCompanyUser])

    const handleAIAnalysis = async () => {
        if (!currentUser || !userProfile) {
            toast.error("Debes iniciar sesión y tener tu perfil completo para usar la IA.")
            router.push("/login")
            return
        }

        setIsAiAnalyzing(true)
        setAiAnalysisResult(null)
        try {
            const endpointJob = {
                title: job.title,
                description: job.description,
                requirements: job.requirements,
                responsibilities: job.responsibilities,
                benefits: job.benefits
            }

            const endpointUser = {
                name: userProfile.displayName || currentUser.email,
                skills: userProfile.skills || [],
                experience: userProfile.experience || [],
                education: userProfile.education || [],
                about: userProfile.about || ""
            }

            const res = await fetch('/api/ai/analyze-candidate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userProfile: endpointUser, jobDescription: endpointJob })
            })

            if (!res.ok) throw new Error("Error en el proveedor de IA")

            const data = await res.json()
            setAiAnalysisResult(data)
            toast.success("Análisis completado exitosamente")
        } catch (error) {
            console.error('AI Analysis failed:', error)
            toast.error("Hubo un problema al contactar la IA. Intenta más tarde.")
        } finally {
            setIsAiAnalyzing(false)
        }
    }

    const handleApplyClick = async () => {
        if (!currentUser) {
            toast.error("Debes iniciar sesión para postularte")
            router.push("/login")
            return
        }

        if (hasApplied) {
            toast.error("Ya te has postulado a esta vacante")
            return
        }

        if (isCompanyUser) {
            toast.error("Las cuentas de empresa no pueden postularse a otras publicaciones")
            return
        }

        // Check applicant limit before opening modal
        if (job.maxApplicants) {
            try {
                const appsQuery = query(
                    collection(db, "applications"),
                    where("jobId", "==", job.id)
                )
                const appsSnapshot = await getDocs(appsQuery)
                if (appsSnapshot.size >= job.maxApplicants) {
                    setIsLimitReached(true)
                    toast.error("Esta vacante ya alcanzó el límite de postulantes")
                    return
                }
            } catch (error) {
                console.error("Error checking applicant limit:", error)
            }
        }

        setIsApplicationOpen(true)
        startApplicationProcess()
    }

    const startApplicationProcess = async () => {
        setAppStep('analyzing')
        setAnalysisProgress(0)

        // Mock Progress Animation
        const interval = setInterval(() => {
            setAnalysisProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval)
                    return 90
                }
                return prev + 10
            })
        }, 500)

        try {
            // 0. Double-check applicant limit
            if (job.maxApplicants) {
                const countQuery = query(
                    collection(db, "applications"),
                    where("jobId", "==", job.id)
                )
                const countSnapshot = await getDocs(countQuery)
                if (countSnapshot.size >= job.maxApplicants) {
                    setIsLimitReached(true)
                    setIsApplicationOpen(false)
                    toast.error("Esta vacante ya alcanzó el límite de postulantes")
                    return
                }
            }

            // 1. Create Application
            const candidateDoc = await getDoc(doc(db, "users", currentUser.uid))
            const candidateProfile = candidateDoc.exists() ? { ...candidateDoc.data(), id: currentUser.uid, name: candidateDoc.data().displayName || currentUser.email } : { id: currentUser.uid, name: currentUser.email, email: currentUser.email }

            const applicationRef = await addDoc(collection(db, "applications"), {
                jobId: job.id,
                jobTitle: job.title || "Oferta de Empleo",
                candidateId: currentUser.uid,
                candidateName: candidateProfile.name || currentUser.email || "Candidato",
                contactEmail: currentUser.email || "",
                companyId: job.companyId || "unknown",
                status: "new",
                createdAt: serverTimestamp(),
                aiScore: null
            })

            // 2. For free plan jobs: skip AI scoring entirely
            const isFreeJob = job.planType === "free"

            if (isFreeJob) {
                clearInterval(interval)
                setAnalysisProgress(100)
                setTimeout(() => {
                    setAppStep('success_standard')
                }, 800)
                return
            }

            // 3. Trigger AI Scoring (paid plans only)
            try {
                const aiResponse = await fetch('/api/ai/score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ job, candidate: candidateProfile })
                })

                if (aiResponse.ok) {
                    const aiData = await aiResponse.json()
                    const score = aiData.overallScore || 0
                    setAiScore(score)

                    await updateDoc(applicationRef, {
                        aiScore: score,
                        aiAnalysis: aiData,
                        aiColor: aiData.colorCode
                    })

                    clearInterval(interval)
                    setAnalysisProgress(100)

                    // Determine Next Step based on Score
                    const minScore = job.minScore || 70

                    setTimeout(() => {
                        if (score >= minScore && job.enableAvatarInterview) {
                            setAppStep('success_interview')
                        } else {
                            setAppStep('success_standard')
                        }
                    }, 1000)
                } else {
                    console.warn("AI Analysis Failed with status", aiResponse.status)
                    clearInterval(interval)
                    setAnalysisProgress(100)
                    setAppStep('success_standard')
                }
            } catch (aiError) {
                console.warn("AI Analysis Error (Timeout/Network):", aiError)
                clearInterval(interval)
                setAnalysisProgress(100)
                setAppStep('success_standard') // Fallback to standard success
            }

        } catch (error) {
            console.error("Critical error applying:", error)
            clearInterval(interval)
            toast.error("Hubo un error crítico enviando tu postulación. Intenta más tarde.")
            setIsApplicationOpen(false)
        }
    }

    const handleSchedule = () => {
        setAppStep('scheduled')
        toast.success("Entrevista agendada exitosamente")
    }

    // Mock Slots for next 2 days
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const slots = [
        { time: "10:00 AM", date: "Hoy" },
        { time: "03:30 PM", date: "Hoy" },
        { time: "09:00 AM", date: "Mañana" },
        { time: "11:00 AM", date: "Mañana" },
    ]

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1890ff]" /></div>
    if (!job) return <div className="min-h-screen flex items-center justify-center">Vacante no encontrada</div>

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Navigation Header */}
            <MainHeader />

            {/* Premium Trillion-Dollar Hero */}
            <section className="relative bg-white overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-100">
                {/* Extreme Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#1890ff]/[0.08] blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/[0.05] blur-[120px] pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
                    {/* Breadcrumb - Subtle */}
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-10 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Explorar otras oportunidades
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-between">
                            {/* Left Content */}
                            <div className="flex-1 max-w-3xl">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-2 flex-shrink-0">
                                        {company?.logoUrl ? (
                                            <img src={company.logoUrl} className="w-full h-full object-contain rounded-xl" />
                                        ) : (
                                            <Building2 className="w-full h-full text-slate-200 p-2" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{company?.name || job.companyName}</h2>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                            <span>{job.industry || "Empresa Confidencial"}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span>{job.publisher || "Publicado recientemente"}</span>
                                        </div>
                                    </div>
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-6">
                                    {job.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="px-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <MapPin className="w-4 h-4 text-[#1890ff]" />
                                        {job.location}
                                    </div>
                                    <div className="px-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <Globe className="w-4 h-4 text-purple-500" />
                                        {job.workMode}
                                    </div>
                                    {job.showSalary !== false && (job.salaryMin || job.salaryMax) && (
                                        <div className="px-4 py-2 bg-green-50/50 border border-green-200/60 rounded-xl flex items-center gap-2 text-sm font-bold text-green-700">
                                            <DollarSign className="w-4 h-4" />
                                            {job.currency} {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Action Area (Desktop Header) */}
                            <div className="flex-shrink-0 w-full lg:w-auto lg:min-w-[280px]">
                                {isCompanyUser ? (
                                    (currentUser?.uid && job.companyId === currentUser.uid) ? (
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                                            <p className="text-sm font-semibold text-slate-500 mb-4 tracking-wide uppercase">Tu Publicación</p>
                                            <Button
                                                onClick={() => router.push(`/empresas/mis-publicaciones/nueva?edit=${job.id}`)}
                                                className="h-12 w-full rounded-xl text-base font-semibold shadow-[0_8px_30px_rgb(24,144,255,0.2)] bg-[#1890ff] hover:bg-blue-600 transition-all text-white"
                                            >
                                                Editar Oferta
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                                            <p className="text-sm font-semibold text-slate-500 mb-4 tracking-wide uppercase">Vista de Empresa</p>
                                            <Button
                                                variant="outline"
                                                className="h-12 w-full rounded-xl text-base font-semibold border-slate-200 hover:bg-white transition-all shadow-sm"
                                            >
                                                Comparar Puesto
                                            </Button>
                                        </div>
                                    )
                                ) : (
                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                        <p className="text-xs font-bold text-slate-400 mb-4 tracking-wider uppercase text-center">
                                            {hasApplied ? "Estado de Postulación" : "Acción Requerida"}
                                        </p>
                                        <Button
                                            className={`h-14 w-full rounded-xl text-lg font-bold transition-all duration-300 shadow-[0_8px_30px_rgb(24,144,255,0.25)] hover:shadow-[0_8px_30px_rgb(24,144,255,0.4)] hover:-translate-y-0.5 ${(isLimitReached || hasApplied) ? 'bg-slate-100 text-slate-400 shadow-none hover:shadow-none hover:translate-y-0 cursor-not-allowed' : 'bg-[#1890ff] text-white hover:bg-blue-600'}`}
                                            onClick={handleApplyClick}
                                            disabled={isLimitReached || hasApplied}
                                        >
                                            {hasApplied ? 'Ya Postulado' : isLimitReached ? 'Vacante Completa' : 'Postular Ahora'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content  */}
            <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="grid lg:grid-cols-3 gap-8"
                >
                    {/* Left Column — Clean Reading Experience */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">
                                Acerca del Puesto
                            </h3>
                            <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-[16px]">
                                {job.description}
                            </div>
                        </div>

                        {/* Layout Divider */}
                        <hr className="border-slate-100" />

                        {/* Responsibilities */}
                        {job.responsibilities?.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">
                                    Lo que harás
                                </h3>
                                <ul className="space-y-4">
                                    {job.responsibilities.map((r: string, i: number) => (
                                        <li key={i} className="flex gap-4 items-start">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#1890ff] mt-2.5 flex-shrink-0" />
                                            <span className="text-slate-600 text-[16px] leading-relaxed">{r}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {job.responsibilities?.length > 0 && <hr className="border-slate-100" />}

                        {/* Requirements */}
                        {job.requirements?.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">
                                    Lo que buscamos
                                </h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {job.requirements.map((req: string, i: number) => (
                                        <div key={i} className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-medium border border-slate-200/60 flex items-center gap-2 hover:bg-white hover:border-slate-300 transition-colors cursor-default shadow-sm shadow-slate-100/50">
                                            {req}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Image Gallery */}
                        {job.images && job.images.length > 0 && (
                            <>
                                <hr className="border-slate-100" />
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Oficinas y Entorno</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {job.images.map((img: string, i: number) => (
                                            <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                                                <img src={img} alt={`Oficina ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column (Glassmorphism Sticky Sidebar) */}
                    <div className="space-y-6 relative">
                        <div className="sticky top-24 bg-white/60 backdrop-blur-2xl rounded-[32px] p-8 border border-white shadow-[0_8px_40px_rgb(0,0,0,0.04)]">
                            {/* Inner ambient glow */}
                            <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)] pointer-events-none" />

                            <div className="relative z-10 text-center mb-8">
                                <div className="w-20 h-20 rounded-[20px] bg-white shadow-xl p-2 mx-auto mb-4 border border-slate-50/50">
                                    {company?.logoUrl ? (
                                        <img src={company.logoUrl} className="w-full h-full object-contain rounded-xl" />
                                    ) : (
                                        <Building2 className="w-full h-full text-slate-300 p-3" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{company?.name || job.companyName}</h3>
                                {company?.website && (
                                    <a href={company.website} target="_blank" className="inline-flex items-center text-sm font-medium text-[#1890ff] hover:text-blue-700 transition-colors gap-1.5">
                                        <Globe className="w-3.5 h-3.5" />
                                        Visitar sitio web
                                    </a>
                                )}
                            </div>

                            {job.address && (
                                <div className="mb-8">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Sede Principal</p>
                                    <p className="text-sm font-medium text-slate-700">{job.address}</p>
                                </div>
                            )}

                            {/* Benefits */}
                            {job.benefits?.length > 0 && (
                                <div className="mb-8">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Beneficios Clave</p>
                                    <ul className="space-y-3">
                                        {job.benefits.slice(0, 4).map((benefit: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                                                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* AI Copilot Card (Candidates) */}
                            {!isCompanyUser && currentUser && (
                                <div className="mb-8 bg-slate-900/5 rounded-2xl p-5 border border-slate-900/5">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <BrainCircuit className="w-4 h-4 text-purple-500" />
                                        Asistente IA
                                    </p>

                                    {!aiAnalysisResult ? (
                                        <Button
                                            variant="ghost"
                                            onClick={handleAIAnalysis}
                                            disabled={isAiAnalyzing}
                                            className="w-full h-10 rounded-xl text-sm font-semibold bg-white shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isAiAnalyzing ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Analizando...</>
                                            ) : (
                                                <><Sparkles className="w-4 h-4" /> Comparar mi perfil</>
                                            )}
                                        </Button>
                                    ) : (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-slate-500">Compatibilidad</span>
                                                <span className={`text-sm font-black ${aiAnalysisResult.matchPercentage >= 75 ? 'text-green-600' : aiAnalysisResult.matchPercentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {aiAnalysisResult.matchPercentage}%
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">"{aiAnalysisResult.recommendation}"</p>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Apply Button Footer Area */}
                            <div className="pt-6 border-t border-slate-200/60">
                                {isCompanyUser ? (
                                    (currentUser?.uid && job.companyId === currentUser.uid) ? (
                                        <Button
                                            onClick={() => router.push(`/empresas/mis-publicaciones/nueva?edit=${job.id}`)}
                                            className="w-full h-14 rounded-2xl text-base font-bold shadow-[0_8px_30px_rgb(24,144,255,0.25)] bg-[#1890ff] hover:bg-blue-600 hover:-translate-y-0.5 transition-all duration-300 text-white"
                                        >
                                            Modificar Publicación
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="w-full h-14 rounded-2xl text-base font-bold border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                                        >
                                            Comparar Empleos
                                        </Button>
                                    )
                                ) : (
                                    <Button
                                        className={`w-full h-14 rounded-2xl text-lg font-bold transition-all duration-300 shadow-[0_8px_30px_rgb(24,144,255,0.25)] hover:shadow-[0_8px_30px_rgb(24,144,255,0.4)] hover:-translate-y-0.5 ${(isLimitReached || hasApplied) ? 'bg-slate-100 text-slate-400 shadow-none hover:shadow-none hover:translate-y-0 cursor-not-allowed border border-slate-200' : 'bg-[#1890ff] text-white hover:bg-blue-600'}`}
                                        onClick={handleApplyClick}
                                        disabled={isLimitReached || hasApplied}
                                    >
                                        {hasApplied ? 'Ya Postulado' : isLimitReached ? 'Vacante Completa' : 'Postular Ahora'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Application Modal (Same logic, slightly better styling) */}
            <Dialog open={isApplicationOpen} onOpenChange={(open) => { if (appStep === 'scheduled' || appStep.includes('success')) setIsApplicationOpen(open) }}>
                <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none p-0 overflow-hidden">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative">
                        {/* Enhanced Modal Content */}
                        <AnimatePresence mode="wait">
                            {appStep === 'analyzing' && (
                                <motion.div
                                    key="analyzing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-10 flex flex-col items-center text-center bg-gradient-to-b from-white to-slate-50"
                                >
                                    <div className="relative w-32 h-32 mb-8">
                                        {/* Rings */}
                                        {[1, 2, 3].map(i => (
                                            <motion.div
                                                key={i}
                                                className="absolute inset-0 border-2 border-[#1890ff]/20 rounded-full"
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                                transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                                            />
                                        ))}
                                        <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full shadow-xl z-10">
                                            <BrainCircuit className="w-12 h-12 text-[#1890ff]" />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Analizando perfil...</h3>
                                    <p className="text-slate-500 mb-8 max-w-xs mx-auto">Nuestra IA está comparando tus habilidades con los requisitos del puesto.</p>

                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-[#1890ff] to-blue-400"
                                            animate={{ width: `${analysisProgress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between w-full text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        <span>Procesando</span>
                                        <span>{analysisProgress}%</span>
                                    </div>
                                </motion.div>
                            )}

                            {appStep === 'success_interview' && (
                                <motion.div
                                    key="interview"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-8 bg-white"
                                >
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Sparkles className="w-8 h-8 text-green-600" />
                                    </div>

                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Perfil Destacado!</h3>
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full font-medium text-sm">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Compatibilidad: {aiScore}%
                                        </div>
                                    </div>

                                    <h4 className="font-semibold text-slate-900 mb-4 px-1">Disponibilidad para entrevista:</h4>
                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        {slots.map((slot, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedSlot(`${slot.date} ${slot.time}`)}
                                                className={`p-4 rounded-xl border text-sm text-center transition-all duration-200 ${selectedSlot?.includes(slot.time) ? 'border-[#1890ff] bg-blue-50 text-[#1890ff] ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                                            >
                                                <div className="font-bold text-base mb-1">{slot.time}</div>
                                                <div className="text-slate-500 text-xs uppercase tracking-wide">{slot.date}</div>
                                            </button>
                                        ))}
                                    </div>

                                    <Button
                                        className="w-full h-12 rounded-xl text-base font-semibold btn-primary"
                                        onClick={handleSchedule}
                                        disabled={!selectedSlot}
                                    >
                                        Confirmar Entrevista
                                    </Button>
                                </motion.div>
                            )}

                            {/* Keep other states simple for now */}
                            {(appStep === 'success_standard' || appStep === 'scheduled') && (
                                <motion.div
                                    key="finish"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-10 text-center"
                                >
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${appStep === 'scheduled' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-[#1890ff]'}`}>
                                        {appStep === 'scheduled' ? <Calendar className="w-10 h-10" /> : <Check className="w-10 h-10" />}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                        {appStep === 'scheduled' ? '¡Todo Listo!' : '¡Enviado!'}
                                    </h3>
                                    <p className="text-slate-500 mb-8">
                                        {appStep === 'scheduled'
                                            ? `Tu entrevista ha sido agendada para: ${selectedSlot}`
                                            : "Hemos enviado tu postulación exitosamente."}
                                    </p>
                                    <Button onClick={() => setIsApplicationOpen(false)} variant="outline" className="w-full h-12 rounded-xl border-slate-200">
                                        Cerrar
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
