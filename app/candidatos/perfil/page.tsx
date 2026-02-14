"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, MapPin, Briefcase, FileText, Plus, X, Save, Loader2 } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

export default function PerfilPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [habilidades, setHabilidades] = useState<string[]>([])
    const [nuevaHabilidad, setNuevaHabilidad] = useState("")
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    // Form Stats
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        location: "",
        title: "",
        about: "",
        experience: "",
        salary: ""
    })

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const docRef = doc(db, "users", currentUser.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    setUser(data)
                    setFormData({
                        firstName: data.firstName || "",
                        lastName: data.lastName || "",
                        email: data.email || currentUser.email || "",
                        phone: data.phone || "",
                        location: data.location || "",
                        title: data.title || "",
                        about: data.about || "",
                        experience: data.experience || "",
                        salary: data.salary || ""
                    })
                    if (data.skills) setHabilidades(data.skills)
                }
            } else {
                router.push("/login")
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [router])

    const handleSave = async () => {
        if (!auth.currentUser) return
        setSaving(true)
        try {
            const docRef = doc(db, "users", auth.currentUser.uid)
            await updateDoc(docRef, {
                ...formData,
                skills: habilidades
            })
            // Update local user state
            setUser({ ...user, ...formData, skills: habilidades })
            setEditMode(false)
        } catch (error) {
            console.error("Error updating profile:", error)
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const agregarHabilidad = () => {
        if (nuevaHabilidad.trim()) {
            setHabilidades([...habilidades, nuevaHabilidad.trim()])
            setNuevaHabilidad("")
        }
    }

    const eliminarHabilidad = (index: number) => {
        setHabilidades(habilidades.filter((_, i) => i !== index))
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

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
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${formData.firstName} ${formData.lastName}`} />
                                    <AvatarFallback>{formData.firstName?.[0]}{formData.lastName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <CardTitle className="text-2xl">{formData.firstName} {formData.lastName}</CardTitle>
                                    <CardDescription className="text-base">{formData.title || "Sin título profesional"}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Nombre</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        disabled={!editMode}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Apellido</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        disabled={!editMode}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            value={formData.email}
                                            disabled={true} // Email usually not editable directly
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Ubicación</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título Profesional</Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className="pl-10"
                                        />
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
                                id="about"
                                value={formData.about}
                                onChange={handleChange}
                                placeholder="Escribe una breve descripción sobre ti..."
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

                    {/* Save Button */}
                    {editMode && (
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditMode(false)} disabled={saving}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} className="gap-2" disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Guardar Cambios
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
