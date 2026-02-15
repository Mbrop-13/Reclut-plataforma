"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft, AlertTriangle, Sparkles, Lock, Crown,
    Briefcase, MapPin, DollarSign, FileText, Settings2, CheckCircle2
} from "lucide-react"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "sonner"
import Link from "next/link"

export default function NuevaVacantePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [plan, setPlan] = useState<string>("free")
    const [existingJobCount, setExistingJobCount] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isFreePlan = !plan || plan === "free"
    const hasReachedFreeLimit = isFreePlan && existingJobCount >= 1

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/login")
                return
            }

            try {
                // Get user plan
                const userDoc = await getDoc(doc(db, "users", user.uid))
                if (userDoc.exists()) {
                    const data = userDoc.data()
                    setPlan(data.plan || "free")
                }

                // Count existing jobs
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

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        // Double-check free plan limit
        if (isFreePlan && existingJobCount >= 1) {
            toast.error("Ya alcanzaste el límite de 1 publicación en el plan gratuito")
            return
        }

        setIsSubmitting(true)

        const formData = new FormData(event.currentTarget)
        const jobData: any = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            location: formData.get("location") as string,
            workMode: formData.get("workMode") as string,
            salaryMin: Number(formData.get("salaryMin")),
            salaryMax: Number(formData.get("salaryMax")),
            currency: formData.get("currency") as string,
            companyId: auth.currentUser?.uid,
            status: "active",
            createdAt: new Date(),
            requirements: (formData.get("requirements") as string).split("\n").filter(Boolean),
            responsibilities: (formData.get("responsibilities") as string).split("\n").filter(Boolean),
            benefits: (formData.get("benefits") as string).split("\n").filter(Boolean),
            // Plan-based settings
            planType: isFreePlan ? "free" : plan,
            maxApplicants: isFreePlan ? 5 : null, // null = unlimited
        }

        // Only allow AI settings for paid plans
        if (!isFreePlan) {
            jobData.minScore = Number(formData.get("minScore") || 75)
            jobData.enableAvatarInterview = formData.get("enableAvatarInterview") === "on"
        } else {
            jobData.minScore = 0
            jobData.enableAvatarInterview = false
        }

        try {
            const { collection, addDoc } = await import("firebase/firestore")
            await addDoc(collection(db, "jobs"), jobData)

            toast.success("¡Vacante publicada exitosamente!")
            router.push("/empresas/mis-publicaciones")
        } catch (error) {
            console.error(error)
            toast.error("Error al publicar la vacante")
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

    // Free plan: already has 1 job → block with upgrade CTA
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
                        Mejora tu plan para publicar vacantes ilimitadas y acceder a entrevistas con IA.
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

    return (
        <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            {/* Back link */}
            <Link
                href="/empresas/mis-publicaciones"
                className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver a mis publicaciones
            </Link>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                    Nueva Vacante
                </h1>
                <p className="text-slate-500 mt-1">
                    Completa la información para publicar tu oferta de empleo
                </p>
            </motion.div>

            {/* Free plan warning banner */}
            {isFreePlan && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-900 mb-1">Plan Gratuito — Publicación con límites</h3>
                            <ul className="text-sm text-amber-700 space-y-1">
                                <li>• Máximo <strong>1 publicación</strong> activa</li>
                                <li>• Límite de <strong>5 postulantes</strong> por vacante</li>
                                <li>• <strong>Sin entrevistas con IA</strong> ni scoring automático</li>
                                <li>• Sin prioridad en resultados de búsqueda</li>
                            </ul>
                            <Link
                                href="/empresas/planes"
                                className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:text-amber-900 mt-3 underline underline-offset-2"
                            >
                                <Crown className="w-3.5 h-3.5" />
                                Mejorar mi plan para desbloquear todo
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Section: Info básica */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-[#1890ff]" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Información del Puesto</h2>
                                <p className="text-xs text-slate-500">Datos principales de la vacante</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Título del Puesto *</label>
                                <input
                                    name="title"
                                    required
                                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:border-transparent focus:bg-white transition-all"
                                    placeholder="Ej. Senior React Developer"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Ubicación *</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            name="location"
                                            required
                                            className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:border-transparent focus:bg-white transition-all"
                                            placeholder="Ej. Ciudad de México / Remoto"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Modalidad</label>
                                    <select
                                        name="workMode"
                                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:border-transparent focus:bg-white transition-all"
                                    >
                                        <option value="Presencial">Presencial</option>
                                        <option value="Híbrido">Híbrido</option>
                                        <option value="Remoto">Remoto</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Salario */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Compensación</h2>
                                <p className="text-xs text-slate-500">Rango salarial de la posición</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Salario Mínimo *</label>
                                <input
                                    name="salaryMin"
                                    type="number"
                                    required
                                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:border-transparent focus:bg-white transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Salario Máximo *</label>
                                <input
                                    name="salaryMax"
                                    type="number"
                                    required
                                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:border-transparent focus:bg-white transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Moneda</label>
                                <select
                                    name="currency"
                                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:border-transparent focus:bg-white transition-all"
                                >
                                    <option value="USD">USD</option>
                                    <option value="MXN">MXN</option>
                                    <option value="EUR">EUR</option>
                                    <option value="COP">COP</option>
                                    <option value="CLP">CLP</option>
                                    <option value="ARS">ARS</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Descripción */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Descripción y Requisitos</h2>
                                <p className="text-xs text-slate-500">Detalla el puesto para atraer talento</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Descripción del Puesto *</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:border-transparent focus:bg-white transition-all resize-none"
                                    placeholder="Describe las responsabilidades y el contexto del rol..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Responsabilidades (una por línea)</label>
                                <textarea
                                    name="responsibilities"
                                    rows={3}
                                    className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:border-transparent focus:bg-white transition-all resize-none"
                                    placeholder="- Liderar equipo de desarrollo&#10;- Diseñar arquitectura de software&#10;- Code reviews"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Requisitos (uno por línea)</label>
                                <textarea
                                    name="requirements"
                                    rows={3}
                                    className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:border-transparent focus:bg-white transition-all resize-none"
                                    placeholder="- 5+ años de experiencia en React&#10;- Conocimientos de TypeScript&#10;- Experiencia con APIs REST"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Beneficios (uno por línea)</label>
                                <textarea
                                    name="benefits"
                                    rows={2}
                                    className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:border-transparent focus:bg-white transition-all resize-none"
                                    placeholder="- Seguro médico&#10;- Horario flexible&#10;- Trabajo remoto"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: IA Settings */}
                    <div className={`rounded-2xl border p-6 lg:p-8 shadow-sm relative ${isFreePlan ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200"}`}>
                        {/* Lock overlay for free plan */}
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
                                <label className="text-sm font-medium text-slate-700">Puntaje Mínimo para Entrevista (%)</label>
                                <input
                                    name="minScore"
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue="75"
                                    disabled={isFreePlan}
                                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-[#1890ff] disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <p className="text-xs text-slate-500">
                                    Candidatos con este puntaje o superior serán invitados a entrevista.
                                </p>
                            </div>

                            <div className="flex items-start gap-3 mt-1">
                                <input
                                    type="checkbox"
                                    name="enableAvatarInterview"
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
                    </div>

                    {/* Submit */}
                    <div className="flex justify-between items-center pt-2">
                        <Link href="/empresas/mis-publicaciones">
                            <Button type="button" variant="outline" className="rounded-xl h-11 px-6">
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#1890ff] hover:bg-blue-600 text-white rounded-xl h-11 px-8 font-semibold shadow-lg shadow-blue-500/20"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Publicando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Publicar Vacante
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
