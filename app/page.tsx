"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MainHeader } from "@/components/layout/main-header"
import {
    Search, Briefcase, Building2, Users, Clock, Shield,
    Zap, Check, Star, ChevronRight, Play, ArrowRight
} from "lucide-react"

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
}

const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
}

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header - Global & Smart */}
            <MainHeader />

            <main className="pt-16">
                {/* Hero Section - Minimal & Centered */}
                <section className="relative py-24 lg:py-32">
                    <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={stagger}
                            className="space-y-8"
                        >
                            {/* Badge */}
                            <motion.div variants={fadeInUp}>
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--primary-light))] text-[#1890ff] text-sm font-medium">
                                    <Zap className="w-4 h-4" />
                                    Potenciado por Inteligencia Artificial
                                </span>
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                variants={fadeInUp}
                                className="text-display text-[hsl(var(--gray-900))]"
                            >
                                Encuentra tu próximo empleo
                                <br />
                                <span className="text-[#1890ff]">con entrevistas de IA</span>
                            </motion.h1>

                            {/* Subheadline */}
                            <motion.p
                                variants={fadeInUp}
                                className="text-body-lg text-[hsl(var(--gray-600))] max-w-2xl mx-auto"
                            >
                                Miles de ofertas verificadas. Entrevistas automatizadas 24/7.
                                Feedback instantáneo. Conecta con las mejores empresas de LATAM.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div
                                variants={fadeInUp}
                                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                            >
                                <Link href="/empleos">
                                    <Button className="btn-primary h-14 px-8 text-base">
                                        <Briefcase className="w-5 h-5" />
                                        Buscar Empleos
                                    </Button>
                                </Link>
                                <Link href="/registro/empresa">
                                    <Button className="btn-secondary h-14 px-8 text-base">
                                        <Building2 className="w-5 h-5" />
                                        Contratar Talento
                                    </Button>
                                </Link>
                            </motion.div>

                            {/* Trust Indicators */}
                            <motion.div
                                variants={fadeInUp}
                                className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-[hsl(var(--gray-500))]"
                            >
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-[hsl(var(--success))]" />
                                    <span>100% Gratuito para candidatos</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-[hsl(var(--success))]" />
                                    <span>Empresas verificadas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[hsl(var(--success))]" />
                                    <span>Respuestas en 24h</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section - Clean Gray Background */}
                <section className="py-16 bg-[hsl(var(--gray-50))]">
                    <div className="max-w-5xl mx-auto px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="grid grid-cols-2 md:grid-cols-4 gap-8"
                        >
                            {[
                                { value: "5,000+", label: "Empleos Activos" },
                                { value: "800+", label: "Empresas" },
                                { value: "15,000+", label: "Candidatos" },
                                { value: "95%", label: "Satisfacción" }
                            ].map((stat, i) => (
                                <motion.div key={i} variants={fadeInUp} className="text-center">
                                    <div className="text-h1 text-[#1890ff] mb-1">{stat.value}</div>
                                    <div className="text-body text-[hsl(var(--gray-600))]">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Features - Para Candidatos */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="text-center mb-16"
                        >
                            <motion.h2 variants={fadeInUp} className="text-h1 text-[hsl(var(--gray-900))] mb-4">
                                Cómo Funciona para Candidatos
                            </motion.h2>
                            <motion.p variants={fadeInUp} className="text-body-lg text-[hsl(var(--gray-600))] max-w-2xl mx-auto">
                                Tres pasos simples para conseguir tu próximo empleo
                            </motion.p>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="grid md:grid-cols-3 gap-8"
                        >
                            {[
                                {
                                    step: "01",
                                    icon: Users,
                                    title: "Crea tu perfil",
                                    description: "Completa tu información profesional en menos de 5 minutos. Sube tu CV y destaca tus habilidades."
                                },
                                {
                                    step: "02",
                                    icon: Play,
                                    title: "Entrevista con IA",
                                    description: "Realiza entrevistas automatizadas cuando quieras. Recibe feedback inmediato sobre tu desempeño."
                                },
                                {
                                    step: "03",
                                    icon: Briefcase,
                                    title: "Recibe ofertas",
                                    description: "Las empresas revisan tu perfil y entrevista. Recibe ofertas de trabajo personalizadas."
                                }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeInUp}
                                    className="card-pro hover-lift text-center p-8"
                                >
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[hsl(var(--primary-light))] text-[#1890ff] mb-6">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-small text-[#1890ff] font-semibold mb-2">PASO {feature.step}</div>
                                    <h3 className="text-h3 text-[hsl(var(--gray-900))] mb-3">{feature.title}</h3>
                                    <p className="text-body text-[hsl(var(--gray-600))]">{feature.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Features Grid - Para Empresas */}
                <section className="py-24 bg-[hsl(var(--gray-50))]">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="text-center mb-16"
                        >
                            <motion.h2 variants={fadeInUp} className="text-h1 text-[hsl(var(--gray-900))] mb-4">
                                Para Empresas
                            </motion.h2>
                            <motion.p variants={fadeInUp} className="text-body-lg text-[hsl(var(--gray-600))] max-w-2xl mx-auto">
                                Herramientas poderosas para contratar mejor y más rápido
                            </motion.p>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {[
                                { icon: Clock, title: "Entrevistas 24/7", description: "Candidatos pueden entrevistarse en cualquier momento, sin coordinar horarios." },
                                { icon: Zap, title: "70% Más Rápido", description: "Reduce drásticamente el tiempo de contratación con evaluaciones automáticas." },
                                { icon: Users, title: "Pre-evaluados", description: "Recibe candidatos ya evaluados por IA con scoring detallado." },
                                { icon: Shield, title: "Sin Sesgos", description: "Evaluaciones objetivas basadas en habilidades y competencias." },
                                { icon: Star, title: "Analytics Avanzado", description: "Métricas predictivas de retención y cultural fit." },
                                { icon: Building2, title: "Integración ATS", description: "Conecta con tu sistema de tracking de candidatos existente." }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeInUp}
                                    className="card-pro hover-lift"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[hsl(var(--primary-light))] flex items-center justify-center text-[#1890ff]">
                                            <feature.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-h3 text-[hsl(var(--gray-900))] mb-2">{feature.title}</h3>
                                            <p className="text-body text-[hsl(var(--gray-600))]">{feature.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="py-24">
                    <div className="max-w-6xl mx-auto px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="text-center mb-16"
                        >
                            <motion.h2 variants={fadeInUp} className="text-h1 text-[hsl(var(--gray-900))] mb-4">
                                Planes y Precios
                            </motion.h2>
                            <motion.p variants={fadeInUp} className="text-body-lg text-[hsl(var(--gray-600))]">
                                Gratis para candidatos. Planes flexibles para empresas.
                            </motion.p>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="grid md:grid-cols-3 gap-8"
                        >
                            {[
                                {
                                    name: "Starter",
                                    price: "$99",
                                    period: "/mes",
                                    description: "Para equipos pequeños empezando",
                                    features: ["50 entrevistas/mes", "1 usuario", "Soporte por email", "Analytics básico"],
                                    popular: false
                                },
                                {
                                    name: "Business",
                                    price: "$499",
                                    period: "/mes",
                                    description: "Para empresas en crecimiento",
                                    features: ["300 entrevistas/mes", "5 usuarios", "Soporte prioritario", "Analytics avanzado", "Integraciones API", "Custom branding"],
                                    popular: true
                                },
                                {
                                    name: "Enterprise",
                                    price: "Custom",
                                    period: "",
                                    description: "Para grandes organizaciones",
                                    features: ["Entrevistas ilimitadas", "Usuarios ilimitados", "Account manager", "SLA garantizado", "White-label", "On-premise disponible"],
                                    popular: false
                                }
                            ].map((plan, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeInUp}
                                    className={`relative rounded-xl p-8 ${plan.popular
                                        ? 'bg-white border-2 border-[#1890ff] shadow-lg'
                                        : 'bg-white border border-[hsl(var(--gray-200))]'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="badge-primary px-3 py-1">Más Popular</span>
                                        </div>
                                    )}

                                    <div className="text-center mb-6">
                                        <h3 className="text-h3 text-[hsl(var(--gray-900))] mb-2">{plan.name}</h3>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-h1 text-[hsl(var(--gray-900))]">{plan.price}</span>
                                            <span className="text-body text-[hsl(var(--gray-600))]">{plan.period}</span>
                                        </div>
                                        <p className="text-small text-[hsl(var(--gray-500))] mt-2">{plan.description}</p>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, j) => (
                                            <li key={j} className="flex items-center gap-3 text-body text-[hsl(var(--gray-700))]">
                                                <Check className="w-4 h-4 text-[hsl(var(--success))] flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                                        {plan.name === "Enterprise" ? "Contactar Ventas" : "Comenzar Ahora"}
                                    </Button>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* CTA Final */}
                <section className="py-24 bg-[hsl(var(--gray-900))]">
                    <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-h1 text-white mb-6">
                                ¿Listo para transformar tu proceso de contratación?
                            </h2>
                            <p className="text-body-lg text-[hsl(var(--gray-400))] mb-8 max-w-2xl mx-auto">
                                Únete a más de 800 empresas que ya confían en Reclu para encontrar el mejor talento.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/registro">
                                    <Button className="btn-primary h-14 px-8 text-base">
                                        Comenzar Gratis
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </Link>
                                <Link href="#">
                                    <Button className="h-14 px-8 text-base bg-transparent text-white border border-[hsl(var(--gray-600))] hover:bg-[hsl(var(--gray-800))]">
                                        Ver Demo
                                        <Play className="w-5 h-5" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Footer - Professional */}
                <footer className="py-16 bg-[hsl(var(--gray-900))] border-t border-[hsl(var(--gray-800))]">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid md:grid-cols-5 gap-8 mb-12">
                            {/* Logo & Description */}
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#1890ff] flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">R</span>
                                    </div>
                                    <span className="text-xl font-semibold text-white">Reclu</span>
                                </div>
                                <p className="text-body text-[hsl(var(--gray-400))] max-w-sm">
                                    La plataforma de reclutamiento más avanzada de Latinoamérica.
                                </p>
                            </div>

                            {/* Links */}
                            {[
                                { title: "Producto", links: ["Características", "Precios", "Integraciones", "Changelog"] },
                                { title: "Recursos", links: ["Blog", "Guías", "Webinars", "API Docs"] },
                                { title: "Empresa", links: ["Nosotros", "Carreras", "Contacto", "Prensa"] }
                            ].map((section, i) => (
                                <div key={i}>
                                    <h4 className="text-body font-semibold text-white mb-4">{section.title}</h4>
                                    <ul className="space-y-3">
                                        {section.links.map((link, j) => (
                                            <li key={j}>
                                                <Link href="#" className="text-body text-[hsl(var(--gray-400))] hover:text-white transition-colors">
                                                    {link}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Bottom */}
                        <div className="pt-8 border-t border-[hsl(var(--gray-800))] flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-small text-[hsl(var(--gray-500))]">
                                © 2024 Reclu. Todos los derechos reservados.
                            </p>
                            <div className="flex gap-6">
                                {["Privacidad", "Términos", "Cookies"].map((link, i) => (
                                    <Link key={i} href="#" className="text-small text-[hsl(var(--gray-500))] hover:text-white transition-colors">
                                        {link}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    )
}
