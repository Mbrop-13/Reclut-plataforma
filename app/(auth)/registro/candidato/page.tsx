"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Chrome, Linkedin, Eye, EyeOff, ArrowLeft, ArrowRight, Check } from "lucide-react"

const PASOS = [
    { numero: 1, titulo: "Cuenta" },
    { numero: 2, titulo: "Personal" },
    { numero: 3, titulo: "Profesional" }
]

export default function RegistroCandidatoPage() {
    const [paso, setPaso] = useState(1)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        location: "",
        title: "",
        experience: "",
        salary: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Hooks
    const signup = useAuthStore(state => state.signup)
    const router = useRouter()

    // We should import useAuthStore from absolute path like in other files
    // But since this file didn't have it imported, I will add it.
    // Wait, the file header imports are not in this chunk. I will assume they are there or I need to add them.
    // The previous view_file showed imports. I'll need to check if useAuthStore is imported.
    // It was not. I should update imports too. But this chunk is for the component body.
    // I will use replace_file_content on the whole file or a large chunk to be safe.

    const handleSubmit = async () => {
        try {
            setIsLoading(true)
            const { password, ...profileData } = formData
            await signup(formData.email, formData.password, 'CANDIDATE', profileData)
            router.push('/candidatos') // Redirect to candidates dashboard
        } catch (error) {
            console.error("Error al registrar:", error)
            alert("Error al registrar: " + (error as Error).message)
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
                className="relative w-full max-w-lg"
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
                        <h1 className="text-h1 text-[hsl(var(--gray-900))] mb-2">Crear cuenta</h1>
                        <p className="text-body text-[hsl(var(--gray-600))]">
                            Regístrate como candidato en minutos
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 mb-8">
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
                                {/* Social Login */}
                                <div className="space-y-3 mb-6">
                                    <Button variant="outline" className="btn-secondary w-full h-12">
                                        <Chrome className="w-5 h-5" />
                                        Continuar con Google
                                    </Button>
                                    <Button variant="outline" className="btn-secondary w-full h-12">
                                        <Linkedin className="w-5 h-5" />
                                        Continuar con LinkedIn
                                    </Button>
                                </div>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-[hsl(var(--gray-200))]" />
                                    </div>
                                    <div className="relative flex justify-center text-small">
                                        <span className="bg-white px-4 text-[hsl(var(--gray-500))]">o con email</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-body font-medium text-[hsl(var(--gray-900))]">
                                        Correo electrónico
                                    </Label>
                                    <Input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        placeholder="tu@email.com"
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-body font-medium text-[hsl(var(--gray-900))]">Nombre</Label>
                                        <Input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="Juan"
                                            className="input-pro"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-body font-medium text-[hsl(var(--gray-900))]">Apellido</Label>
                                        <Input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Pérez"
                                            className="input-pro"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-body font-medium text-[hsl(var(--gray-900))]">Teléfono</Label>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+52 55 1234 5678"
                                        className="input-pro"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-body font-medium text-[hsl(var(--gray-900))]">Ubicación</Label>
                                    <Input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Ciudad de México, México"
                                        className="input-pro"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {paso === 3 && (
                            <motion.div
                                key="paso3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label className="text-body font-medium text-[hsl(var(--gray-900))]">Título profesional</Label>
                                    <Input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Ej: Desarrollador Full Stack"
                                        className="input-pro"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-body font-medium text-[hsl(var(--gray-900))]">Años de experiencia</Label>
                                    <Input
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        placeholder="5"
                                        type="number"
                                        className="input-pro"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-body font-medium text-[hsl(var(--gray-900))]">Expectativa salarial (MXN/mes)</Label>
                                    <Input
                                        name="salary"
                                        value={formData.salary}
                                        onChange={handleChange}
                                        placeholder="80,000"
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
                                if (paso < 3) {
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
                                    {paso === 3 ? 'Crear Cuenta' : 'Continuar'}
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
