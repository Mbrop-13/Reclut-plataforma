"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    MapPin, Building2, CheckCircle2,
    DollarSign, Heart, ArrowLeft,
    Calendar, Globe, Loader2, BrainCircuit, Sparkles, Check, Clock
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { doc, getDoc, addDoc, collection, updateDoc, serverTimestamp } from "firebase/firestore"
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
    const router = useRouter()

    const [headerVisible, setHeaderVisible] = useState(true)
    const { scrollY } = useScroll()

    // Application Flow State
    const [isApplicationOpen, setIsApplicationOpen] = useState(false)
    const [appStep, setAppStep] = useState<'idle' | 'analyzing' | 'success_interview' | 'success_standard' | 'scheduled'>('idle')
    const [analysisProgress, setAnalysisProgress] = useState(0)
    const [aiScore, setAiScore] = useState<number | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

    // Dynamic header
    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0
        if (latest > previous && latest > 100) {
            setHeaderVisible(false)
        } else {
            setHeaderVisible(true)
        }
    })



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

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user)
        })

        fetchJob()
        return () => unsubscribe()
    }, [params.id])


    const handleApplyClick = () => {
        if (!currentUser) {
            toast.error("Debes iniciar sesión para postularte")
            router.push("/login")
            return
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
            // 1. Create Application
            const candidateDoc = await getDoc(doc(db, "users", currentUser.uid))
            const candidateProfile = candidateDoc.exists() ? { ...candidateDoc.data(), id: currentUser.uid, name: candidateDoc.data().displayName || currentUser.email } : { id: currentUser.uid, name: currentUser.email, email: currentUser.email }

            const applicationRef = await addDoc(collection(db, "applications"), {
                jobId: job.id,
                jobTitle: job.title,
                candidateId: currentUser.uid,
                candidateName: candidateProfile.name,
                contactEmail: currentUser.email,
                companyId: job.companyId,
                status: "new",
                createdAt: serverTimestamp(),
                aiScore: null
            })

            // 2. Trigger AI Scoring
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

                // 3. Determine Next Step based on Score
                const minScore = job.minScore || 70

                // Demo Delay for UX
                setTimeout(() => {
                    if (score >= minScore && job.enableAvatarInterview) {
                        setAppStep('success_interview')
                    } else {
                        setAppStep('success_standard')
                    }
                }, 1000)

            } else {
                throw new Error("AI Analysis Failed")
            }

        } catch (error) {
            console.error("Error applying:", error)
            setAppStep('success_standard') // Fallback
            toast.error("Error en el análisis, pero tu postulación fue enviada.")
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
            <motion.header
                initial={{ y: 0 }}
                animate={{ y: headerVisible ? 0 : -100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-[#1890ff] flex items-center justify-center shadow-lg shadow-[#1890ff]/20">
                                <span className="text-white font-bold text-lg">R</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight hidden sm:block text-slate-900">
                                Re<span className="text-[#1890ff]">clut</span>
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" className="hidden md:flex">Para Candidatos</Button>
                            <Button variant="ghost" onClick={() => router.push('/empresas/dashboard')}>Soy Empresa</Button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Hero Section with Blurred Background */}
            <div className="relative w-full h-[500px] overflow-hidden">
                {/* Background Layer */}
                <div className="absolute inset-0 bg-slate-900">
                    {company?.logoUrl ? (
                        <img
                            src={company.logoUrl}
                            alt="Background"
                            className="w-full h-full object-cover opacity-30 blur-[60px] scale-125 transform"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-900 via-slate-900 to-black opacity-80" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-black/20" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 h-full pt-32 flex flex-col justify-start">
                    <Link href="/empleos" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 w-fit bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 hover:bg-black/30">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Volver a empleos</span>
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white max-w-3xl"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-[#1890ff] text-white text-xs font-bold shadow-lg shadow-blue-500/30">
                                {job.workMode}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-md border border-white/10">
                                {job.publisher || "Publicado hace 2 días"}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                            {job.title}
                        </h1>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Container - Floating Up */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-32 relative z-20 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid lg:grid-cols-3 gap-8"
                >
                    {/* Left Column (Main Info) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Floating Glass Card */}
                        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 border border-white">
                            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-8 border-b border-gray-100 pb-8">
                                <div className="w-24 h-24 rounded-2xl bg-white shadow-lg p-2 flex-shrink-0 border border-gray-100">
                                    {company?.logoUrl ? (
                                        <img src={company.logoUrl} className="w-full h-full object-contain rounded-xl" />
                                    ) : (
                                        <Building2 className="w-full h-full text-gray-300 p-4" />
                                    )}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{company?.name}</h2>
                                    <div className="flex flex-wrap text-slate-500 gap-x-6 gap-y-2 justify-center md:justify-start">
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-[#1890ff]" /> {job.location}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                            <span className="font-medium text-slate-700">
                                                {job.currency} {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <Button
                                        className="h-14 px-8 rounded-2xl text-lg font-semibold shadow-xl shadow-blue-500/20 bg-[#1890ff] hover:bg-blue-600 hover:scale-105 transition-all w-full md:w-auto"
                                        onClick={handleApplyClick}
                                    >
                                        Postular Ahora
                                    </Button>
                                    <p className="text-xs text-center text-gray-400 mt-2">Aplica en 2 minutos</p>
                                </div>
                            </div>

                            {/* Skills Tags */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Habilidades Requeridas</h3>
                                <div className="flex flex-wrap gap-2">
                                    {job.requirements?.slice(0, 6).map((req: string, i: number) => (
                                        <div key={i} className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-medium border border-slate-200 flex items-center gap-2 hover:border-[#1890ff]/50 hover:bg-blue-50 transition-colors cursor-default">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#1890ff]" />
                                            {req}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <div className="prose prose-blue max-w-none">
                                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#1890ff]" />
                                    Descripción del Puesto
                                </h3>
                                <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                                    {job.description}
                                </div>
                            </div>
                        </div>

                        {/* Requirements List */}
                        {job.requirements?.length > 0 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-[#1890ff]" />
                                    Requisitos Principales
                                </h3>
                                <ul className="grid gap-4">
                                    {job.requirements.map((req: string, i: number) => (
                                        <li key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-3.5 h-3.5 text-[#1890ff]" />
                                            </div>
                                            <span className="text-slate-700">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Right Column (Sticky Sidebar) */}
                    <div className="space-y-6">
                        {/* Company Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Sobre la Empresa</h3>
                                <div className="w-12 h-1 bg-[#1890ff] mx-auto rounded-full" />
                            </div>

                            <p className="text-sm text-slate-600 leading-relaxed mb-6 text-center">
                                {company?.description || "Una empresa líder comprometida con la innovación y el desarrollo de talento."}
                            </p>

                            <div className="space-y-3 mb-6">
                                {company?.website && (
                                    <a href={company.website} target="_blank" className="flex items-center justify-center w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:border-[#1890ff] hover:text-[#1890ff] transition-colors text-sm font-medium gap-2">
                                        <Globe className="w-4 h-4" />
                                        Visitar Sitio Web
                                    </a>
                                )}
                            </div>

                            {/* Benefits */}
                            {job.benefits?.length > 0 && (
                                <div className="pt-6 border-t border-slate-100">
                                    <h4 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-wide">Beneficios</h4>
                                    <ul className="space-y-3">
                                        {job.benefits.map((benefit: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                                <Heart className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
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
