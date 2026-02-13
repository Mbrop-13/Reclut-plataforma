"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Search, MapPin, Filter, X, ChevronDown
} from "lucide-react"

import { EMPLEOS } from "@/lib/mock-data"

const FILTROS = {
    modalidad: ["Remoto", "Híbrido", "Presencial"],
    tipo: ["Tiempo Completo", "Medio Tiempo", "Freelance", "Pasantía"],
    experiencia: ["Sin experiencia", "1-2 años", "3-5 años", "5+ años"],
    industria: ["Tecnología", "Fintech", "E-commerce", "Salud", "Consultoría"]
}

export default function EmpleosPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [headerVisible, setHeaderVisible] = useState(true)
    const { scrollY } = useScroll()

    // Dynamic header visibility based on scroll direction
    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0
        if (latest > previous && latest > 100) {
            setHeaderVisible(false) // Scrolling down
        } else {
            setHeaderVisible(true) // Scrolling up
        }
    })

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Dynamic Transparent Header */}
            <motion.header
                initial={{ y: 0 }}
                animate={{ y: headerVisible ? 0 : -100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/10"
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-[#1890ff] flex items-center justify-center shadow-lg shadow-[#1890ff]/25">
                                <span className="text-white font-bold text-lg">R</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight hidden sm:block text-slate-900 dark:text-white">
                                Re<span className="text-[#1890ff]">clut</span>
                            </span>
                        </Link>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" className="text-sm font-medium text-white/80 hover:text-white hover:bg-white/10">
                                    Iniciar Sesión
                                </Button>
                            </Link>
                            <Link href="/registro">
                                <Button className="btn-primary rounded-full px-6 shadow-lg shadow-blue-500/30 border-0">
                                    Registrarse
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Premium Hero Section */}
            <div className="relative w-full py-32 lg:py-48 overflow-hidden bg-slate-900">
                {/* Abstract Blurred Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-[#1890ff]/20 blur-[120px]" />
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-[100px]" />
                    <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[120px]" />
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-3xl" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6"
                    >
                        Encuentra tu próximo <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">desafío profesional</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto"
                    >
                        Explora miles de oportunidades laborales en las empresas más innovadoras del mundo.
                        Tu carrera merece un salto de calidad.
                    </motion.p>

                    {/* Search Bar - Floating */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl p-2 rounded-full border border-white/20 shadow-2xl"
                    >
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 w-5 h-5 text-zinc-300" />
                            <Input
                                placeholder="Cargo, empresa o habilidad..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 h-14 bg-transparent border-none rounded-full text-white placeholder:text-zinc-400 focus-visible:ring-0 text-base"
                            />
                            <Button className="h-12 px-8 rounded-full bg-[#1890ff] hover:bg-blue-600 border-0 font-medium">
                                Buscar
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 -mt-20 relative z-20">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 min-h-[500px]">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-8 border-b border-slate-100">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Oportunidades Destacadas</h2>
                            <p className="text-slate-500 mt-1">
                                Mostrando <span className="font-semibold text-slate-900">{EMPLEOS.length}</span> vacantes activas
                            </p>
                        </div>

                        {/* Filter Button */}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`rounded-full px-6 border-slate-200 hover:bg-slate-50 gap-2 ${showFilters ? 'bg-[#1890ff] text-white hover:bg-blue-600 border-blue-600' : ''}`}
                        >
                            <Filter className="w-4 h-4" />
                            Filtros
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </Button>
                    </div>

                    {/* Filter Dropdown Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-8 overflow-hidden"
                            >
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-semibold text-slate-900">Filtrar por características</h3>
                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-4 gap-8">
                                        {Object.entries(FILTROS).map(([categoria, opciones]) => (
                                            <div key={categoria}>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                                    {categoria}
                                                </h4>
                                                <div className="space-y-3">
                                                    {opciones.map((opcion) => (
                                                        <label key={opcion} className="flex items-center gap-3 cursor-pointer group">
                                                            <Checkbox className="border-slate-300 data-[state=checked]:bg-[#1890ff] data-[state=checked]:border-[#1890ff]" />
                                                            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                                                                {opcion}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                                        <Button variant="ghost" className="text-slate-500 hover:text-slate-900">
                                            Limpiar
                                        </Button>
                                        <Button className="btn-primary">
                                            Aplicar
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Job Cards Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {EMPLEOS.map((empleo, index) => (
                            <motion.div
                                key={empleo.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/empleos/${empleo.id}`}>
                                    <div className="group h-full bg-white rounded-2xl border border-slate-200 hover:border-[#1890ff]/40 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col">
                                        {/* Company Header Image */}
                                        <div className="relative h-32 overflow-hidden bg-slate-100">
                                            <img
                                                src={empleo.imagen}
                                                alt={empleo.empresa}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                            <div className="absolute top-4 right-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur shadow-sm text-slate-700">
                                                    {empleo.modalidad}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6 pt-10 relative flex-1 flex flex-col">
                                            {/* Floating Logo */}
                                            <div className="absolute -top-8 left-6">
                                                <div className="w-16 h-16 rounded-xl bg-white p-1 shadow-lg border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                                                    <img
                                                        src={empleo.logo}
                                                        alt={empleo.empresa}
                                                        className="w-full h-full object-contain rounded-lg"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#1890ff] transition-colors line-clamp-1 mb-1">
                                                    {empleo.titulo}
                                                </h3>
                                                <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                                                    {empleo.empresa}
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    {empleo.ubicacion}
                                                </p>
                                            </div>

                                            <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-6 flex-1">
                                                {empleo.descripcion}
                                            </p>

                                            <div className="mt-auto">
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {empleo.tags.slice(0, 3).map((tag) => (
                                                        <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded-md border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 group-hover:border-blue-50 transition-colors">
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {empleo.salario}
                                                    </span>
                                                    <span className="text-xs font-medium text-[#1890ff] group-hover:translate-x-1 transition-transform inline-flex items-center">
                                                        Ver detalle &rarr;
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <Button variant="outline" className="rounded-full px-8 py-6 h-auto text-base border-slate-200 hover:bg-slate-50 text-slate-600">
                            Cargar más oportunidades
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
