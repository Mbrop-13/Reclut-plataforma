"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check, Zap, Star, Briefcase, Building2, HelpCircle } from "lucide-react"

const PLANS = [
    {
        name: "BÁSICO",
        price: 99,
        annualPrice: 990,
        description: "Perfecto para startups y empresas pequeñas",
        icon: Zap,
        features: [
            "20 entrevistas con IA/mes",
            "Scoring automático ilimitado",
            "Ranking de candidatos",
            "2 vacantes activas simultáneas",
            "1 usuario/reclutador",
            "3 avatares estándar",
            "Dashboard básico"
        ],
        idealFor: "Startups, microempresas (1-10 empleados)",
        color: "bg-blue-50 text-blue-600",
        buttonVariant: "outline"
    },
    {
        name: "STARTER",
        price: 199,
        annualPrice: 1990,
        description: "El más popular para PyMEs",
        icon: Briefcase,
        popular: true,
        features: [
            "50 entrevistas con IA/mes",
            "Auto-scheduling inteligente",
            "Comparador de candidatos",
            "Blind hiring mode",
            "5 vacantes activas simultáneas",
            "3 usuarios/reclutadores",
            "8 avatares premium",
            "Soporte prioritario"
        ],
        idealFor: "PyMEs (10-50 empleados)",
        color: "bg-indigo-50 text-indigo-600",
        buttonVariant: "primary"
    },
    {
        name: "PROFESSIONAL",
        price: 599,
        annualPrice: 5990,
        description: "Para empresas en crecimiento",
        icon: Star,
        features: [
            "200 entrevistas con IA/mes",
            "Predicción de retención con IA",
            "Feedback automático",
            "15 vacantes activas simultáneas",
            "5 usuarios/reclutadores",
            "Analytics avanzado",
            "Integraciones ATS",
            "Soporte prioritario"
        ],
        idealFor: "Empresas medianas (50-200 empleados)",
        color: "bg-purple-50 text-purple-600",
        buttonVariant: "outline"
    },
    {
        name: "ENTERPRISE",
        price: 1999,
        annualPrice: 19990,
        description: "Para corporaciones y alto volumen",
        icon: Building2,
        features: [
            "800 entrevistas con IA/mes",
            "Avatares custom",
            "Vacantes ilimitadas",
            "Usuarios ilimitados",
            "Modelos de IA personalizados",
            "API completa",
            "White-label completo",
            "Soporte dedicado 24/7"
        ],
        idealFor: "Corporaciones (200+ empleados)",
        color: "bg-gray-50 text-gray-900",
        buttonVariant: "outline"
    }
]

export default function PlanesPage() {
    const [isAnnual, setIsAnnual] = useState(false)

    return (
        <div className="min-h-screen bg-[hsl(var(--gray-50))] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center mb-16">
                <h1 className="text-4xl font-bold text-[hsl(var(--gray-900))] mb-4">
                    Planes flexibles para cada etapa
                </h1>
                <p className="text-xl text-[hsl(var(--gray-600))] mb-8">
                    Elige el plan que mejor se adapte a tus necesidades de contratación
                </p>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-4 mb-4">
                    <span className={`text-sm font-medium ${!isAnnual ? 'text-[hsl(var(--gray-900))]' : 'text-[hsl(var(--gray-500))]'}`}>
                        Mensual
                    </span>
                    <button
                        onClick={() => setIsAnnual(!isAnnual)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1890ff] focus:ring-offset-2 ${isAnnual ? 'bg-[#1890ff]' : 'bg-[hsl(var(--gray-300))]'
                            }`}
                    >
                        <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-7' : 'translate-x-1'
                                }`}
                        />
                    </button>
                    <span className={`text-sm font-medium ${isAnnual ? 'text-[hsl(var(--gray-900))]' : 'text-[hsl(var(--gray-500))]'}`}>
                        Anual <span className="text-green-600 font-bold ml-1">(-17% OFF)</span>
                    </span>
                </div>

                {isAnnual && (
                    <p className="text-sm text-green-600 font-medium animate-pulse">
                        ¡2 meses gratis con el plan anual!
                    </p>
                )}
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {PLANS.map((plan) => {
                    const price = isAnnual ? plan.annualPrice : plan.price
                    const savings = isAnnual ? (plan.price * 12) - plan.annualPrice : 0

                    return (
                        <div
                            key={plan.name}
                            className={`relative bg-white rounded-2xl shadow-sm border ${plan.popular ? 'border-[#1890ff] ring-2 ring-[#1890ff]/20' : 'border-[hsl(var(--gray-200))]'
                                } p-8 flex flex-col hover:shadow-lg transition-shadow duration-300`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
                                    <span className="bg-[#1890ff] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        Popular
                                    </span>
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-xl ${plan.color} flex items-center justify-center mb-6`}>
                                <plan.icon className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-bold text-[hsl(var(--gray-900))] mb-2">{plan.name}</h3>
                            <p className="text-sm text-[hsl(var(--gray-500))] mb-6 h-10">{plan.description}</p>

                            <div className="mb-6">
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-bold text-[hsl(var(--gray-900))]">${price}</span>
                                    <span className="text-sm text-[hsl(var(--gray-500))] ml-2">/{isAnnual ? 'año' : 'mes'}</span>
                                </div>
                                {isAnnual && (
                                    <p className="text-xs text-green-600 font-medium mt-1">
                                        Ahorras ${savings}
                                    </p>
                                )}
                            </div>

                            <Button
                                className={`w-full mb-8 ${plan.name === 'STARTER' ? 'btn-primary' : 'btn-secondary'
                                    }`}
                            >
                                {plan.name === 'ENTERPRISE' ? 'Contactar Ventas' : 'Contratar Plan'}
                            </Button>

                            <div className="flex-1 space-y-4 mb-8">
                                <p className="text-xs font-semibold text-[hsl(var(--gray-900))] uppercase tracking-wider">
                                    Incluye:
                                </p>
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm text-[hsl(var(--gray-600))]">
                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-[hsl(var(--gray-100))]">
                                <p className="text-xs text-[hsl(var(--gray-500))] text-center italic">
                                    Ideal para: {plan.idealFor}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="max-w-3xl mx-auto mt-20 text-center">
                <h2 className="text-2xl font-bold text-[hsl(var(--gray-900))] mb-4">¿Tienes preguntas?</h2>
                <div className="space-y-4 text-[hsl(var(--gray-600))]">
                    <p>
                        Todos los planes incluyen una garantía de satisfacción de 14 días.
                        Puedes cambiar o cancelar tu plan en cualquier momento.
                    </p>
                    <Button variant="link" className="text-[#1890ff]">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Hablar con un especialista
                    </Button>
                </div>
            </div>
        </div>
    )
}
