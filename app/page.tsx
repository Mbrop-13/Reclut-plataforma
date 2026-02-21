"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MainHeader } from "@/components/layout/main-header"
import { Input } from "@/components/ui/input"
import {
    Search, MapPin, Filter, X, ChevronDown, Briefcase, Clock, Building2,
    DollarSign, SlidersHorizontal, Sparkles, Globe, Layers, Users, Heart, MessageSquare, Bot, Check, Menu
} from "lucide-react"
import { EMPLEOS } from "@/lib/mock-data"
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { LocationInput } from "@/components/ui/location-input"

const FILTROS = {
    modalidad: {
        label: "Modalidad", icon: Globe, options: ["Remoto", "Híbrido", "Presencial"]
    },
    tipo: {
        label: "Tipo de contrato", icon: Clock, options: ["Tiempo Completo", "Medio Tiempo", "Freelance", "Pasantía", "Por Proyecto"]
    },
    experiencia: {
        label: "Nivel de Experiencia", icon: Layers, options: ["Sin experiencia", "1-2 años", "3-5 años", "5+ años", "10+ años"]
    },
    salario: {
        label: "Rango Salarial", icon: DollarSign, options: ["Hasta $30,000", "$30,000 - $60,000", "$60,000 - $100,000", "$100,000+", "En USD"]
    },
    industria: {
        label: "Industria", icon: Building2, options: [
            "Tecnología y Software", "Fintech bancario", "E-commerce y Retail", "Salud y Biotech", "Consultoría Estratégica",
            "Marketing Digital", "Educación (EdTech)", "Logística y Supply Chain", "Startups", "Inteligencia Artificial",
            "Ciberseguridad", "Energía y Sostenibilidad", "Automotriz", "Telecomunicaciones", "Videojuegos (Gaming)",
            "Medios y Entretenimiento", "Agricultura (AgriTech)", "Bienes Raíces (PropTech)", "Construcción",
            "Turismo y Hospitalidad", "Recursos Humanos (HRTech)", "Legal (LegalTech)", "Manufactura",
            "Servicios Financieros", "Seguros (InsurTech)", "Diseño y UX/UI", "Ventas B2B", "Sector Público",
            "Biotecnología", "Farma", "Alimentos y Bebidas", "Minería", "Petróleo y Gas", "Aeroespacial"
        ]
    },
    tamano: {
        label: "Tamaño de Empresa", icon: Users, options: ["Startup (1-50)", "Pyme (51-200)", "Corporativo (200+)"]
    },
    idioma: {
        label: "Idiomas Requeridos", icon: MessageSquare, options: ["Inglés Nativo", "Inglés Avanzado", "Inglés Intermedio", "Solo Español"]
    },
    beneficios: {
        label: "Beneficios Clave", icon: Heart, options: ["Seguro Médico", "Horario Flexible", "Trabajo Remoto 100%", "4 Días Laborales", "Bono de Desempeño", "Stock Options"]
    },
    plataforma: {
        label: "Características Extra", icon: Bot, options: ["Entrevista con IA", "Alta Compatibilidad (>80%)"]
    }
}

