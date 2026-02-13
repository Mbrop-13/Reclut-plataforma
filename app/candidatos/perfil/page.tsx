"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, MapPin, Briefcase, FileText, Plus, X, Save } from "lucide-react"

export default function PerfilPage() {
    const [editMode, setEditMode] = useState(false)
    const [habilidades, setHabilidades] = useState(["React", "TypeScript", "Node.js", "AWS", "PostgreSQL"])
    const [nuevaHabilidad, setNuevaHabilidad] = useState("")

    const agregarHabilidad = () => {
        if (nuevaHabilidad.trim()) {
            setHabilidades([...habilidades, nuevaHabilidad.trim()])
            setNuevaHabilidad("")
        }
    }

    const eliminarHabilidad = (index: number) => {
        setHabilidades(habilidades.filter((_, i) => i !== index))
    }

    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-900/50">
            <div className="container py-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">
                            Mi Perfil
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Gestiona tu información profesional
                        </p>
                    </div>
                    <Button
                        onClick={() => setEditMode(!editMode)}
                        variant={editMode ? "outline" : "default"}
                    >
                        {editMode ? "Cancelar" : "Editar Perfil"}
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* Información Personal */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Usuario" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <CardTitle className="text-2xl">Juan Pérez Díaz</CardTitle>
                                    <CardDescription className="text-base">Desarrollador Full Stack</CardDescription>
                                </div>
                                {editMode && (
                                    <Button variant="outline" size="sm">
                                        Cambiar Foto
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombres">Nombre Completo</Label>
                                    <Input
                                        id="nombres"
                                        defaultValue="Juan Pérez Díaz"
                                        disabled={!editMode}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            defaultValue="juan.perez@email.com"
                                            disabled={!editMode}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="telefono"
                                            defaultValue="+52 55 1234 5678"
                                            disabled={!editMode}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ubicacion">Ubicación</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Select disabled={!editMode} defaultValue="cdmx">
                                            <SelectTrigger className="pl-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cdmx">Ciudad de México</SelectItem>
                                                <SelectItem value="gdl">Guadalajara</SelectItem>
                                                <SelectItem value="mty">Monterrey</SelectItem>
                                                <SelectItem value="remoto">Remoto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sobre Mí */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sobre Mí</CardTitle>
                            <CardDescription>Cuéntanos sobre tu experiencia y objetivos profesionales</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Escribe una breve descripción sobre ti..."
                                defaultValue="Desarrollador Full Stack con 5+ años de experiencia en tecnologías web modernas. Apasionado por crear productos escalables y con excelente UX. Busco oportunidades para trabajar en equipos dinámicos que valoren la innovación y el aprendizaje continuo."
                                disabled={!editMode}
                                rows={4}
                            />
                        </CardContent>
                    </Card>

                    {/* Habilidades */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Habilidades Técnicas</CardTitle>
                            <CardDescription>Tecnologías y herramientas que dominas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {habilidades.map((hab, index) => (
                                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1.5">
                                        {hab}
                                        {editMode && (
                                            <button
                                                onClick={() => eliminarHabilidad(index)}
                                                className="ml-2 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </Badge>
                                ))}
                            </div>
                            {editMode && (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Agregar habilidad..."
                                        value={nuevaHabilidad}
                                        onChange={(e) => setNuevaHabilidad(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && agregarHabilidad()}
                                    />
                                    <Button onClick={agregarHabilidad} size="icon">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Experiencia Laboral */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Experiencia Laboral</CardTitle>
                                    <CardDescription>Tu historial profesional</CardDescription>
                                </div>
                                {editMode && (
                                    <Button variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[
                                {
                                    cargo: "Senior Full Stack Developer",
                                    empresa: "Tech Innovations SA",
                                    periodo: "Ene 2022 - Presente",
                                    descripcion: "Desarrollo de aplicaciones web escalables usando React, Node.js y AWS. Liderazgo técnico de equipo de 4 developers."
                                },
                                {
                                    cargo: "Full Stack Developer",
                                    empresa: "Digital Solutions",
                                    periodo: "Mar 2019 - Dic 2021",
                                    descripcion: "Implementación de features para plataforma SaaS B2B. Stack: React, Express, PostgreSQL, Docker."
                                }
                            ].map((exp, i) => (
                                <div key={i} className="relative pl-6 pb-6 border-l-2 border-muted last:pb-0">
                                    <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-blue-600 border-2 border-background" />
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-lg">{exp.cargo}</h4>
                                        <p className="text-sm text-muted-foreground">{exp.empresa}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Briefcase className="h-3.5 w-3.5" />
                                            {exp.periodo}
                                        </p>
                                        <p className="text-sm pt-2">{exp.descripcion}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* CV/Currículum */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Currículum Vitae</CardTitle>
                            <CardDescription>Sube tu CV en formato PDF</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Juan_Perez_CV.pdf</p>
                                        <p className="text-sm text-muted-foreground">Actualizado el 1 de Feb, 2024</p>
                                    </div>
                                </div>
                                {editMode && (
                                    <Button variant="outline" size="sm">
                                        Reemplazar
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    {editMode && (
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditMode(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={() => setEditMode(false)} className="gap-2">
                                <Save className="h-4 w-4" />
                                Guardar Cambios
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
