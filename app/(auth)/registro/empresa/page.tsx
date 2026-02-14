"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check } from "lucide-react"
import { toast } from "sonner"
import { db, auth } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

const PASOS = [
    { numero: 1, titulo: "Cuenta" },
    { numero: 2, titulo: "Empresa" }
]

export default function RegistroEmpresaPage() {
    const [paso, setPaso] = useState(1)
    const [showPassword, setShowPassword] = useState(false)

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        companyName: "",
        size: "",
        firstName: "",
        lastName: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Hooks
    const signup = useAuthStore(state => state.signup)
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        // Validaciones básicas
        if (!formData.email || !formData.password || !formData.companyName || !formData.firstName || !formData.lastName) {
            toast.error("Por favor completa todos los campos requeridos")
            return
        }

        try {
            setIsLoading(true)

            // 1. Crear usuario en Firebase Auth
            await signup(formData.email, formData.password, 'RECRUITER')

            // 2. Obtener el usuario recién creado
            const user = auth.currentUser

            if (user) {
                // 3. Guardar perfil de empresa en Firestore
                // Usamos el UID del usuario como ID del documento para fácil referencia
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: formData.email,
                    role: 'RECRUITER',
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    companyName: formData.companyName,
                    companySize: formData.size,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    onboardingCompleted: false
                })

                toast.success("¡Cuenta de empresa creada exitosamente!")

                // 4. Redireccionar al dashboard correspondiente
                // Nota: Ya hemos corregido la ruta a /empresas/dashboard
                router.push('/empresas/dashboard')
            } else {
                throw new Error("No se pudo obtener la información del usuario después del registro")
            }

        } catch (error: any) {
            console.error("Error al registrar:", error)

            // Manejo de errores específicos de Firebase en español
            let mensajeError = "Ocurrió un error al crear la cuenta"

            if (error.code === 'auth/email-already-in-use') {
                mensajeError = "Este correo electrónico ya está registrado. Por favor inicia sesión."
            } else if (error.code === 'auth/weak-password') {
                mensajeError = "La contraseña es muy débil. Debe tener al menos 6 caracteres."
            } else if (error.code === 'auth/invalid-email') {
                mensajeError = "El formato del correo electrónico no es válido."
            } else if (error.message) {
                mensajeError = error.message
            }

            toast.error(mensajeError)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--gray-50))] flex items-center justify-center p-4">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[hsl(var(--primary-light))] via-[hsl(var(--gray-50))] to-[hsl(var(--gray-50))]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-xl"
            >
                {/* Card */}
                <div className="bg-white rounded-xl shadow-2xl border border-[hsl(var(--gray-200))] p-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#1890ff] flex items-center justify-center">
                                <span className="text-white font-bold">R</span>
                            </div>
                            <span className="text-2xl font-semibold text-[hsl(var(--gray-900))]">Reclu</span>
                        </Link>
                        <h1 className="text-h1 text-[hsl(var(--gray-900))] mb-2">Registrar Empresa</h1>
                        <p className="text-body text-[hsl(var(--gray-600))]">
                            Comienza a contratar talento con IA
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-1 mb-8">
                        {PASOS.map((p, i) => (
                            <div key={p.numero} className="flex items-center">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${paso > p.numero
                                    ? 'bg-[hsl(var(--success))] text-white'
                                    : paso === p.numero
                                        ? 'bg-[#1890ff] text-white'
                                        : 'bg-[hsl(var(--gray-200))] text-[hsl(var(--gray-600))]'
                                    }`}>
                                    {paso > p.numero ? <Check className="w-4 h-4" /> : p.numero}
                                </div>
                                <span className={`ml-2 text-small font-medium ${paso >= p.numero ? 'text-[hsl(var(--gray-900))]' : 'text-[hsl(var(--gray-400))]'
                                    }`}>
                                    {p.titulo}
                                </span>
                                {i < PASOS.length - 1 && (
                                    <div className={`w-8 h-0.5 mx-3 ${paso > p.numero ? 'bg-[hsl(var(--success))]' : 'bg-[hsl(var(--gray-200))]'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form Steps */}
                    <AnimatePresence mode="wait">
                        {paso === 1 && (
                            <motion.div
                                key="paso1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label className="text-body font-medium text-[hsl(var(--gray-900))]">
                                        Correo corporativo
                                    </Label>
                                    <Input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        placeholder="contacto@empresa.com"
                                        className="input-pro"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-body font-medium text-[hsl(var(--gray-900))]">
                                        Contraseña
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Mínimo 8 caracteres"
                                            className="input-pro pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--gray-400))]"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {paso === 2 && (
                            <motion.div
                                key="paso2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label className="text-body font-medium text-[hsl(var(--gray-900))]">Nombre de la empresa</Label>
                                    <Input
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="TechCorp LATAM"
                                        className="input-pro"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-body font-medium text-[hsl(var(--gray-900))]">Nombre Contacto</Label>
                                        <Input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="María"
                                            className="input-pro"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-body font-medium text-[hsl(var(--gray-900))]">Apellido Contacto</Label>
                                        <Input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="González"
                                            className="input-pro"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-body font-medium text-[hsl(var(--gray-900))]">Tamaño de la empresa</Label>
                                    <Input
                                        name="size"
                                        value={formData.size}
                                        onChange={handleChange}
                                        placeholder="Ej: 50-200 empleados"
                                        className="input-pro"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="flex justify-between gap-4 mt-8">
                        {paso > 1 ? (
                            <Button
                                variant="outline"
                                className="btn-secondary flex-1"
                                onClick={() => setPaso(paso - 1)}
                                disabled={isLoading}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Atrás
                            </Button>
                        ) : (
                            <Link href="/registro" className="flex-1">
                                <Button variant="outline" className="btn-secondary w-full" disabled={isLoading}>
                                    <ArrowLeft className="w-4 h-4" />
                                    Atrás
                                </Button>
                            </Link>
                        )}

                        <Button
                            className="btn-primary flex-1"
                            onClick={() => {
                                if (paso < 2) {
                                    setPaso(paso + 1)
                                } else {
                                    handleSubmit()
                                }
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                    Procesando...
                                </span>
                            ) : (
                                <>
                                    {paso === 2 ? 'Crear Cuenta' : 'Continuar'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-body text-[hsl(var(--gray-600))] mt-6">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/login" className="text-[#1890ff] font-medium hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}

