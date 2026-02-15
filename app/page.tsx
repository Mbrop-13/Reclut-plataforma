"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MainHeader } from "@/components/layout/main-header"
import {
    Search, Briefcase, Building2, Users, Clock, Shield,
    Zap, Check, Star, Play, ArrowRight, Sparkles,
    TrendingUp, Globe, Bot, ChevronRight
} from "lucide-react"

const fadeIn = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
}
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

export default function Home() {
    return (
        <div className="min-h-screen bg-white overflow-hidden">
            <MainHeader />

            {/* ═══════════════ HERO ═══════════════ */}
            <section className="relative min-h-[88vh] flex items-center bg-white">
                {/* Subtle background accents */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[#1890ff]/[0.04] blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500/[0.03] blur-[100px]" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center py-20">
                    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
                        {/* Badge */}
                        <motion.div variants={fadeIn}>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-[#1890ff] text-sm font-medium">
                                <Sparkles className="w-4 h-4" />
                                La nueva era del reclutamiento
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1 variants={fadeIn} className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                            Conecta con el mejor{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1890ff] via-blue-500 to-indigo-500">
                                talento profesional
                            </span>
                            <br />
                            de forma ágil y efectiva
                        </motion.h1>

                        {/* Sub */}
                        <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Optimiza tus procesos de selección con herramientas avanzadas diseñadas
                            para encontrar al candidato ideal en tiempo récord.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link href="/empleos">
                                <Button className="h-14 px-8 text-base font-semibold rounded-xl bg-[#1890ff] hover:bg-blue-600 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
                                    <Search className="w-5 h-5 mr-2" />
                                    Buscar Empleos
                                </Button>
                            </Link>
                            <Link href="/registro/empresa">
                                <Button className="h-14 px-8 text-base font-semibold rounded-xl bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 transition-all">
                                    <Building2 className="w-5 h-5 mr-2" />
                                    Publicar Vacantes
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Trust */}
                        <motion.div variants={fadeIn} className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-8 text-sm text-slate-500">
                            {[
                                { icon: Check, text: "Gratis para candidatos" },
                                { icon: Shield, text: "Empresas verificadas" },
                                { icon: Clock, text: "Respuestas en 24h" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <item.icon className="w-4 h-4 text-emerald-500" />
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════ STATS ═══════════════ */}
            <section className="py-20 bg-white relative">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
                        variants={stagger}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        {[
                            { value: "5,000+", label: "Empleos Activos", icon: Briefcase },
                            { value: "800+", label: "Empresas", icon: Building2 },
                            { value: "15K+", label: "Candidatos", icon: Users },
                            { value: "95%", label: "Satisfacción", icon: Star },
                        ].map((stat, i) => (
                            <motion.div key={i} variants={fadeIn} className="text-center group">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-[#1890ff] mb-4 group-hover:bg-[#1890ff] group-hover:text-white transition-colors duration-300">
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════ CÓMO FUNCIONA ═══════════════ */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
                        <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-[#1890ff] text-xs font-semibold uppercase tracking-wider mb-4">
                            Proceso Simple
                        </motion.div>
                        <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Tu empleo ideal en 3 pasos
                        </motion.h2>
                        <motion.p variants={fadeIn} className="text-lg text-slate-500 max-w-xl mx-auto">
                            Sin complicaciones. Crea tu perfil, postúlate y entrevístate con IA.
                        </motion.p>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: "01", icon: Users, title: "Crea tu perfil", desc: "Completa tu información profesional en menos de 5 minutos. Sube tu CV y destaca tus habilidades.", color: "from-blue-500 to-blue-600" },
                            { step: "02", icon: Bot, title: "Entrevista con IA", desc: "Realiza entrevistas con avatares inteligentes 24/7. Recibe feedback inmediato sobre tu desempeño.", color: "from-indigo-500 to-purple-600" },
                            { step: "03", icon: Briefcase, title: "Recibe ofertas", desc: "Las empresas revisan tu perfil y entrevista. Recibe ofertas personalizadas con match score.", color: "from-emerald-500 to-teal-600" },
                        ].map((item, i) => (
                            <motion.div key={i} variants={fadeIn} className="relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 group">
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div className="text-xs font-bold text-[#1890ff] uppercase tracking-widest mb-3">Paso {item.step}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════ PARA EMPRESAS ═══════════════ */}
            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
                        <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-4">
                            Para Empresas
                        </motion.div>
                        <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Contrata mejor, más rápido
                        </motion.h2>
                        <motion.p variants={fadeIn} className="text-lg text-slate-500 max-w-xl mx-auto">
                            Herramientas de IA que reducen el tiempo de contratación un 70%
                        </motion.p>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Clock, title: "Entrevistas 24/7", desc: "Candidatos se entrevistan en cualquier momento sin coordinar horarios." },
                            { icon: Zap, title: "70% Más Rápido", desc: "Reduce el tiempo de contratación con evaluaciones automáticas por IA." },
                            { icon: TrendingUp, title: "Pre-evaluados", desc: "Candidatos evaluados con scoring de competencias y cultural fit." },
                            { icon: Shield, title: "Sin Sesgos", desc: "Evaluaciones objetivas basadas en habilidades y potencial." },
                            { icon: Star, title: "Analytics Avanzado", desc: "Métricas predictivas de retención y desempeño del candidato." },
                            { icon: Globe, title: "Alcance LATAM", desc: "Accede a talento de toda Latinoamérica desde una sola plataforma." },
                        ].map((item, i) => (
                            <motion.div key={i} variants={fadeIn} className="flex gap-4 p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all group">
                                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-[#1890ff] group-hover:bg-[#1890ff] group-hover:text-white transition-colors">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════ PRICING ═══════════════ */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
                        <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Planes y Precios
                        </motion.h2>
                        <motion.p variants={fadeIn} className="text-lg text-slate-500">
                            Gratis para candidatos. Planes flexibles para empresas.
                        </motion.p>
                    </motion.div>

                    {[
                        {
                            name: "Básico", price: "$99", period: "/mes",
                            desc: "Perfecto para startups y empresas pequeñas",
                            features: ["20 entrevistas con IA/mes", "Scoring automático", "2 vacantes activas", "1 usuario"],
                            popular: false
                        },
                        {
                            name: "Starter", price: "$199", period: "/mes",
                            desc: "El más popular para PyMEs",
                            features: ["50 entrevistas con IA/mes", "Auto-scheduling", "5 vacantes activas", "3 usuarios", "Soporte prioritario"],
                            popular: true
                        },
                        {
                            name: "Professional", price: "$599", period: "/mes",
                            desc: "Para empresas en crecimiento",
                            features: ["200 entrevistas con IA/mes", "Analytics avanzado", "15 vacantes activas", "5 usuarios", "Integraciones ATS"],
                            popular: false
                        }
                    ].map((plan, i) => (
                        <motion.div
                            key={i}
                            variants={fadeIn}
                            className={`relative rounded-2xl p-8 transition-all flex flex-col ${plan.popular
                                ? "bg-white border-2 border-[#1890ff] shadow-xl shadow-blue-500/10 scale-[1.02] z-10"
                                : "bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    <span className="px-4 py-1.5 rounded-full bg-[#1890ff] text-white text-xs font-bold shadow-lg">
                                        Más Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                    <span className="text-slate-500">{plan.period}</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-2">{plan.desc}</p>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="flex items-center gap-3 text-sm text-slate-700">
                                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/registro/empresa" className="mt-auto">
                                <Button className={`w-full h-12 rounded-xl font-semibold ${plan.popular
                                    ? "bg-[#1890ff] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                                    }`}>
                                    Comenzar
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Custom Plan Option */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    className="mt-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 p-1 pl-4 bg-white rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-sm font-medium text-slate-700">¿Necesitas un plan a medida?</span>
                        <Link href="/soporte">
                            <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-900 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer">
                                Contáctanos
                            </span>
                        </Link>
                    </div>
                </motion.div>
        </div>
            </section >

        {/* ═══════════════ CTA FINAL ═══════════════ */ }
        < section className = "relative py-28 bg-slate-50" >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#1890ff]/[0.04] blur-[120px]" />
                <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                            ¿Listo para transformar tu proceso de contratación?
                        </h2>
                        <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto">
                            Únete a más de 800 empresas que ya confían en Reclut.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/registro">
                                <Button className="h-14 px-8 text-base font-semibold rounded-xl bg-[#1890ff] hover:bg-blue-600 text-white shadow-xl shadow-blue-500/25 transition-all">
                                    Comenzar Gratis
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link href="#">
                                <Button className="h-14 px-8 text-base font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all">
                                    <Play className="w-5 h-5 mr-2" />
                                    Ver Demo
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section >

        {/* ═══════════════ FOOTER ═══════════════ */ }
        < footer className = "bg-white border-t border-slate-200" >
            <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-5 gap-8 mb-12">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#1890ff] flex items-center justify-center">
                                <span className="text-white font-bold text-sm">R</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900">Re<span className="text-[#1890ff]">clut</span></span>
                        </div>
                        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                            La plataforma de reclutamiento con IA más avanzada de Latinoamérica.
                        </p>
                    </div>
                    {[
                        { title: "Producto", links: ["Características", "Precios", "Integraciones"] },
                        { title: "Recursos", links: ["Blog", "Guías", "API Docs"] },
                        { title: "Empresa", links: ["Nosotros", "Carreras", "Contacto"] }
                    ].map((section, i) => (
                        <div key={i}>
                            <h4 className="text-sm font-semibold text-slate-900 mb-4">{section.title}</h4>
                            <ul className="space-y-2.5">
                                {section.links.map((link, j) => (
                                    <li key={j}>
                                        <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-400">© {new Date().getFullYear()} Reclut. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        {["Privacidad", "Términos", "Cookies"].map((link, i) => (
                            <Link key={i} href="#" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">{link}</Link>
                        ))}
                    </div>
                </div>
            </div>
            </footer >
        </div >
    )
}