type FilterKey = keyof typeof FILTROS

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [locationQuery, setLocationQuery] = useState("")
    const [industrySearchQuery, setIndustrySearchQuery] = useState("")
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [activeFilters, setActiveFilters] = useState<Record<FilterKey, string[]>>({
        modalidad: [], tipo: [], experiencia: [], salario: [], industria: [], tamano: [], idioma: [], beneficios: [], plataforma: []
    })

    const [firestoreJobs, setFirestoreJobs] = useState<any[]>([])
    const [userProfile, setUserProfile] = useState<any>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)

    // Fetch user profile for recommendations
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user)
            if (user) {
                try {
                    const profileDoc = await getDoc(doc(db, "users", user.uid))
                    if (profileDoc.exists()) {
                        setUserProfile(profileDoc.data())
                    }
                } catch (e) { console.error("Error fetching user profile:", e) }
            } else {
                setUserProfile(null)
            }
        })
        return () => unsubscribe()
    }, [])

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
                        beneficios: d.benefits || [],
                        logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(d.companyName || "E")}&backgroundColor=1890ff`,
                        imagen: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop",
                        publicado: "Reciente",
                        isReal: true,
                        planType: d.planType,
                        maxApplicants: d.maxApplicants,
                        enableAvatarInterview: d.enableAvatarInterview,
                        tamanoEmpresa: d.companySize || "Pyme (51-200)", // Mock if not present
                        idiomas: d.languages || ["Solo Español"] // Mock if not present
                    }
                })
                setFirestoreJobs(jobs)
            } catch (error) {
                console.error("Error fetching jobs:", error)
            }
        }
        fetchJobs()
    }, [])

    // Combine mock + real, prioritize paid jobs and calculate recommendation score
    const allJobs = useMemo(() => {
        const combined = [...firestoreJobs, ...EMPLEOS]

        // Calculate scores
        const scoredJobs = combined.map(job => {
            let score = 0
            let matchScore = 0
            let popularityScore = 0
            let recencyScore = 0
            let qualityScore = 0

            // 1. Profile Match (40%)
            if (userProfile) {
                // Skills Match (20%)
                const userSkills = userProfile.skills || []
                const jobSkills = job.tags || job.requirements || []
                if (userSkills.length > 0 && jobSkills.length > 0) {
                    const matchCount = jobSkills.filter((s: string) =>
                        userSkills.some((us: string) => us.toLowerCase() === s.toLowerCase())
                    ).length
                    matchScore += Math.min((matchCount / Math.max(jobSkills.length, 1)) * 20, 20)
                }

                // Modality Match (10%)
                if (userProfile.preferredWorkMode && job.modalidad) {
                    if (userProfile.preferredWorkMode === job.modalidad || userProfile.preferredWorkMode === "Cualquiera") {
                        matchScore += 10
                    }
                }

                // Salary Match (10%)
                if (userProfile.expectedSalary && job.salaryMax) {
                    if (job.salaryMax >= userProfile.expectedSalary) {
                        matchScore += 10
                    } else if (job.salaryMax >= userProfile.expectedSalary * 0.8) {
                        matchScore += 5
                    }
                }
            }

            // 2. Popularity (30%)
            const applicantCount = job.applicantCount || (Math.floor(Math.random() * 50))
            const premiumBoost = job.planType !== "free" ? 10 : 0
            popularityScore = Math.min((applicantCount / 100) * 20 + premiumBoost, 30)

            // 3. Recency (20%)
            const daysOld = job.daysOld !== undefined ? job.daysOld : Math.floor(Math.random() * 14)
            recencyScore = Math.max(20 - daysOld, 0)

            // 4. Quality (10%)
            if (job.salaryMin && job.salaryMax) qualityScore += 4
            if (job.descripcion && job.descripcion.length > 200) qualityScore += 3
            if (job.beneficios && job.beneficios.length > 0) qualityScore += 3
            else qualityScore += 3

            score = matchScore + popularityScore + recencyScore + qualityScore

            return {
                ...job,
                totalScore: Math.round(score)
            }
        })

        // Sort: Recommended first if logged in
        scoredJobs.sort((a, b) => {
            if (userProfile) {
                return b.totalScore - a.totalScore
            } else {
                if (a.planType === "free" && b.planType !== "free") return 1
                if (a.planType !== "free" && b.planType === "free") return -1
                return b.totalScore - a.totalScore
            }
        })
        return scoredJobs
    }, [firestoreJobs, userProfile])

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
        const resetState = Object.keys(FILTROS).reduce((acc, key) => {
            acc[key as FilterKey] = []
            return acc
        }, {} as Record<FilterKey, string[]>)
        setActiveFilters(resetState)
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

            // Simple string matching filters
            if (activeFilters.modalidad.length > 0 && !activeFilters.modalidad.includes(job.modalidad)) return false
            if (activeFilters.experiencia.length > 0 && !activeFilters.experiencia.includes(job.experienceLevel)) return false // Job Mock structure varies, assuming partial matching for demo

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

            // Industry filter
            if (activeFilters.industria.length > 0) {
                const jobText = `${job.titulo} ${job.descripcion} ${job.tags?.join(' ')} ${job.empresa} ${job.industry || ""}`.toLowerCase()
                const matchesIndustry = activeFilters.industria.some(ind => jobText.includes(ind.toLowerCase()))
                if (!matchesIndustry) return false
            }

            // Platform Filters
            if (activeFilters.plataforma.length > 0) {
                if (activeFilters.plataforma.includes("Entrevista con IA") && !job.enableAvatarInterview) return false
                if (activeFilters.plataforma.includes("Alta Compatibilidad (>80%)") && job.totalScore < 80) return false
            }

            // Benefits Filters (check if job description or benefits array mentions it)
            if (activeFilters.beneficios.length > 0) {
                const jobText = `${job.descripcion} ${job.beneficios?.join(' ') || ""}`.toLowerCase()
                const matchesBenefits = activeFilters.beneficios.every(ben => jobText.includes(ben.toLowerCase().replace("100%", "").trim()))
                if (!matchesBenefits) return false
            }

            // Languages and Size generally would map directly. For this demo we rely on flexible text matching to mock filtering since data varies.
            if (activeFilters.idioma.length > 0) {
                const jobText = `${job.descripcion} ${job.idiomas?.join(' ') || ""}`.toLowerCase()
                const matchesLang = activeFilters.idioma.some(lang => jobText.includes(lang.split(' ')[1]?.toLowerCase() || 'español')) // Simplification
                if (!matchesLang) return false
            }

            return true
        })
    }, [allJobs, searchQuery, locationQuery, activeFilters])

    // RENDER FILTER OPTIONS (Reusable for Desktop Sidebar & Mobile Drawer)
    const renderFilterCategories = () => (
        <div className="space-y-8">
            {(Object.entries(FILTROS) as [FilterKey, typeof FILTROS[FilterKey]][]).map(([key, config]) => {
                const Icon = config.icon

                // For Industry, we apply the local search filter and limit height
                let displayedOptions = config.options
                if (key === 'industria' && industrySearchQuery) {
                    displayedOptions = config.options.filter(opt =>
                        opt.toLowerCase().includes(industrySearchQuery.toLowerCase())
                    )
                }

                // Make Industry scrollable if there are many options
                const maxHClass = key === 'industria' ? 'max-h-[250px] overflow-y-auto pr-2 custom-scrollbar' : ''

                return (
                    <div key={key}>
                        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-slate-600" />
                            </div>
                            {config.label}
                        </h4>

                        {key === 'industria' && (
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar industria..."
                                    value={industrySearchQuery}
                                    onChange={(e) => setIndustrySearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff] placeholder:text-slate-400"
                                />
                            </div>
                        )}

                        <div className={`space-y-2 ${maxHClass}`}>
                            {displayedOptions.length === 0 && key === 'industria' && (
                                <p className="text-xs text-slate-500 italic">No hay industrias que coincidan.</p>
                            )}
                            {displayedOptions.map((option) => {
                                const isActive = activeFilters[key].includes(option)
                                return (
                                    <label key={option} className="flex items-start gap-3 cursor-pointer group">
                                        <div className={`mt-0.5 w-4 h-4 rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'bg-[#1890ff] border-[#1890ff]' : 'border-slate-300 group-hover:border-[#1890ff]'}`}>
                                            {isActive && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                        </div>
                                        <span className={`text-[13px] sm:text-sm transition-colors ${isActive ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                            {option}
                                        </span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50">
            <MainHeader />

            {/* Global Sticky Search Bar (Desktop) */}
            <div className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm hidden md:block">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-3 flex gap-3">
                    <div className="relative flex-1 max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Cargo, empresa, tecnología o palabra clave..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 h-11 bg-slate-50/50 border-slate-200 rounded-xl text-slate-900 focus-visible:ring-[#1890ff]"
                        />
                    </div>
                    <div className="relative w-72">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                        <LocationInput
                            placeholder="Ubicación..."
                            value={locationQuery}
                            onChange={setLocationQuery}
                            className="w-full pl-11 h-11 bg-slate-50/50 border-slate-200 rounded-xl shadow-none"
                        />
                    </div>
                    <Button className="h-11 px-8 rounded-xl bg-[#1890ff] hover:bg-blue-600 text-white font-semibold">
                        Buscar
                    </Button>
                </div>
            </div>

            {/* Hero Search Section (Mobile Focus or First Impression) */}
            <section className="relative bg-white overflow-hidden border-b border-slate-100 md:hidden">
                <div className="absolute top-0 left-1/3 w-[700px] h-[500px] rounded-full bg-[#1890ff]/[0.04] blur-[120px]" />
                <div className="relative z-10 px-6 py-12 pb-14">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                        Encuentra tu próximo <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1890ff] to-indigo-500">desafío profesional</span>
                    </h1>

                    <div className="mt-6 flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                placeholder="Cargo o empresa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 h-12 bg-slate-50 border-slate-200 rounded-xl"
                            />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                            <LocationInput
                                placeholder="Ubicación..."
                                value={locationQuery}
                                onChange={setLocationQuery}
                                className="w-full pl-12 h-12 bg-slate-50 border-slate-200 rounded-xl shadow-none"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Layout (2 Columns: Sidebar + Grid) */}
            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Desktop Sidebar Filters */}
                    <aside className="hidden lg:block w-[280px] xl:w-[320px] flex-shrink-0">
                        <div className="sticky top-[150px] bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-h-[calc(100vh-170px)] overflow-y-auto overflow-x-hidden custom-scrollbar">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                                    <Filter className="w-5 h-5 text-[#1890ff]" />
                                    Filtros Avanzados
                                </h3>
                                {totalActiveFilters > 0 && (
                                    <button onClick={clearAllFilters} className="text-xs font-bold text-[#1890ff] hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors">
                                        Limpiar ({totalActiveFilters})
                                    </button>
                                )}
                            </div>

                            {renderFilterCategories()}
                        </div>
                    </aside>

                    {/* Mobile Filters Drawer */}
                    <AnimatePresence>
                        {showMobileFilters && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    onClick={() => setShowMobileFilters(false)}
                                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
                                />
                                <motion.div
                                    initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white z-50 shadow-2xl flex flex-col lg:hidden"
                                >
                                    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                            <Filter className="w-5 h-5 text-[#1890ff]" />
                                            Filtros de Búsqueda
                                        </h3>
                                        <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                            <X className="w-5 h-5 text-slate-500" />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                                        {renderFilterCategories()}
                                    </div>
                                    <div className="p-4 border-t border-slate-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                                        <div className="flex gap-3">
                                            {totalActiveFilters > 0 && (
                                                <Button variant="outline" onClick={clearAllFilters} className="flex-1 border-slate-200">
                                                    Limpiar
                                                </Button>
                                            )}
                                            <Button onClick={() => setShowMobileFilters(false)} className={`bg-[#1890ff] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 ${totalActiveFilters > 0 ? 'flex-1' : 'w-full'}`}>
                                                Ver {filteredJobs.length} Resultados
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Right Content: Feed */}
                    <div className="flex-1 min-w-0">
                        {/* Feed Controls Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900">Oportunidades Destacadas</h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Mostrando <span className="font-semibold text-slate-700">{filteredJobs.length}</span> empleos reales y remotos
                                </p>
                            </div>

                            {/* Mobile trigger for filters */}
                            <Button
                                variant="outline"
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden w-full sm:w-auto flex items-center justify-center gap-2 h-11 rounded-xl border-slate-200 bg-white"
                            >
                                <Menu className="w-4 h-4 text-slate-600" />
                                Filtros {totalActiveFilters > 0 && <span className="bg-[#1890ff] text-white w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold leading-none">{totalActiveFilters}</span>}
                            </Button>
                        </div>

                        {/* Active Filter Chips */}
                        {totalActiveFilters > 0 && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-wrap gap-2 mb-6 p-4 bg-white rounded-xl border border-blue-100 shadow-sm shadow-blue-500/5">
                                <span className="text-sm font-semibold text-slate-700 flex items-center mr-2">Filtros Activos:</span>
                                {(Object.entries(activeFilters) as [FilterKey, string[]][]).map(([category, values]) =>
                                    values.map(value => (
                                        <button
                                            key={`${category}-${value}`}
                                            onClick={() => toggleFilter(category, value)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#1890ff] text-[13px] font-medium border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                                        >
                                            {value}
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    ))
                                )}
                            </motion.div>
                        )}

                        {/* Job Cards Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                            <AnimatePresence mode="popLayout">
                                {filteredJobs.map((empleo, index) => (
                                    <motion.div
                                        key={empleo.id}
                                        layout
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.02 }}
                                    >
                                        <Link href={`/empleos/${empleo.id}`}>
                                            <div className="group h-full bg-white rounded-2xl border border-slate-200 hover:border-[#1890ff]/40 hover:shadow-xl hover:shadow-blue-500/[0.08] transition-all duration-300 overflow-hidden flex flex-col">
                                                {/* Image */}
                                                <div className="relative h-36 overflow-hidden bg-slate-100">
                                                    <img
                                                        src={empleo.imagen}
                                                        alt={empleo.empresa}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                                                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                                                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/95 backdrop-blur-md text-slate-700 shadow-sm">
                                                            {empleo.modalidad}
                                                        </span>
                                                        {userProfile && (
                                                            <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-green-500/90 backdrop-blur-md text-white shadow-sm flex items-center gap-1.5 border border-green-400/20">
                                                                <Sparkles className="w-3 h-3" />
                                                                {empleo.totalScore}% Match
                                                            </span>
                                                        )}
                                                        {empleo.planType === "free" && !userProfile && (
                                                            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-400/95 backdrop-blur-md text-amber-900 shadow-sm">
                                                                GRATUITO
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                <div className="p-5 pt-10 relative flex-1 flex flex-col">
                                                    {/* Logo */}
                                                    <div className="absolute -top-7 left-5">
                                                        <div className="w-14 h-14 rounded-xl bg-white p-1 shadow-md border border-slate-100 group-hover:-translate-y-1 transition-transform">
                                                            <img src={empleo.logo} alt={empleo.empresa} className="w-full h-full object-contain rounded-lg" />
                                                        </div>
                                                    </div>

                                                    <h3 className="font-bold text-slate-900 group-hover:text-[#1890ff] transition-colors line-clamp-1 mb-1 text-base">
                                                        {empleo.titulo}
                                                    </h3>
                                                    <p className="text-[13px] text-slate-500 flex items-center gap-1.5 mb-3">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                        {empleo.empresa}
                                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                        {empleo.ubicacion}
                                                    </p>

                                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                                                        {empleo.descripcion}
                                                    </p>

                                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                                        {empleo.tags?.slice(0, 3).map((tag: string) => (
                                                            <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-600 text-[11px] font-medium rounded-md border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-[#1890ff] transition-colors">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                                        <span className="text-[15px] font-bold text-slate-800">{empleo.salario}</span>
                                                        <span className="text-sm font-semibold text-[#1890ff] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                                            Postular →
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredJobs.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-white rounded-2xl border border-slate-200 border-dashed">
                                <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-5 border border-slate-100">
                                    <Search className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">No se encontraron resultados</h3>
                                <p className="text-slate-500 mb-6 max-w-sm mx-auto text-sm">
                                    Intenta ajustar los filtros (tienes {totalActiveFilters} activos) o busca términos más generales.
                                </p>
                                <Button
                                    onClick={clearAllFilters}
                                    className="rounded-xl px-6 bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
                                >
                                    Limpiar todos los filtros
                                </Button>
                            </motion.div>
                        )}

                        {filteredJobs.length > 0 && (
                            <div className="mt-12 text-center pb-8 p-1">
                                <Button variant="outline" className="rounded-xl px-8 h-12 border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold shadow-sm transition-all">
                                    Cargar más oportunidades
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
