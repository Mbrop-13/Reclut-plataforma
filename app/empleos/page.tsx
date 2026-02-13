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
        <div className="min-h-screen bg-[hsl(var(--gray-100))]">
            {/* Dynamic Transparent Header */}
            <motion.header
                initial={{ y: 0 }}
                animate={{ y: headerVisible ? 0 : -100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20"
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-[#1890ff] flex items-center justify-center shadow-lg shadow-[#1890ff]/25">
                                <span className="text-white font-bold text-lg">R</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight hidden sm:block">
                                <span className="text-[#1890ff]">Re</span>
                                <span className="text-[hsl(var(--gray-900))]">clut</span>
                            </span>
                        </Link>

                        {/* Central Search Bar */}
                        <div className="flex-1 max-w-xl mx-8">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--gray-400))]" />
                                <Input
                                    placeholder="Busca tu trabajo soñado..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 h-12 bg-[hsl(var(--gray-100))] border-none rounded-full text-base placeholder:text-[hsl(var(--gray-400))] focus:ring-2 focus:ring-[#1890ff]/20"
                                />
                            </div>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" className="text-sm font-medium text-[hsl(var(--gray-600))] hover:text-[hsl(var(--gray-900))]">
                                    Iniciar Sesión
                                </Button>
                            </Link>
                            <Link href="/registro">
                                <Button className="btn-primary rounded-full px-6">
                                    Registrarse
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="pt-28 pb-16 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-h1 text-[hsl(var(--gray-900))] mb-2">Oportunidades para ti</h1>
                            <p className="text-body text-[hsl(var(--gray-600))]">
                                <span className="font-semibold">{EMPLEOS.length} empleos</span> encontrados
                            </p>
                        </div>

                        {/* Filter Button */}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn-secondary rounded-full px-6 gap-2 ${showFilters ? 'bg-[#1890ff] text-white border-[#1890ff]' : ''}`}
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
                                <div className="bg-white rounded-2xl border border-[hsl(var(--gray-200))] p-6 shadow-lg">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-h3 text-[hsl(var(--gray-900))]">Filtrar resultados</h3>
                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="text-[hsl(var(--gray-400))] hover:text-[hsl(var(--gray-600))]"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-4 gap-8">
                                        {Object.entries(FILTROS).map(([categoria, opciones]) => (
                                            <div key={categoria}>
                                                <h4 className="text-body font-semibold text-[hsl(var(--gray-900))] mb-4 capitalize">
                                                    {categoria}
                                                </h4>
                                                <div className="space-y-3">
                                                    {opciones.map((opcion) => (
                                                        <label key={opcion} className="flex items-center gap-3 cursor-pointer group">
                                                            <Checkbox className="border-[hsl(var(--gray-300))] data-[state=checked]:bg-[#1890ff] data-[state=checked]:border-[#1890ff]" />
                                                            <span className="text-body text-[hsl(var(--gray-600))] group-hover:text-[hsl(var(--gray-900))]">
                                                                {opcion}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[hsl(var(--gray-200))]">
                                        <Button variant="ghost" className="text-[hsl(var(--gray-600))]">
                                            Limpiar filtros
                                        </Button>
                                        <Button className="btn-primary">
                                            Aplicar filtros
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Job Cards Grid - 3 per row */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {EMPLEOS.map((empleo, index) => (
                            <motion.div
                                key={empleo.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link href={`/empleos/${empleo.id}`}>
                                    <div className="group bg-white rounded-2xl overflow-hidden border border-[hsl(var(--gray-200))] hover:border-[#1890ff]/30 hover:shadow-xl transition-all duration-300 cursor-pointer">
                                        {/* Company Image */}
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={empleo.imagen}
                                                alt={empleo.empresa}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {/* Overlay gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                            {/* Modalidad badge */}
                                            <div className="absolute top-4 right-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-[hsl(var(--gray-700))]">
                                                    {empleo.modalidad}
                                                </span>
                                            </div>

                                            {/* Logo on image */}
                                            <div className="absolute bottom-4 left-4 flex items-center gap-3">
                                                <img
                                                    src={empleo.logo}
                                                    alt={empleo.empresa}
                                                    className="w-12 h-12 rounded-xl border-2 border-white shadow-lg"
                                                />
                                                <div>
                                                    <h3 className="text-white font-semibold text-lg leading-tight">{empleo.empresa}</h3>
                                                    <p className="text-white/80 text-sm flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {empleo.ubicacion}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-5">
                                            <h2 className="text-h3 text-[hsl(var(--gray-900))] mb-2 group-hover:text-[#1890ff] transition-colors">
                                                {empleo.titulo}
                                            </h2>
                                            <p className="text-body text-[hsl(var(--gray-600))] mb-4 line-clamp-2">
                                                {empleo.descripcion}
                                            </p>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {empleo.tags.map((tag) => (
                                                    <span key={tag} className="badge-primary text-xs">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--gray-100))]">
                                                <span className="text-[#1890ff] font-semibold text-sm">
                                                    {empleo.salario}
                                                </span>
                                                <span className="text-small text-[hsl(var(--gray-500))]">
                                                    {empleo.publicado}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Load More */}
                    <div className="mt-12 text-center">
                        <Button className="btn-secondary rounded-full px-8">
                            Cargar más empleos
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
