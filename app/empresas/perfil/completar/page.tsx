"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Need to create or use existing
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Upload, MapPin, Building2, Globe, Check, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { db, auth, storage } from "@/lib/firebase"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { onAuthStateChanged } from "firebase/auth"

const PASOS = [
    { numero: 1, titulo: "Datos Básicos" },
    { numero: 2, titulo: "Imagen Corporativa" },
    { numero: 3, titulo: "Ubicación y Legal" }
]

const INDUSTRIES = [
    "Tecnología y Software",
    "Finanzas y Banca",
    "Salud y Medicina",
    "Educación",
    "Retail y Comercio",
    "Manufactura",
    "Servicios Profesionales",
    "Otro"
]

export default function CompletarPerfilPage() {
    const router = useRouter()
    const [paso, setPaso] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [companyName, setCompanyName] = useState("")

    const [formData, setFormData] = useState({
        rut: "",
        industry: "",
        website: "",
        description: "",
        address: "",
        city: "",
        country: "Chile", // Default
        termsAccepted: false
    })

    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid)
                // Fetch company name from user doc if available logic
                const userDoc = await getDoc(doc(db, "users", user.uid))
                if (userDoc.exists()) {
                    setCompanyName(userDoc.data().companyName || "")
                }
            } else {
                router.push('/login')
            }
        })
        return () => unsubscribe()
    }, [router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.error("El archivo es demasiado grande (max 2MB)")
                return
            }
            setLogoFile(file)
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    const generateSlug = (name: string) => {
        return name.toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    const validateStep = (currentStep: number) => {
        if (currentStep === 1) {
            if (!formData.rut.trim()) {
                toast.error("Por favor ingresa el RUT/Tax ID")
                return false
            }
            if (!formData.industry) {
                toast.error("Por favor selecciona una industria")
                return false
            }
            if (!formData.website.trim()) {
                toast.error("Por favor ingresa el sitio web")
                return false
            }
        }

        if (currentStep === 2) {
            if (!logoFile && !logoPreview) { // Check if we have a file or existing preview (if editing)
                toast.error("Debes subir un logo de la empresa")
                return false
            }
            if (!formData.description.trim()) {
                toast.error("Por favor agrega una descripción corta")
                return false
            }
        }

        if (currentStep === 3) {
            if (!formData.address.trim()) {
                toast.error("Por favor ingresa la dirección")
                return false
            }
            if (!formData.city.trim()) {
                toast.error("Por favor ingresa la ciudad")
                return false
            }
            if (!formData.termsAccepted) {
                toast.error("Debes aceptar los términos y condiciones")
                return false
            }
        }

        return true
    }

    const handleNext = () => {
        if (validateStep(paso)) {
            setPaso(p => Math.min(3, p + 1))
        }
    }

    const handleSubmit = async () => {
        if (!userId) return
        if (!validateStep(3)) return

        try {
            setIsLoading(true)

            // 1. Upload Logo if exists
            let logoUrl = ""
            if (logoFile) {
                const storageRef = ref(storage, `logos/${userId}/${logoFile.name}`)
                await uploadBytes(storageRef, logoFile)
                logoUrl = await getDownloadURL(storageRef)
            } else if (logoPreview && logoPreview.startsWith('http')) {
                // Keep existing logo url if we were editing
                logoUrl = logoPreview
            }

            // 2. Generate Slug
            const slug = generateSlug(companyName)
            if (!slug) {
                toast.error("El nombre de la empresa no es válido para generar una URL")
                setIsLoading(false)
                return
            }

            // Check for slug uniqueness logic (simplified: overwrite for now, but ideally check existance)
            // Ideally check `getDoc(doc(db, "companies", slug))` and append rand string if exists.

            const companyData = {
                slug,
                name: companyName,
                ownerUid: userId,
                rut: formData.rut,
                industry: formData.industry,
                website: formData.website,
                description: formData.description,
                logoUrl,
                location: {
                    address: formData.address,
                    city: formData.city,
                    country: formData.country,
                },
                createdAt: serverTimestamp(),
                termsAccepted: formData.termsAccepted,
                termsAcceptedAt: new Date().toISOString()
            }

            // 3. Save to Companies Collection (Public Profile)
            await setDoc(doc(db, "companies", slug), companyData)

            // 4. Update User Doc
            await updateDoc(doc(db, "users", userId), {
                onboardingCompleted: true,
                companySlug: slug,
                updatedAt: serverTimestamp()
            })

            toast.success("¡Perfil completado exitosamente!")
            router.push('/empresas/dashboard')

        } catch (error: any) {
            console.error("Error completing profile:", error)
            toast.error("Error al guardar el perfil: " + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--gray-50))] p-6 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#1890ff] flex items-center justify-center">
                        <span className="text-white font-bold">R</span>
                    </div>
                    <span className="text-xl font-bold text-[hsl(var(--gray-900))]">Reclu</span>
                </div>
                <div className="text-sm font-medium text-[hsl(var(--gray-500))]">
                    Configuración Inicial
                </div>
            </div>

            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-[hsl(var(--gray-200))] overflow-hidden flex flex-col md:flex-row">
                {/* Sidebar Steps */}
                <div className="w-full md:w-64 bg-[hsl(var(--gray-50))] border-r border-[hsl(var(--gray-200))] p-6 flex flex-col gap-6">
                    <h2 className="font-semibold text-[hsl(var(--gray-900))]">Pasos a completar</h2>
                    <div className="space-y-4">
                        {PASOS.map((p) => (
                            <div key={p.numero} className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${paso > p.numero ? 'bg-[hsl(var(--success))] text-white' :
                                    paso === p.numero ? 'bg-[#1890ff] text-white' : 'bg-[hsl(var(--gray-200))] text-[hsl(var(--gray-500))]'
                                    }`}>
                                    {paso > p.numero ? <Check className="w-4 h-4" /> : p.numero}
                                </div>
                                <span className={`text-sm font-medium ${paso === p.numero ? 'text-[hsl(var(--gray-900))]' : 'text-[hsl(var(--gray-500))]'
                                    }`}>
                                    {p.titulo}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    <AnimatePresence mode="wait">
                        {paso === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h3 className="text-xl font-bold text-[hsl(var(--gray-900))]">Información de la Empresa</h3>
                                    <p className="text-[hsl(var(--gray-600))]">Cuéntanos sobre tu organización.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>RUT / Tax ID</Label>
                                        <Input
                                            name="rut"
                                            value={formData.rut}
                                            onChange={handleChange}
                                            placeholder="Ej: 76.543.210-K"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Industria</Label>
                                        <select
                                            name="industry"
                                            value={formData.industry}
                                            onChange={handleChange}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Selecciona una industria</option>
                                            {INDUSTRIES.map(ind => (
                                                <option key={ind} value={ind}>{ind}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sitio Web</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--gray-400))]" />
                                            <Input
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                placeholder="www.tuempresa.com"
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {paso === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h3 className="text-xl font-bold text-[hsl(var(--gray-900))]">Identidad Visual</h3>
                                    <p className="text-[hsl(var(--gray-600))]">Haz que tu perfil destaque.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Logo de la empresa</Label>
                                        <div className="border-2 border-dashed border-[hsl(var(--gray-200))] rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-[hsl(var(--gray-50))] transition-colors cursor-pointer relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            {logoPreview ? (
                                                <div className="relative w-32 h-32 mb-4">
                                                    <Image src={logoPreview} alt="Preview" fill className="object-contain rounded-lg" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                                                        <span className="text-white text-xs font-medium">Cambiar</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 bg-[hsl(var(--primary-light))] rounded-full flex items-center justify-center text-[#1890ff] mb-4">
                                                    <ImageIcon className="w-8 h-8" />
                                                </div>
                                            )}
                                            <p className="font-medium text-[hsl(var(--gray-900))]">
                                                {logoFile ? logoFile.name : "Arrastra tu logo aquí o haz clic"}
                                            </p>
                                            <p className="text-xs text-[hsl(var(--gray-500))] mt-1">SVG, PNG, JPG (max. 2MB)</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Descripción Corta</Label>
                                        {/* Using generic textarea styling if component doesn't exist */}
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe brevemente a qué se dedica tu empresa..."
                                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {paso === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h3 className="text-xl font-bold text-[hsl(var(--gray-900))]">Ubicación y Términos</h3>
                                    <p className="text-[hsl(var(--gray-600))]">Finaliza la configuración.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Dirección Principal</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--gray-400))]" />
                                            <Input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Av. Providencia 1234, Of 501"
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Ciudad</Label>
                                            <Input
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="Santiago"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>País</Label>
                                            <Input
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    {/* Google Maps Placeholder - would be an iframe or dynamic map */}
                                    <div className="h-32 bg-[hsl(var(--gray-100))] rounded-lg border border-[hsl(var(--gray-200))] flex items-center justify-center text-[hsl(var(--gray-500))] text-sm">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Mapa de ubicación (Vista previa)
                                    </div>

                                    <div className="pt-4 border-t border-[hsl(var(--gray-200))]">
                                        <div className="flex items-start gap-2">
                                            <Checkbox
                                                id="terms"
                                                checked={formData.termsAccepted}
                                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, termsAccepted: checked === true }))}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label
                                                    htmlFor="terms"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Acepto los términos y condiciones
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Al completar el perfil, aceptas nuestra política de privacidad y uso de datos.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-[hsl(var(--gray-200))]">
                        <Button
                            variant="outline"
                            onClick={() => setPaso(p => Math.max(1, p - 1))}
                            disabled={paso === 1 || isLoading}
                            className="btn-secondary"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Atrás
                        </Button>

                        {paso < 3 ? (
                            <Button
                                onClick={handleNext}
                                className="btn-primary"
                            >
                                Continuar
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="btn-primary"
                            >
                                {isLoading ? "Guardando..." : "Finalizar y Ver Dashboard"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
