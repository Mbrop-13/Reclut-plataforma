"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Chrome, Linkedin, Eye, EyeOff } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { toast } from "sonner"
import { db, auth } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const login = useAuthStore(state => state.login)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !password) {
            toast.error("Por favor ingresa tu correo y contraseña")
            return
        }

        try {
            setIsLoading(true)
            await login(email, password)
            // Verificar rol y redirigir
            const user = auth.currentUser
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid))

                if (userDoc.exists()) {
                    const userData = userDoc.data()
                    toast.success("¡Bienvenido de nuevo!")

                    if (userData.role === 'RECRUITER') {
                        router.push('/empresas/dashboard')
                    } else {
                        router.push('/candidatos')
                    }
                } else {
                    router.push('/candidatos')
                }
            } else {
                router.push('/candidatos')
            }
        } catch (error: any) {
            console.error("Login error:", error)

            let mensajeError = "Error al iniciar sesión"
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                mensajeError = "Correo o contraseña incorrectos"
            } else if (error.code === 'auth/too-many-requests') {
                mensajeError = "Demasiados intentos fallidos. Por favor intenta más tarde."
            }

            toast.error(mensajeError)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--gray-50))] flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[hsl(var(--primary-light))] via-[hsl(var(--gray-50))] to-[hsl(var(--gray-50))]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-md"
            >
                {/* Back Button */}
                <Link
                    href="/"
                    className="absolute -top-12 left-0 inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio
                </Link>

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
                        <h1 className="text-h1 text-[hsl(var(--gray-900))] mb-2">Bienvenido de nuevo</h1>
                        <p className="text-body text-[hsl(var(--gray-600))]">
                            Ingresa tus credenciales para continuar
                        </p>
                    </div>

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

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[hsl(var(--gray-200))]" />
                        </div>
                        <div className="relative flex justify-center text-small">
                            <span className="bg-white px-4 text-[hsl(var(--gray-500))]">o continúa con email</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-body font-medium text-[hsl(var(--gray-900))]">
                                Correo electrónico
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="input-pro"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-body font-medium text-[hsl(var(--gray-900))]">
                                    Contraseña
                                </Label>
                                <Link href="/recuperar" className="text-small text-[#1890ff] hover:underline">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-pro pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--gray-400))] hover:text-[hsl(var(--gray-600))]"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox id="remember" className="border-[hsl(var(--gray-300))] data-[state=checked]:bg-[#1890ff] data-[state=checked]:border-[#1890ff]" />
                            <Label htmlFor="remember" className="text-body text-[hsl(var(--gray-600))] cursor-pointer">
                                Recordarme por 30 días
                            </Label>
                        </div>

                        <Button type="submit" disabled={isLoading} className="btn-primary w-full h-12 text-base mt-6">
                            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-body text-[hsl(var(--gray-600))] mt-6">
                        ¿No tienes una cuenta?{" "}
                        <Link href="/registro" className="text-[#1890ff] font-medium hover:underline">
                            Regístrate gratis
                        </Link>
                    </p>
                </div>

                {/* Footer Links */}
                <p className="text-center text-small text-[hsl(var(--gray-500))] mt-6">
                    Al continuar, aceptas nuestros{" "}
                    <Link href="#" className="hover:underline">Términos</Link>
                    {" "}y{" "}
                    <Link href="#" className="hover:underline">Política de Privacidad</Link>
                </p>
            </motion.div>
        </div>
    )
}
