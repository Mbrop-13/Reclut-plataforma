"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Plus, Building2, Save } from "lucide-react"

export default function CompanyProfilePage() {
    const [imagenes, setImagenes] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Simulate adding sample images
    const agregarImagenDemo = () => {
        const sampleImages = [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop",
            "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=300&h=200&fit=crop",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=200&fit=crop"
        ]
        if (imagenes.length < 5) {
            setImagenes([...imagenes, sampleImages[imagenes.length % 3]])
        }
    }

    const eliminarImagen = (index: number) => {
        setImagenes(imagenes.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate saving
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsLoading(false)
        alert("Perfil actualizado correctamente. ¡Ahora puedes publicar empleos!")
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Perfil de Empresa</h2>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {/* Left Column: Main Info */}
                <div className="md:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Corporativa</CardTitle>
                            <CardDescription>
                                Completa estos datos para generar confianza en los candidatos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>RUT / Tax ID / NIT</Label>
                                        <Input placeholder="Ej: 12345678-9" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Industria</Label>
                                        <Input placeholder="Ej: Software, Finanzas, Salud" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Sitio Web <span className="text-muted-foreground text-xs">(Opcional)</span></Label>
                                    <Input placeholder="https://miempresa.com" type="url" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Descripción Pública</Label>
                                    <textarea
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Describe tu empresa, misión y cultura..."
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Galería de Fotos</Label>
                                    <div className="grid grid-cols-3 gap-3 mt-2">
                                        {imagenes.map((img, i) => (
                                            <div key={i} className="relative aspect-video rounded-lg overflow-hidden group">
                                                <img src={img} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarImagen(i)}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                        {imagenes.length < 5 && (
                                            <button
                                                type="button"
                                                onClick={agregarImagenDemo}
                                                className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                                            >
                                                <Plus className="w-5 h-5 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">Agregar foto</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Guardando..." : "Guardar Cambios"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Logo & Status */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Logo</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-32 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                                <Building2 className="w-12 h-12 text-slate-400" />
                            </div>
                            <Button variant="outline" className="w-full">
                                <Upload className="w-4 h-4 mr-2" />
                                Subir Logo
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                                Recomendado: 500x500px, PNG o JPG.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader>
                            <CardTitle className="text-blue-900 text-lg">⚠️ Perfil Incompleto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-blue-700 mb-4">
                                Para publicar nuevas vacantes, necesitas completar la información fiscal y legal de tu empresa.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-blue-700">
                                    <X className="w-4 h-4 mr-2 text-red-500" />
                                    RUT / Tax ID
                                </div>
                                <div className="flex items-center text-sm text-blue-700">
                                    <X className="w-4 h-4 mr-2 text-red-500" />
                                    Logo Corporativo
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
