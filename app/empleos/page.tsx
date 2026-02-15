"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MainHeader } from "@/components/layout/main-header"
import { Input } from "@/components/ui/input"
import {
    Search, MapPin, Filter, X, ChevronDown, Briefcase, Clock, Building2,
    DollarSign, SlidersHorizontal, Sparkles, Globe, Layers
} from "lucide-react"
import { EMPLEOS } from "@/lib/mock-data"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { LocationInput } from "@/components/ui/location-input"

const FILTROS = {
    modalidad: {
        label: "Modalidad",
        icon: Globe,
        options: ["Remoto", "Híbrido", "Presencial"]
    },
    tipo: {
        label: "Tipo de empleo",
        icon: Clock,
        options: ["Tiempo Completo", "Medio Tiempo", "Freelance", "Pasantía", "Por Proyecto"]
    },
    experiencia: {
        label: "Experiencia",
        icon: Layers,
        options: ["Sin experiencia", "1-2 años", "3-5 años", "5+ años", "10+ años"]
    },
    industria: {
        label: "Industria",
        icon: Building2,
        options: [
            "Tecnología",
            "Fintech",
            "E-commerce",
            "Salud y Biotech",
            "Consultoría",
            "Educación",
            "Marketing Digital",
            "Logística",
            "Ciberseguridad",
            "Inteligencia Artificial",
            "Recursos Humanos",
            "Legal",
            "Energía y Sostenibilidad",
            "Seguros",
            "Telecomunicaciones",
            "Automotriz",
            "Banca y Finanzas",
            "Gobierno",
            "Retail",
            "Startups",
            "Agroindustria",
            "Turismo y Hospitalidad",
        ]
    },
    salario: {
        label: "Rango Salarial",
        icon: DollarSign,
        options: ["Hasta $30,000", "$30,000 - $60,000", "$60,000 - $100,000", "$100,000+", "En USD"]
    }
}

type FilterKey = keyof typeof FILTROS

