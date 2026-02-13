"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Briefcase, Building2, ArrowRight } from "lucide-react"

export default function RegistroPage() {
    return (
        <div className="min-h-screen bg-[hsl(var(--gray-50))] flex items-center justify-center p-4">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[hsl(var(--primary-light))] via-[hsl(var(--gray-50))] to-[hsl(var(--gray-50))]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-2xl"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-[#1890ff] flex items-center justify-center">
                            <span className="text-white font-bold">T</span>
                        </div>
                        <span className="text-2xl font-semibold text-[hsl(var(--gray-900))]">TalentAI</span>
                    </Link>
                    <h1 className="text-h1 text-[hsl(var(--gray-900))] mb-2">¿Qué estás buscando?</h1>
                    <p className="text-body text-[hsl(var(--gray-600))]">
                        Selecciona tu perfil para comenzar
                    </p>
                </div>

                {/* Selection Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Candidato */}
                    <Link href="/registro/candidato">
                        <motion.div
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white rounded-xl border-2 border-[hsl(var(--gray-200))] p-8 cursor-pointer transition-all hover:border-[#1890ff] hover:shadow-xl group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary-light))] flex items-center justify-center mb-6 group-hover:bg-[#1890ff] transition-colors">
                                <Briefcase className="w-8 h-8 text-[#1890ff] group-hover:text-white transition-colors" />
                            </div>
                            <h2 className="text-h2 text-[hsl(var(--gray-900))] mb-2">Busco Empleo</h2>
                            <p className="text-body text-[hsl(var(--gray-600))] mb-6">
                                Encuentra tu próximo trabajo, realiza entrevistas con IA y recibe ofertas personalizadas.
                            </p>
                            <div className="flex items-center gap-2 text-[#1890ff] font-medium">
                                Comenzar como candidato
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>
                    </Link>

                    {/* Empresa */}
                    <Link href="/registro/empresa">
                        <motion.div
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white rounded-xl border-2 border-[hsl(var(--gray-200))] p-8 cursor-pointer transition-all hover:border-[#1890ff] hover:shadow-xl group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary-light))] flex items-center justify-center mb-6 group-hover:bg-[#1890ff] transition-colors">
                                <Building2 className="w-8 h-8 text-[#1890ff] group-hover:text-white transition-colors" />
                            </div>
                            <h2 className="text-h2 text-[hsl(var(--gray-900))] mb-2">Busco Talento</h2>
                            <p className="text-body text-[hsl(var(--gray-600))] mb-6">
                                Publica vacantes, realiza entrevistas automatizadas y encuentra a los mejores candidatos.
                            </p>
                            <div className="flex items-center gap-2 text-[#1890ff] font-medium">
                                Comenzar como empresa
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-body text-[hsl(var(--gray-600))] mt-8">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/login" className="text-[#1890ff] font-medium hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
