"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft, AlertTriangle, Sparkles, Lock, Crown,
    Briefcase, MapPin, DollarSign, FileText, Settings2, CheckCircle2,
    Image as ImageIcon, X, Upload, Plus, Clock, Layers, Building2,
    Globe, GripVertical, Eye, EyeOff, Trash2, BrainCircuit, Loader2, Check, RefreshCw, Monitor
} from "lucide-react"
import { doc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, addDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "sonner"
import Link from "next/link"
import { LocationInput } from "@/components/ui/location-input"

const JOB_TYPES = ["Tiempo Completo", "Medio Tiempo", "Freelance", "Pasantía", "Por Proyecto"]
const EXPERIENCE_LEVELS = ["Sin experiencia", "1-2 años", "3-5 años", "5+ años", "10+ años"]
const INDUSTRIES = [
    "Tecnología", "Fintech", "E-commerce", "Salud y Biotech", "Consultoría",
    "Educación", "Marketing Digital", "Logística", "Ciberseguridad",
    "Inteligencia Artificial", "Recursos Humanos", "Legal",
    "Energía y Sostenibilidad", "Seguros", "Telecomunicaciones",
    "Automotriz", "Banca y Finanzas", "Gobierno", "Retail", "Startups",
    "Agroindustria", "Turismo y Hospitalidad"
]
const CURRENCIES = [
    { code: "USD", label: "USD ($)", symbol: "$" },
    { code: "CLP", label: "CLP ($)", symbol: "$" },
    { code: "MXN", label: "MXN ($)", symbol: "$" },
    { code: "EUR", label: "EUR (€)", symbol: "€" },
    { code: "COP", label: "COP ($)", symbol: "$" },
    { code: "ARS", label: "ARS ($)", symbol: "$" },
]

export default function NuevaPublicacionPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const editJobId = searchParams.get('edit')
    const isEditing = !!editJobId
    const [isLoading, setIsLoading] = useState(true)
    const [plan, setPlan] = useState<string>("free")
    const [existingJobCount, setExistingJobCount] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [companyName, setCompanyName] = useState("")

    // Form state
    const [title, setTitle] = useState("")
    const [location, setLocation] = useState("")
    const [address, setAddress] = useState("")
    const [workMode, setWorkMode] = useState("Presencial")
    const [jobType, setJobType] = useState("Tiempo Completo")
    const [experienceLevel, setExperienceLevel] = useState("3-5 años")
    const [industry, setIndustry] = useState("")
    const [showSalary, setShowSalary] = useState(true)
    const [salaryMin, setSalaryMin] = useState("")
    const [salaryMax, setSalaryMax] = useState("")
    const [currency, setCurrency] = useState("USD")
    const [description, setDescription] = useState("")
    const [responsibilities, setResponsibilities] = useState("")
    const [requirements, setRequirements] = useState("")
    const [benefits, setBenefits] = useState("")
    const [images, setImages] = useState<{ file: File; url: string }[]>([])
    const [minScore, setMinScore] = useState(75)
    const [enableAvatarInterview, setEnableAvatarInterview] = useState(false)

    // AI Assist
    const [isAiAnalyzing, setIsAiAnalyzing] = useState(false)
    const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleAnalyzeMarket = async () => {
        if (!title.trim() || !description.trim()) {
            toast.error("Debes completar el título y la descripción para que la IA pueda analizar.")
            return
        }

        setIsAiAnalyzing(true)
        setAiAnalysisResult(null)
        try {
            const draftJob = {
                title, description, requirements, responsibilities,
                benefits, salaryMin, salaryMax, currency, industry
            }

            // Fetch a few market jobs to compare
            let marketJobs: any[] = []
            if (industry) {
                const marketQuery = query(collection(db, "jobs"), where("industry", "==", industry))
                const snapshot = await getDocs(marketQuery)
                marketJobs = snapshot.docs.map(d => d.data()).filter(j => j.title !== title).slice(0, 4)
            }

            const res = await fetch('/api/ai/analyze-posting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ draftJob, marketJobs })
            })

            if (!res.ok) throw new Error("Error interno IA")
            const data = await res.json()
            setAiAnalysisResult(data)
            toast.success("¡Análisis de mercado completado!")
        } catch (error) {
            console.error(error)
            toast.error("Error al contactar al Copiloto IA")
        } finally {
            setIsAiAnalyzing(false)
        }
    }

    const isFreePlan = !plan || plan === "free"
    const hasReachedFreeLimit = isFreePlan && existingJobCount >= 1

    // Calculate form completion
    const completedSections = [
        title.trim().length > 0,
        location.trim().length > 0,
        description.trim().length > 0,
        requirements.trim().length > 0,
    ].filter(Boolean).length
    const totalSections = 4
    const progress = Math.round((completedSections / totalSections) * 100)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/login")
                return
            }

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid))
                if (userDoc.exists()) {
                    const data = userDoc.data()
                    setPlan(data.plan || "free")
                    setCompanyName(data.companyName || data.name || "")
                }

                const jobsQuery = query(
                    collection(db, "jobs"),
                    where("companyId", "==", user.uid)
                )
                const jobsSnapshot = await getDocs(jobsQuery)
                setExistingJobCount(jobsSnapshot.size)
            } catch (error) {
                console.error("Error checking plan:", error)
            } finally {
                setIsLoading(false)
            }
        })

        return () => unsubscribe()
    }, [router])

    // Fetch job data if editing
    useEffect(() => {
        if (!editJobId) return

        const fetchJob = async () => {
            setIsLoading(true)
            try {
                const jobDoc = await getDoc(doc(db, "jobs", editJobId))
                if (jobDoc.exists()) {
                    const data = jobDoc.data()
                    setTitle(data.title || "")
                    setLocation(data.location || "")
                    setAddress(data.address || "")
                    setWorkMode(data.workMode || "Presencial")
                    setJobType(data.jobType || "Tiempo Completo")
                    setExperienceLevel(data.experienceLevel || "3-5 años")
                    setIndustry(data.industry || "")
                    setShowSalary(data.showSalary !== false)
                    setSalaryMin(data.salaryMin?.toString() || "")
                    setSalaryMax(data.salaryMax?.toString() || "")
                    setCurrency(data.currency || "USD")
                    setDescription(data.description || "")
                    setResponsibilities(data.responsibilities?.join("\n") || "")
                    setRequirements(data.requirements?.join("\n") || "")
                    setBenefits(data.benefits?.join("\n") || "")
                    setMinScore(data.minScore || 75)
                    setEnableAvatarInterview(data.enableAvatarInterview || false)

                    // Handle images if they exist
                    if (data.images && Array.isArray(data.images)) {
                        setImages(data.images.map((url: string) => ({ file: new File([], "image"), url })))
                    }
                } else {
                    toast.error("La publicación no existe")
                    router.push("/empresas/mis-publicaciones")
                }
            } catch (error) {
                console.error("Error fetching job:", error)
                toast.error("Error al cargar la publicación")
            } finally {
                setIsLoading(false)
            }
        }

        fetchJob()
    }, [editJobId, router])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        const remaining = 4 - images.length
        const newFiles = Array.from(files).slice(0, remaining)

        newFiles.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} excede el límite de 5MB`)
                return
            }
            const url = URL.createObjectURL(file)
            setImages(prev => [...prev, { file, url }])
        })

        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const removeImage = (index: number) => {
        setImages(prev => {
            const updated = [...prev]
            URL.revokeObjectURL(updated[index].url)
            updated.splice(index, 1)
            return updated
        })
    }

    async function uploadImages(): Promise<string[]> {
        if (images.length === 0) return []
        const urls: string[] = []

        try {
            const { getStorage, ref, uploadBytes, getDownloadURL } = await import("firebase/storage")
            const storage = getStorage()

            for (const img of images) {
                const timestamp = Date.now()
                const storageRef = ref(storage, `job-images/${auth.currentUser?.uid}/${timestamp}-${img.file.name}`)
                const snapshot = await uploadBytes(storageRef, img.file)
                const downloadUrl = await getDownloadURL(snapshot.ref)
                urls.push(downloadUrl)
            }
        } catch (error) {
            console.error("Error uploading images:", error)
            toast.error("Error al subir imágenes, la publicación se creará sin ellas")
        }

        return urls
    }

    async function onSubmit() {
        if (!title.trim()) { toast.error("El título es requerido"); return }
        if (!location.trim()) { toast.error("La ubicación es requerida"); return }
        if (!description.trim()) { toast.error("La descripción es requerida"); return }
        if (showSalary && salaryMin && salaryMax && Number(salaryMin) > Number(salaryMax)) {
            toast.error("El salario mínimo no puede ser mayor al máximo"); return
        }

        if (!isEditing && isFreePlan && existingJobCount >= 1) {
            toast.error("Ya alcanzaste el límite de 1 publicación en el plan gratuito")
            return
        }

        setIsSubmitting(true)

        try {
            const imageUrls = await uploadImages()

            const jobData: any = {
                title: title.trim(),
                description: description.trim(),
                location: location.trim(),
                address: address.trim() || null,
                workMode,
                jobType,
                experienceLevel,
                industry: industry || null,
                showSalary,
                salaryMin: showSalary ? Number(salaryMin) || 0 : null,
                salaryMax: showSalary ? Number(salaryMax) || 0 : null,
                currency: showSalary ? currency : null,
                companyId: auth.currentUser?.uid,
                companyName: companyName,
                status: "active",
                createdAt: serverTimestamp(),
                requirements: requirements.split("\n").filter(Boolean),
                responsibilities: responsibilities.split("\n").filter(Boolean),
                benefits: benefits.split("\n").filter(Boolean),
                images: imageUrls,
                planType: isFreePlan ? "free" : plan,
                maxApplicants: isFreePlan ? 5 : null,
            }

            if (!isFreePlan) {
                jobData.minScore = minScore
                jobData.enableAvatarInterview = enableAvatarInterview
            } else {
                jobData.minScore = 0
                jobData.enableAvatarInterview = false
            }

            const { collection, addDoc, updateDoc, doc } = await import("firebase/firestore")

            if (isEditing) {
                await updateDoc(doc(db, "jobs", editJobId), {
                    ...jobData,
                    updatedAt: serverTimestamp(),
                    createdAt: undefined // Don't update creation date
                })
                toast.success("¡Publicación actualizada exitosamente!")
            } else {
                await addDoc(collection(db, "jobs"), jobData)
                toast.success("¡Publicación creada exitosamente!")
            }

            router.push("/empresas/mis-publicaciones")
        } catch (error) {
            console.error(error)
            toast.error(`Error al ${isEditing ? "actualizar" : "crear"} la publicación`)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-12 min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1890ff]" />
            </div>
        )
    }

    if (hasReachedFreeLimit) {
        return (
            <div className="p-6 lg:p-8 max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                >
                    <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-3">
                        Límite de publicaciones alcanzado
                    </h1>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Tu plan gratuito solo permite <strong>1 publicación activa</strong>.
                        Mejora tu plan para publicar más y acceder a entrevistas con IA.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/empresas/mis-publicaciones">
                            <Button variant="outline" className="rounded-xl h-11 px-6">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Mis Publicaciones
                            </Button>
                        </Link>
                        <Link href="/empresas/planes">
                            <Button className="bg-[#1890ff] hover:bg-blue-600 text-white rounded-xl h-11 px-6 shadow-lg shadow-blue-500/20">
                                <Crown className="w-4 h-4 mr-2" />
                                Mejorar Plan
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        )
    }

    const inputClass = "flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:border-transparent focus:bg-white transition-all"
    const textareaClass = "flex w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:border-transparent focus:bg-white transition-all resize-none"
    const labelClass = "text-sm font-medium text-slate-700"

    return (
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto pb-20">
            {/* Back link */}
            <Link
                href="/empresas/mis-publicaciones"
                className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 transition-colors group"
            >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 group-hover:bg-slate-200 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Volver a mis publicaciones
            </Link>

            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                {/* LEFT COLUMN: THE FORM */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Header with progress */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                                    {isEditing ? "Editar Publicación" : "Nueva Oferta de Empleo"}
                                </h1>
                                <p className="text-slate-500 mt-2 text-lg">
                                    {isEditing ? "Modifica los detalles de tu oferta de empleo" : "Completa la información para atraer a los mejores candidatos."}
                                </p>
                            </div>
                            <div className="hidden md:flex flex-col items-end gap-2">
                                <span className="text-sm font-bold text-[#1890ff] uppercase tracking-wider">{progress}% Completado</span>
                                <div className="w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-[#1890ff] to-blue-400 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Free plan warning banner */}
                    {isFreePlan && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/60 rounded-2xl mb-8"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-amber-100 flex items-center justify-center flex-shrink-0">
                                    <Crown className="w-6 h-6 text-amber-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-amber-900 mb-1">Plan Gratuito Activo</h3>
                                    <p className="text-sm text-amber-700 leading-relaxed mb-3">
                                        Tienes un límite de <strong>1 publicación activa</strong> y <strong>5 postulantes</strong> por oferta. Las herramientas con IA están desactivadas.
                                    </p>
                                    <Link
                                        href="/empresas/planes"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 bg-amber-100/50 hover:bg-amber-100 px-4 py-2 rounded-lg transition-colors border border-amber-200/50"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Desbloquear todo el potencial
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="space-y-6">
                        {/* ============== SECTION 1: Basic Info ============== */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-[#1890ff]" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900">Información del Puesto</h2>
                                    <p className="text-xs text-slate-500">Datos principales de la publicación</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {/* Title */}
                                <div className="space-y-2">
                                    <label className={labelClass}>Título del Puesto <span className="text-red-400">*</span></label>
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className={inputClass}
                                        placeholder="Ej. Senior React Developer"
                                    />
                                </div>

                                {/* Location + Work Mode */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className={labelClass}>Ubicación <span className="text-red-400">*</span></label>
                                        <LocationInput
                                            value={location}
                                            onChange={setLocation}
                                            placeholder="Escribe una ciudad o región..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Modalidad</label>
                                        <select
                                            value={workMode}
                                            onChange={(e) => setWorkMode(e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="Presencial">Presencial</option>
                                            <option value="Híbrido">Híbrido</option>
                                            <option value="Remoto">Remoto</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <label className={labelClass}>
                                        Dirección de la Oficina
                                        <span className="text-xs text-slate-400 ml-2 font-normal">(opcional)</span>
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className={`${inputClass} pl-10`}
                                            placeholder="Ej. Av. Providencia 1234, Oficina 501, Santiago"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400">Se mostrará en la publicación para que los candidatos conozcan la ubicación exacta</p>
                                </div>

                                {/* Job Type + Experience + Industry */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className={labelClass}>Tipo de Empleo</label>
                                        <select
                                            value={jobType}
                                            onChange={(e) => setJobType(e.target.value)}
                                            className={inputClass}
                                        >
                                            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Experiencia Requerida</label>
                                        <select
                                            value={experienceLevel}
                                            onChange={(e) => setExperienceLevel(e.target.value)}
                                            className={inputClass}
                                        >
                                            {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Industria</label>
                                        <select
                                            value={industry}
                                            onChange={(e) => setIndustry(e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* ============== SECTION 2: Salary ============== */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900">Compensación</h2>
                                        <p className="text-xs text-slate-500">Rango salarial de la posición</p>
                                    </div>
                                </div>

                                {/* Show Salary Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setShowSalary(!showSalary)}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all border ${showSalary
                                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                                        }`}
                                >
                                    {showSalary ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    {showSalary ? "Visible" : "Oculto"}
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {showSalary ? (
                                    <motion.div
                                        key="salary-fields"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                    >
                                        <div className="space-y-2">
                                            <label className={labelClass}>Salario Mínimo</label>
                                            <input
                                                value={salaryMin}
                                                onChange={(e) => setSalaryMin(e.target.value)}
                                                type="number"
                                                className={inputClass}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClass}>Salario Máximo</label>
                                            <input
                                                value={salaryMax}
                                                onChange={(e) => setSalaryMax(e.target.value)}
                                                type="number"
                                                className={inputClass}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClass}>Moneda</label>
                                            <select
                                                value={currency}
                                                onChange={(e) => setCurrency(e.target.value)}
                                                className={inputClass}
                                            >
                                                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                                            </select>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="salary-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200"
                                    >
                                        <EyeOff className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">Salario oculto</p>
                                            <p className="text-xs text-slate-400">Se mostrará como &quot;A convenir&quot; en la publicación</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* ============== SECTION 3: Description & Requirements ============== */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900">Descripción y Requisitos</h2>
                                    <p className="text-xs text-slate-500">Detalla el puesto para atraer al mejor talento</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className={labelClass}>Descripción del Puesto <span className="text-red-400">*</span></label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={5}
                                        className={textareaClass}
                                        placeholder="Describe las responsabilidades, el contexto del rol, el equipo de trabajo, y lo que hace especial a esta posición..."
                                    />
                                    <p className="text-xs text-slate-400 text-right">{description.length} caracteres</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className={labelClass}>Responsabilidades <span className="text-xs text-slate-400 font-normal">(una por línea)</span></label>
                                        <textarea
                                            value={responsibilities}
                                            onChange={(e) => setResponsibilities(e.target.value)}
                                            rows={4}
                                            className={textareaClass}
                                            placeholder={"Liderar equipo de desarrollo\nDiseñar arquitectura\nCode reviews"}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Requisitos <span className="text-red-400">*</span> <span className="text-xs text-slate-400 font-normal">(uno por línea)</span></label>
                                        <textarea
                                            value={requirements}
                                            onChange={(e) => setRequirements(e.target.value)}
                                            rows={4}
                                            className={textareaClass}
                                            placeholder={"5+ años en React\nTypeScript\nAPIs REST"}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={labelClass}>Beneficios <span className="text-xs text-slate-400 font-normal">(opcional, uno por línea)</span></label>
                                    <textarea
                                        value={benefits}
                                        onChange={(e) => setBenefits(e.target.value)}
                                        rows={3}
                                        className={textareaClass}
                                        placeholder={"Seguro médico\nHorario flexible\nTrabajo remoto\nBonos trimestrales"}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* ============== SECTION 4: Images ============== */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-pink-600" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900">Fotos del Lugar de Trabajo</h2>
                                    <p className="text-xs text-slate-500">Opcional — Muestra tus oficinas a los candidatos (máx. 4 fotos)</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 group">
                                        <img src={img.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium">
                                            {i + 1}/{images.length}
                                        </div>
                                    </div>
                                ))}

                                {images.length < 4 && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 hover:border-[#1890ff] hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                                            <Upload className="w-5 h-5 text-slate-400 group-hover:text-[#1890ff] transition-colors" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-400 group-hover:text-[#1890ff] transition-colors">Subir foto</span>
                                    </button>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                            />

                            {images.length > 0 && (
                                <p className="text-xs text-slate-400 mt-3">{images.length}/4 fotos subidas</p>
                            )}
                        </motion.div>

                        {/* ============== SECTION 5: AI Settings ============== */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className={`rounded-2xl border p-6 lg:p-8 shadow-sm relative ${isFreePlan ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200"}`}
                        >
                            {isFreePlan && (
                                <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[1px] rounded-2xl z-10 flex flex-col items-center justify-center">
                                    <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center mb-3">
                                        <Lock className="w-7 h-7 text-slate-400" />
                                    </div>
                                    <p className="font-semibold text-slate-600 mb-1">Función Premium</p>
                                    <p className="text-sm text-slate-500 text-center max-w-xs mb-4">
                                        Entrevistas con IA y scoring automático disponibles en planes pagados
                                    </p>
                                    <Link href="/empresas/planes">
                                        <Button size="sm" className="bg-[#1890ff] hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
                                            <Crown className="w-3.5 h-3.5 mr-1.5" />
                                            Ver Planes
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-[#1890ff]" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900">IA y Entrevistas</h2>
                                    <p className="text-xs text-slate-500">Configura la evaluación automática de candidatos</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={labelClass}>Puntaje Mínimo para Entrevista (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={minScore}
                                        onChange={(e) => setMinScore(Number(e.target.value))}
                                        disabled={isFreePlan}
                                        className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                                    />
                                    <p className="text-xs text-slate-500">
                                        Candidatos con este puntaje o superior serán invitados a entrevista.
                                    </p>
                                </div>

                                <div className="flex items-start gap-3 mt-1">
                                    <input
                                        type="checkbox"
                                        checked={enableAvatarInterview}
                                        onChange={(e) => setEnableAvatarInterview(e.target.checked)}
                                        id="enableAvatarInterview"
                                        disabled={isFreePlan}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1890ff] focus:ring-[#1890ff] disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <div className="space-y-1">
                                        <label htmlFor="enableAvatarInterview" className="text-sm font-medium cursor-pointer text-slate-700">
                                            Habilitar Entrevista con Avatar IA
                                        </label>
                                        <p className="text-xs text-slate-500">
                                            Los candidatos que califiquen podrán agendar una entrevista inicial con nuestro Agente de IA.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* ============== SECTION 6: Copiloto IA ============== */}
                        {
                            !isFreePlan && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.28 }}
                                    className="bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-200 p-6 lg:p-8 shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                                <BrainCircuit className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h2 className="font-semibold text-purple-900">Copiloto IA: Asesor de Publicación</h2>
                                                <p className="text-xs text-purple-600">Compara tu borrador contra el mercado para atraer mejor talento</p>
                                            </div>
                                        </div>

                                        {!aiAnalysisResult && (
                                            <Button
                                                type="button"
                                                onClick={handleAnalyzeMarket}
                                                disabled={isAiAnalyzing}
                                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md flex items-center gap-2"
                                            >
                                                {isAiAnalyzing ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Analizando mercado...</>
                                                ) : (
                                                    <><Sparkles className="w-4 h-4" /> Mejorar mi publicación</>
                                                )}
                                            </Button>
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {aiAnalysisResult && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="bg-white rounded-xl p-5 border border-purple-100 shadow-sm"
                                            >
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-sm font-bold text-slate-700">Atractivo vs Mercado</h4>
                                                            <span className={`text-sm font-extrabold px-3 py-1 rounded-lg ${aiAnalysisResult.competitivenessScore >= 80 ? 'bg-green-100 text-green-700' : aiAnalysisResult.competitivenessScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                                {aiAnalysisResult.competitivenessScore}%
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                                            {aiAnalysisResult.descriptionFeedback}
                                                        </p>

                                                        <h5 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2"><DollarSign className="w-3.5 h-3.5" /> Análisis Salarial</h5>
                                                        <p className="text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                            {aiAnalysisResult.salaryComparison}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {aiAnalysisResult.missingBenefits?.length > 0 && (
                                                            <div>
                                                                <h5 className="text-xs font-bold text-amber-600 uppercase flex items-center gap-1.5 mb-2"><AlertTriangle className="w-3.5 h-3.5" /> Beneficios Faltantes Comunes</h5>
                                                                <ul className="text-xs text-slate-600 space-y-1.5">
                                                                    {aiAnalysisResult.missingBenefits.map((mb: string, i: number) => (
                                                                        <li key={i} className="flex items-start gap-1.5">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                                                                            {mb}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {aiAnalysisResult.improvementTips?.length > 0 && (
                                                            <div>
                                                                <h5 className="text-xs font-bold text-purple-600 uppercase flex items-center gap-1.5 mb-2"><Sparkles className="w-3.5 h-3.5" /> Sugerencias de Mejora</h5>
                                                                <ul className="text-xs text-slate-600 space-y-1.5">
                                                                    {aiAnalysisResult.improvementTips.map((tip: string, i: number) => (
                                                                        <li key={i} className="flex items-start gap-1.5">
                                                                            <Check className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-[-2px]" />
                                                                            {tip}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleAnalyzeMarket}
                                                        disabled={isAiAnalyzing}
                                                        className="text-xs h-8 px-3 rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50"
                                                    >
                                                        <RefreshCw className="w-3 h-3 mr-1.5" />
                                                        Re-analizar
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        }

                        {/* ============== Submit ============== */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex justify-between items-center pt-8 border-t border-slate-200 mt-8"
                        >
                            <Link href="/empresas/mis-publicaciones">
                                <Button type="button" variant="outline" className="rounded-xl h-14 px-8 font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 transition-colors">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button
                                onClick={onSubmit}
                                disabled={isSubmitting}
                                className="bg-[#1890ff] hover:bg-blue-600 hover:-translate-y-1 text-white rounded-xl h-14 px-10 text-lg font-bold shadow-[0_8px_30px_rgb(24,144,255,0.25)] hover:shadow-[0_8px_30px_rgb(24,144,255,0.4)] transition-all duration-300"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin w-5 h-5 mr-3" />
                                        Publicando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 mr-3" />
                                        {isEditing ? "Guardar Cambios" : "Publicar Oferta"}
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </div>
                </div>

                {/* RIGHT COLUMN: LIVE PREVIEW */}
                <div className="hidden lg:block lg:col-span-5 sticky top-24">
                    <div className="bg-white/60 backdrop-blur-2xl rounded-[32px] p-8 border border-white shadow-[0_8px_40px_rgb(0,0,0,0.04)] h-[calc(100vh-140px)] overflow-y-auto overflow-x-hidden relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                        {/* CSS to hide scrollbar in Webkit browsers */}
                        <style>{`
                            .hidden-scrollbar::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>
                        <div className="hidden-scrollbar" style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '2rem' }}>

                            {/* Fake Browser Top */}
                            <div className="sticky top-[-2rem] left-[-2rem] right-[-2rem] w-[calc(100%+4rem)] h-12 border-b border-slate-100 flex items-center px-6 gap-2 bg-slate-50/80 backdrop-blur-xl z-20 mb-8 -mt-8 rounded-t-[32px]">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                <span className="ml-4 text-[11px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Vista Previa en Tiempo Real
                                </span>
                            </div>

                            <div className="space-y-8">
                                {/* Hero preview */}
                                <div className="text-center pt-2">
                                    <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-[1.1] mb-5">
                                        {title || "Desarrollador Full Stack Senior"}
                                    </h1>
                                    <div className="flex flex-wrap justify-center gap-4 text-[15px] text-slate-500 font-medium">
                                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#1890ff]" />{location || "Santiago, Chile"}</span>
                                        <span className="flex items-center gap-1.5"><Monitor className="w-4 h-4 text-purple-500" />{workMode || "Presencial"}</span>
                                        <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-emerald-500" />{jobType || "Full-time"}</span>
                                    </div>

                                    {showSalary && salaryMin && salaryMax && (
                                        <div className="mt-4 px-4 py-1.5 bg-green-50 text-green-700 rounded-full inline-flex items-center font-bold text-sm border border-green-200/50">
                                            {currency} {Number(salaryMin).toLocaleString()} - {Number(salaryMax).toLocaleString()}
                                        </div>
                                    )}
                                </div>

                                <hr className="border-slate-100" />

                                {/* Content Preview */}
                                <div className="space-y-10">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Acerca del Puesto</h3>
                                        <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {description || "La descripción de la vacante aparecerá aquí. Utiliza el editor para añadir detalles atractivos que capten la atención de los mejores talentos."}
                                        </p>
                                    </div>

                                    {responsibilities && (
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Lo que harás</h3>
                                            <ul className="space-y-3">
                                                {responsibilities.split('\n').filter(r => r.trim()).slice(0, 4).map((r, i) => (
                                                    <li key={i} className="flex gap-3 items-start text-[15px] text-slate-600">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1890ff] mt-2 flex-shrink-0" />
                                                        <span className="leading-relaxed">{r}</span>
                                                    </li>
                                                ))}
                                                {responsibilities.split('\n').filter(r => r.trim()).length > 4 && (
                                                    <li className="text-sm text-slate-400 font-medium italic mt-2">y más responsabilidades...</li>
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    {requirements && (
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Lo que buscamos</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {requirements.split('\n').filter(req => req.trim()).slice(0, 5).map((req, i) => (
                                                    <div key={i} className="px-3.5 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium border border-slate-200/60 shadow-sm shadow-slate-100/50">
                                                        {req}
                                                    </div>
                                                ))}
                                                {requirements.split('\n').filter(req => req.trim()).length > 5 && (
                                                    <div className="px-3.5 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-sm font-medium border border-slate-200/60 shadow-sm">
                                                        +{requirements.split('\n').filter(req => req.trim()).length - 5} más
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Card Preview */}
                                    <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 text-center">
                                        <p className="text-sm font-bold text-slate-700 mb-3">Postula como Candidato</p>
                                        <div className="w-full h-12 bg-[#1890ff]/50 rounded-xl flex items-center justify-center text-white/90 font-bold backdrop-blur-sm">
                                            Postular Ahora
                                        </div>
                                    </div>
                                </div>
                                <div className="h-12 w-full"></div> {/* Spacer for bottom */}
                            </div>
                        </div>

                        {/* Footer Fade */}
                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent rounded-b-[32px] z-10"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
