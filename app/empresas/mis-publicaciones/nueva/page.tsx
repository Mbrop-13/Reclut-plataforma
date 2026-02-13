"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Lock } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "sonner"
import Link from "next/link"

export default function NuevaVacantePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [hasPlan, setHasPlan] = useState(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/login')
                return
            }

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid))
                if (userDoc.exists()) {
                    const data = userDoc.data()
                    // Check logic: if plan exists and is not 'free' (or whatever default is)
                    // For now, let's assume 'plan' field. If undefined -> no plan.
                    // We can also check a 'companies' collection if the plan is stored there.

                    // Simplified check:
                    if (data.plan && data.plan !== 'free') {
                        setHasPlan(true)
                    } else {
                        setHasPlan(false)
                        // Optional: Auto-redirect?
                        // router.push('/empresas/planes')
                    }
                }
            } catch (error) {
                console.error("Error checking plan:", error)
            } finally {
                setIsLoading(false)
            }
        })

        return () => unsubscribe()
    }, [router])

    const [isSubmitting, setIsSubmitting] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(event.currentTarget)
        const jobData = {
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
            requirements: (formData.get("requirements") as string).split('\n').filter(Boolean),
            responsibilities: (formData.get("responsibilities") as string).split('\n').filter(Boolean),
            benefits: (formData.get("benefits") as string).split('\n').filter(Boolean),
            minScore: Number(formData.get("minScore") || 75),
            enableAvatarInterview: formData.get("enableAvatarInterview") === "on"
        }

        try {
            // Save to Firestore
            // Note: Imports for collection/addDoc are needed at the top
            // verifying imports in next step if missing
            const { collection, addDoc } = await import("firebase/firestore")
            await addDoc(collection(db, "jobs"), jobData)

            toast.success("Vacante publicada exitosamente")
            router.push("/empresas/mis-publicaciones")
        } catch (error) {
            console.error(error)
            toast.error("Error al publicar la vacante")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) return <div className="flex justify-center p-8">Cargando...</div>

    if (!hasPlan) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--gray-50))] p-6 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 text-orange-600">
                    <Lock className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-[hsl(var(--gray-900))] mb-2">
                    Acceso Restringido
                </h1>
                <p className="text-[hsl(var(--gray-600))] max-w-md mb-8">
                    Para publicar nuevas vacantes necesitas tener un plan activo. Contrata uno ahora para desbloquear todas las funciones.
                </p>
                <div className="flex gap-4">
                    <Link href="/empresas/dashboard">
                        <Button variant="outline">Volver al Dashboard</Button>
                    </Link>
                    <Link href="/empresas/planes">
                        <Button className="btn-primary">Ver Planes Disponibles</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container py-8 max-w-3xl">
            <Link href="/empresas/vacantes" className="inline-flex items-center text-sm text-[hsl(var(--gray-500))] hover:text-[hsl(var(--gray-900))] mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver a mis vacantes
            </Link>

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[hsl(var(--gray-900))]">Nueva Vacante</h1>
            </div>

            <div className="bg-white p-8 rounded-xl border border-[hsl(var(--gray-200))] shadow-sm">
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Título del Puesto</label>
                        <input name="title" required className="flex h-10 w-full rounded-md border border-[hsl(var(--gray-300))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--gray-400))] focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:border-transparent" placeholder="Ej. Senior React Developer" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ubicación</label>
                            <input name="location" required className="flex h-10 w-full rounded-md border border-[hsl(var(--gray-300))] bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-[#1890ff]" placeholder="Ej. Ciudad de México / Remoto" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Modalidad</label>
                            <select name="workMode" className="flex h-10 w-full rounded-md border border-[hsl(var(--gray-300))] bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-[#1890ff]">
                                <option value="Presencial">Presencial</option>
                                <option value="Híbrido">Híbrido</option>
                                <option value="Remoto">Remoto</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Salario Mín.</label>
                            <input name="salaryMin" type="number" required className="flex h-10 w-full rounded-md border border-[hsl(var(--gray-300))] bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-[#1890ff]" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Salario Máx.</label>
                            <input name="salaryMax" type="number" required className="flex h-10 w-full rounded-md border border-[hsl(var(--gray-300))] bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-[#1890ff]" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Moneda</label>
                            <select name="currency" className="flex h-10 w-full rounded-md border border-[hsl(var(--gray-300))] bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-[#1890ff]">
                                <option value="USD">USD</option>
                                <option value="MXN">MXN</option>
                                <option value="EUR">EUR</option>
                                <option value="COP">COP</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Descripción del Puesto</label>
                        <textarea name="description" required rows={4} className="flex w-full rounded-md border border-[hsl(var(--gray-300))] bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-[#1890ff]" placeholder="Describe las responsabilidades y el rol..." />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Responsabilidades (Una por línea)</label>
                        <textarea name="responsibilities" rows={3} className="flex w-full rounded-md border border-[hsl(var(--gray-300))] bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-[#1890ff]" placeholder="- Liderar equipo..." />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Requisitos (Uno por línea)</label>
                        <textarea name="requirements" rows={3} className="flex w-full rounded-md border border-[hsl(var(--gray-300))] bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-[#1890ff]" placeholder="- 5 años experiencia..." />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Beneficios (Uno por línea)</label>
                        <textarea name="benefits" rows={2} className="flex w-full rounded-md border border-[hsl(var(--gray-300))] bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-[#1890ff]" placeholder="- Seguro médico..." />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                        <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                            Configuración de IA y Entrevistas
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Puntaje Mínimo para Entrevista (%)</label>
                                <input
                                    name="minScore"
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue="75"
                                    className="flex h-10 w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#1890ff]"
                                />
                                <p className="text-xs text-blue-600">
                                    Los candidatos con este puntaje o superior serán invitados a entrevista.
                                </p>
                            </div>

                            <div className="flex items-start gap-3 mt-1">
                                <input
                                    type="checkbox"
                                    name="enableAvatarInterview"
                                    id="enableAvatarInterview"
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1890ff] focus:ring-[#1890ff]"
                                />
                                <div className="space-y-1">
                                    <label htmlFor="enableAvatarInterview" className="text-sm font-medium cursor-pointer">
                                        Habilitar Entrevista con Avatar
                                    </label>
                                    <p className="text-xs text-gray-500">
                                        Permite que el candidato agende y realice una entrevista inicial con nuestro Agente de IA inmediatamente si califica.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link href="/empresas/mis-publicaciones">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" disabled={isSubmitting} className="btn-primary">
                            {isSubmitting ? "Publicando..." : "Publicar Vacante"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
