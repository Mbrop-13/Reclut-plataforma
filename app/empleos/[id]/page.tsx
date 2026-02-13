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
        <div className="min-h-screen bg-[hsl(var(--gray-100))]">
            {/* ... (Header kept same as before, simplified for brevity in this tool call) ... */}
            <motion.header
                initial={{ y: 0 }}
                animate={{ y: headerVisible ? 0 : -100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20"
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-[#1890ff] flex items-center justify-center shadow-lg shadow-[#1890ff]/25">
                                <span className="text-white font-bold text-lg">R</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight hidden sm:block">
                                <span className="text-[#1890ff]">Re</span>
                                <span className="text-[hsl(var(--gray-900))]">clut</span>
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={() => router.push('/empresas/dashboard')}>Soy Empresa</Button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="pt-28 px-6 lg:px-8 max-w-6xl mx-auto">
                <Link href="/empleos" className="inline-flex items-center gap-2 text-[hsl(var(--gray-600))] hover:text-[#1890ff] mb-6">
                    <ArrowLeft className="w-4 h-4" /> Volver
                </Link>

                <div className="bg-white rounded-3xl overflow-hidden shadow-xl mb-8 p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
                            {company?.logoUrl ? <img src={company.logoUrl} className="w-full h-full object-contain rounded-2xl" /> : <Building2 className="w-10 h-10 text-gray-400" />}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-[hsl(var(--gray-900))] mb-2">{job.title}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-600">
                                <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {company?.name || 'Empresa'}</span>
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location} ({job.workMode})</span>
                                <span className="flex items-center gap-1.5 text-[#1890ff] font-medium"><DollarSign className="w-4 h-4" /> {job.currency} {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()}</span>
                            </div>
                        </div>
                        <Button className="btn-primary h-12 px-8 rounded-full text-base" onClick={handleApplyClick}>Postular Ahora</Button>
                    </div>
                    {/* Tags */}
                    <div className="mt-8 flex flex-wrap gap-2">
                        {job.requirements?.slice(0, 5).map((req: string, i: number) => (
                            <span key={i} className="badge-secondary px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full">{req}</span>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 pb-16">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Sobre el puesto</h2>
                            <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
                        </div>
                        {job.responsibilities?.length > 0 && (
                            <div className="bg-white rounded-2xl p-8 shadow-sm">
                                <h2 className="text-xl font-bold mb-4">Responsabilidades</h2>
                                <ul className="space-y-3">
                                    {job.responsibilities.map((r: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-gray-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> {r}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {job.requirements?.length > 0 && (
                            <div className="bg-white rounded-2xl p-8 shadow-sm">
                                <h2 className="text-xl font-bold mb-4">Requisitos</h2>
                                <ul className="space-y-3">
                                    {job.requirements.map((r: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-gray-600"><CheckCircle2 className="w-5 h-5 text-[#1890ff] shrink-0" /> {r}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="space-y-6">
                        {job.benefits?.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h3 className="font-bold mb-4">Beneficios</h3>
                                <ul className="space-y-3">
                                    {job.benefits.map((b: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-gray-600"><Heart className="w-4 h-4 text-red-500 shrink-0" /> {b}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold mb-4">Empresa</h3>
                            <p className="text-sm text-gray-600 mb-4">{company?.description || "Empresa lider en su sector."}</p>
                            {company?.website && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Globe className="w-4 h-4" />
                                    <a href={company.website} target="_blank" className="text-[#1890ff] hover:underline">Visitar Sitio</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Modal Flow */}
            <Dialog open={isApplicationOpen} onOpenChange={(open) => { if (appStep === 'scheduled' || appStep.includes('success')) setIsApplicationOpen(open) }}>
                <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none p-0">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                        <AnimatePresence mode="wait">
                            {appStep === 'analyzing' && (
                                <motion.div
                                    key="analyzing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-8 flex flex-col items-center text-center py-12"
                                >
                                    <div className="relative w-24 h-24 mb-6">
                                        <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
                                        <motion.div
                                            className="absolute inset-0 border-4 border-[#1890ff] rounded-full border-t-transparent"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <BrainCircuit className="w-8 h-8 text-[#1890ff]" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Analizando perfil...</h3>
                                    <p className="text-gray-500 text-sm mb-6">Nuestra IA está evaluando tu compatibilidad con el puesto.</p>

                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-[#1890ff]"
                                            animate={{ width: `${analysisProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">{analysisProgress}% Completado</p>
                                </motion.div>
                            )}

                            {appStep === 'success_interview' && (
                                <motion.div
                                    key="interview"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6"
                                >
                                    <div className="bg-green-50 rounded-xl p-4 mb-6 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-green-800">¡Perfil Destacado!</h3>
                                            <p className="text-sm text-green-700">Tu compatibilidad es del {aiScore}%. Te invitamos a una entrevista.</p>
                                        </div>
                                    </div>

                                    <h4 className="font-semibold mb-3">Agenda tu entrevista virtual</h4>
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {slots.map((slot, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedSlot(`${slot.date} ${slot.time}`)}
                                                className={`p-3 rounded-lg border text-sm text-center transition-all ${selectedSlot?.includes(slot.time) ? 'border-[#1890ff] bg-blue-50 text-[#1890ff]' : 'border-gray-200 hover:border-[#1890ff]'}`}
                                            >
                                                <div className="font-medium">{slot.date}</div>
                                                <div className="text-gray-500">{slot.time}</div>
                                            </button>
                                        ))}
                                    </div>

                                    <Button
                                        className="w-full btn-primary"
                                        onClick={handleSchedule}
                                        disabled={!selectedSlot}
                                    >
                                        Confirmar Entrevista
                                    </Button>
                                </motion.div>
                            )}

                            {appStep === 'success_standard' && (
                                <motion.div
                                    key="standard"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-8 text-center"
                                >
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1890ff]">
                                        <Check className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">¡Postulación Enviada!</h3>
                                    <p className="text-gray-500 text-sm mb-6">
                                        Hemos recibido tu perfil. El equipo de {company?.name} revisará tu solicitud y te contactará si avanzas a la siguiente etapa.
                                    </p>
                                    <Button onClick={() => setIsApplicationOpen(false)} variant="outline" className="w-full">
                                        Volver a empleos
                                    </Button>
                                </motion.div>
                            )}

                            {appStep === 'scheduled' && (
                                <motion.div
                                    key="scheduled"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-8 text-center"
                                >
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                                        <Calendar className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">¡Entrevista Agendada!</h3>
                                    <p className="text-gray-500 text-sm mb-6">
                                        Tu entrevista con el Agente de IA ha sido confirmada para: <br />
                                        <span className="font-semibold text-gray-900">{selectedSlot}</span>
                                    </p>
                                    <div className="bg-gray-50 p-4 rounded-xl text-xs text-left text-gray-500 mb-6">
                                        <p>• Recibirás un enlace por correo.</p>
                                        <p>• Asegúrate de tener cámara y micrófono.</p>
                                        <p>• La entrevista durará aprox. 15 min.</p>
                                    </div>
                                    <Button onClick={() => setIsApplicationOpen(false)} className="w-full btn-primary">
                                        Entendido
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
