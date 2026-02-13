"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Globe, MapPin, Building2, Briefcase, ArrowLeft } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export default function EmpresaProfilePage() {
    const params = useParams()
    const slug = params.slug as string
    const [company, setCompany] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchCompany = async () => {
            if (!slug) return
            try {
                const docRef = doc(db, "companies", slug)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    setCompany(docSnap.data())
                } else {
                    console.log("No such company!")
                }
            } catch (error) {
                console.error("Error fetching company:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCompany()
    }, [slug])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--gray-50))]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (!company) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--gray-50))] p-4 text-center">
                <Building2 className="w-16 h-16 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Empresa no encontrada</h1>
                <p className="text-gray-500 mb-6">La empresa que buscas no existe o el enlace es incorrecto.</p>
                <Link href="/">
                    <Button variant="outline">Ir al inicio</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--gray-50))]">
            {/* Header / Cover */}
            <div className="bg-white border-b border-[hsl(var(--gray-200))]">
                <div className="container py-8">
                    <Link href="/empleos" className="inline-flex items-center text-sm text-[hsl(var(--gray-500))] hover:text-[hsl(var(--gray-900))] mb-6">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a empleos
                    </Link>

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Logo */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl border border-[hsl(var(--gray-200))] bg-white p-2 flex items-center justify-center shadow-sm">
                            {company.logoUrl ? (
                                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain rounded-lg" />
                            ) : (
                                <Building2 className="w-12 h-12 text-[hsl(var(--gray-300))]" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-[hsl(var(--gray-900))] mb-2">{company.name}</h1>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-[hsl(var(--gray-600))]">
                                        {company.industry && (
                                            <Badge variant="secondary" className="font-normal">
                                                {company.industry}
                                            </Badge>
                                        )}
                                        {company.location?.city && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {company.location.city}, {company.location.country}
                                            </div>
                                        )}
                                        {company.website && (
                                            <a
                                                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-[#1890ff] hover:underline"
                                            >
                                                <Globe className="w-4 h-4" />
                                                Visitar sitio web
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Button className="btn-primary">
                                        Seguir Empresa
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-8 grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    {/* About */}
                    <section className="bg-white rounded-xl border border-[hsl(var(--gray-200))] p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-[hsl(var(--gray-900))] mb-4">Sobre Nosotros</h2>
                        <p className="text-[hsl(var(--gray-600))] whitespace-pre-wrap leading-relaxed">
                            {company.description || "Esta empresa aún no ha agregado una descripción."}
                        </p>
                    </section>

                    {/* Open Positions (Placeholder for now) */}
                    <section>
                        <h2 className="text-xl font-bold text-[hsl(var(--gray-900))] mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-[#1890ff]" />
                            Vacantes Disponibles
                        </h2>

                        <div className="bg-white rounded-xl border border-[hsl(var(--gray-200))] p-8 text-center">
                            <div className="mx-auto w-12 h-12 bg-[hsl(var(--gray-100))] rounded-full flex items-center justify-center mb-4">
                                <Briefcase className="w-6 h-6 text-[hsl(var(--gray-400))]" />
                            </div>
                            <h3 className="text-lg font-medium text-[hsl(var(--gray-900))] mb-2">No hay vacantes activas</h3>
                            <p className="text-[hsl(var(--gray-500))]">
                                Esta empresa no tiene ofertas publicadas en este momento.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Location Map Placeholder */}
                    <div className="bg-white rounded-xl border border-[hsl(var(--gray-200))] p-6 shadow-sm">
                        <h3 className="font-semibold text-[hsl(var(--gray-900))] mb-4">Ubicación</h3>
                        <div className="aspect-video bg-[hsl(var(--gray-100))] rounded-lg flex items-center justify-center text-[hsl(var(--gray-400))] mb-4">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <p className="text-sm text-[hsl(var(--gray-600))]">
                            {company.location?.address}<br />
                            {company.location?.city}, {company.location?.country}
                        </p>
                    </div>

                    {/* Stats or other info could go here */}
                </div>
            </div>
        </div>
    )
}