export default function EmpleosPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [locationQuery, setLocationQuery] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [activeFilters, setActiveFilters] = useState<Record<FilterKey, string[]>>({
        modalidad: [],
        tipo: [],
        experiencia: [],
        industria: [],
        salario: []
    })
    const [firestoreJobs, setFirestoreJobs] = useState<any[]>([])

    // Fetch real jobs from Firestore
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const q = query(collection(db, "jobs"), where("status", "==", "active"))
                const snapshot = await getDocs(q)
                const jobs = snapshot.docs.map(doc => {
                    const d = doc.data()
                    return {
                        id: doc.id,
                        titulo: d.title,
                        empresa: d.companyName || "Empresa",
                        ubicacion: d.location,
                        modalidad: d.workMode,
                        salario: `${d.currency} ${d.salaryMin?.toLocaleString()} - ${d.salaryMax?.toLocaleString()}`,
                        salaryMin: d.salaryMin,
                        salaryMax: d.salaryMax,
                        currency: d.currency,
                        descripcion: d.description,
                        tags: d.requirements?.slice(0, 4) || [],
                        logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(d.companyName || "E")}&backgroundColor=1890ff`,
                        imagen: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop",
                        publicado: "Reciente",
                        isReal: true,
                        planType: d.planType,
                        maxApplicants: d.maxApplicants
                    }
                })
                setFirestoreJobs(jobs)
            } catch (error) {
                console.error("Error fetching jobs:", error)
            }
        }
        fetchJobs()
    }, [])

    // Combine mock + real, prioritize paid jobs
    const allJobs = useMemo(() => {
        const combined = [...firestoreJobs, ...EMPLEOS]
        // Sort: paid jobs first, then free, then mock
        combined.sort((a, b) => {
            if (a.planType === "free" && b.planType !== "free") return 1
            if (a.planType !== "free" && b.planType === "free") return -1
            return 0
        })
        return combined
    }, [firestoreJobs])

    // Toggle filter
    const toggleFilter = (category: FilterKey, value: string) => {
        setActiveFilters(prev => {
            const current = prev[category]
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value]
            return { ...prev, [category]: updated }
        })
    }

    const clearAllFilters = () => {
        setActiveFilters({
            modalidad: [],
            tipo: [],
            experiencia: [],
            industria: [],
            salario: []
        })
        setSearchQuery("")
        setLocationQuery("")
    }

    const totalActiveFilters = Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0)

    // FUNCTIONAL FILTERING
    const filteredJobs = useMemo(() => {
        return allJobs.filter(job => {
            // Text search
            if (searchQuery) {
                const q = searchQuery.toLowerCase()
                const matchesText =
                    job.titulo?.toLowerCase().includes(q) ||
                    job.empresa?.toLowerCase().includes(q) ||
                    job.descripcion?.toLowerCase().includes(q) ||
                    job.tags?.some((t: string) => t.toLowerCase().includes(q))
                if (!matchesText) return false
            }

            // Location search
            if (locationQuery) {
                const loc = locationQuery.toLowerCase()
                if (!job.ubicacion?.toLowerCase().includes(loc)) return false
            }

            // Modalidad filter
            if (activeFilters.modalidad.length > 0) {
                if (!activeFilters.modalidad.includes(job.modalidad)) return false
            }

            // Salary filter
            if (activeFilters.salario.length > 0) {
                const matchesSalary = activeFilters.salario.some(range => {
                    const min = job.salaryMin || 0
                    if (range === "Hasta $30,000") return min <= 30000
                    if (range === "$30,000 - $60,000") return min >= 30000 && min <= 60000
                    if (range === "$60,000 - $100,000") return min >= 60000 && min <= 100000
                    if (range === "$100,000+") return min >= 100000
                    if (range === "En USD") return job.currency === "USD"
                    return true
                })
                if (!matchesSalary) return false
            }

            // Industry filter (match against tags + description)
            if (activeFilters.industria.length > 0) {
                const jobText = `${job.titulo} ${job.descripcion} ${job.tags?.join(' ')} ${job.empresa}`.toLowerCase()
                const matchesIndustry = activeFilters.industria.some(ind =>
                    jobText.includes(ind.toLowerCase())
                )
                if (!matchesIndustry) return false
            }

            return true
        })
    }, [allJobs, searchQuery, locationQuery, activeFilters])

    return (
        <div className="min-h-screen bg-slate-50">
            <MainHeader />

            {/* Hero Search Section */}
            <section className="relative bg-white overflow-hidden border-b border-slate-100">
                <div className="absolute top-0 left-1/3 w-[700px] h-[500px] rounded-full bg-[#1890ff]/[0.04] blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500/[0.03] blur-[100px]" />

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-16 pb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4"
                    >
                        Encuentra tu próximo{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1890ff] to-indigo-500">
                            desafío profesional
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="text-slate-500 mb-10 max-w-xl mx-auto"
                    >
                        Explora oportunidades en las empresas más innovadoras de LATAM
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    placeholder="Cargo, empresa o habilidad..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 h-13 bg-slate-50 border-none rounded-xl text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#1890ff] text-base"
                                />
                            </div>
                            <div className="relative flex-1 sm:border-l border-slate-200 sm:pl-3">
                                <MapPin className="absolute left-4 sm:left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                                <LocationInput
                                    placeholder="Ciudad, región o comuna..."
                                    value={locationQuery}
                                    onChange={setLocationQuery}
                                    className="w-full pl-12 sm:pl-14 h-13 bg-slate-50 border-none rounded-xl text-slate-900 shadow-none hover:bg-slate-100/80 text-base"
                                />
                            </div>
                            <Button className="h-13 px-8 rounded-xl bg-[#1890ff] hover:bg-blue-600 text-white font-semibold text-base shadow-lg shadow-blue-500/25 whitespace-nowrap">
                                Buscar
                            </Button>
                        </div>

                        {/* Quick filters chips */}
                        <div className="flex flex-wrap justify-center gap-2 mt-5">
                            {["Remoto", "Tecnología", "Diseño", "Marketing", "En USD"].map(chip => {
                                const isActive = searchQuery === chip
                                return (
                                    <button
                                        key={chip}
                                        onClick={() => setSearchQuery(isActive ? "" : chip)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isActive
                                            ? "bg-[#1890ff] text-white shadow-md shadow-blue-500/25"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"}`}
                                    >
                                        {chip}
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 pb-20">
                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Oportunidades Destacadas</h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            <span className="font-semibold text-slate-700">{filteredJobs.length}</span> vacantes encontradas
                            {totalActiveFilters > 0 && (
                                <span className="ml-2 text-[#1890ff]">
                                    ({totalActiveFilters} filtro{totalActiveFilters > 1 ? 's' : ''} activo{totalActiveFilters > 1 ? 's' : ''})
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {totalActiveFilters > 0 && (
                            <Button
                                variant="ghost"
                                onClick={clearAllFilters}
                                className="text-sm text-slate-500 hover:text-red-500 gap-1"
                            >
                                <X className="w-3.5 h-3.5" />
                                Limpiar filtros
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`rounded-xl px-5 gap-2 border-slate-200 hover:bg-white ${showFilters ? 'bg-[#1890ff] text-white hover:bg-blue-600 border-[#1890ff] hover:text-white' : ''}`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filtros
                            {totalActiveFilters > 0 && (
                                <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${showFilters ? 'bg-white text-[#1890ff]' : 'bg-[#1890ff] text-white'}`}>
                                    {totalActiveFilters}
                                </span>
                            )}
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* Active Filter Chips */}
                {totalActiveFilters > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-2 mb-6"
                    >
                        {(Object.entries(activeFilters) as [FilterKey, string[]][]).map(([category, values]) =>
                            values.map(value => (
                                <button
                                    key={`${category}-${value}`}
                                    onClick={() => toggleFilter(category, value)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-[#1890ff] text-sm font-medium border border-blue-100 hover:bg-blue-100 transition-colors"
                                >
                                    {value}
                                    <X className="w-3 h-3" />
                                </button>
                            ))
                        )}
                    </motion.div>
                )}

                {/* Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 overflow-hidden"
                        >
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-[#1890ff]" />
                                        Filtrar resultados
                                    </h3>
                                    <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                    {(Object.entries(FILTROS) as [FilterKey, typeof FILTROS[FilterKey]][]).map(([key, config]) => {
                                        const Icon = config.icon
                                        return (
                                            <div key={key}>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {config.label}
                                                </h4>
                                                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                                                    {config.options.map((option) => {
                                                        const isActive = activeFilters[key].includes(option)
                                                        return (
                                                            <button
                                                                key={option}
                                                                onClick={() => toggleFilter(key, option)}
                                                                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${isActive
                                                                    ? 'bg-[#1890ff] text-white font-medium shadow-sm'
                                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                                    }`}
                                                            >
                                                                {option}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-between items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                                    <span className="text-sm text-slate-500">
                                        {totalActiveFilters} filtro{totalActiveFilters !== 1 ? 's' : ''} seleccionado{totalActiveFilters !== 1 ? 's' : ''}
                                    </span>
                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={clearAllFilters} className="text-slate-500">
                                            Limpiar todo
                                        </Button>
                                        <Button onClick={() => setShowFilters(false)} className="bg-[#1890ff] hover:bg-blue-600 text-white rounded-xl px-6">
                                            Ver {filteredJobs.length} resultados
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Job Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AnimatePresence mode="popLayout">
                        {filteredJobs.map((empleo, index) => (
                            <motion.div
                                key={empleo.id}
                                layout
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <Link href={`/empleos/${empleo.id}`}>
                                    <div className="group h-full bg-white rounded-2xl border border-slate-200 hover:border-[#1890ff]/30 hover:shadow-xl hover:shadow-blue-500/[0.06] transition-all duration-300 overflow-hidden flex flex-col">
                                        {/* Image */}
                                        <div className="relative h-36 overflow-hidden bg-slate-100">
                                            <img
                                                src={empleo.imagen}
                                                alt={empleo.empresa}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                            <div className="absolute top-3 right-3 flex gap-2">
                                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm">
                                                    {empleo.modalidad}
                                                </span>
                                                {empleo.planType === "free" && (
                                                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-400/90 backdrop-blur-sm text-amber-900 shadow-sm">
                                                        GRATUITO
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="p-5 pt-10 relative flex-1 flex flex-col">
                                            {/* Logo */}
                                            <div className="absolute -top-7 left-5">
                                                <div className="w-14 h-14 rounded-xl bg-white p-1 shadow-lg border border-slate-100 group-hover:scale-105 transition-transform">
                                                    <img src={empleo.logo} alt={empleo.empresa} className="w-full h-full object-contain rounded-lg" />
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-slate-900 group-hover:text-[#1890ff] transition-colors line-clamp-1 mb-1">
                                                {empleo.titulo}
                                            </h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-3">
                                                <Building2 className="w-3.5 h-3.5" />
                                                {empleo.empresa}
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                {empleo.ubicacion}
                                            </p>

                                            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                                                {empleo.descripcion}
                                            </p>

                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {empleo.tags?.slice(0, 3).map((tag: string) => (
                                                    <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs rounded-md border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                <span className="text-sm font-semibold text-slate-800">{empleo.salario}</span>
                                                <span className="text-xs font-semibold text-[#1890ff] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                                                    Ver más →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredJobs.length > 0 && (
                    <div className="mt-12 text-center">
                        <Button variant="outline" className="rounded-xl px-8 py-5 h-auto border-slate-200 hover:bg-white text-slate-600 font-medium">
                            Cargar más oportunidades
                        </Button>
                    </div>
                )}

                {filteredJobs.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Sin resultados</h3>
                        <p className="text-slate-500 mb-6">
                            No encontramos vacantes con estos filtros. Intenta ampliar tu búsqueda.
                        </p>
                        <Button
                            onClick={clearAllFilters}
                            variant="outline"
                            className="rounded-xl px-6"
                        >
                            Limpiar todos los filtros
                        </Button>
                    </div>
                )}
            </main>
        </div>
    )
}
