"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "sonner"
import { Loader2, MapPin } from "lucide-react"
import { LocationInput } from "@/components/ui/location-input"

export default function CandidateProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
        title: "",
        bio: ""
    })

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
                // Fetch profile data
                const docRef = doc(db, "users", currentUser.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    setFormData({
                        name: data.name || "",
                        email: currentUser.email || "",
                        phone: data.phone || "",
                        location: data.location || "",
                        title: data.title || "",
                        bio: data.bio || ""
                    })
                } else {
                    setFormData(prev => ({ ...prev, email: currentUser.email || "" }))
                }
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleLocationChange = (value: string) => {
        setFormData(prev => ({ ...prev, location: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            if (!user) return
            const docRef = doc(db, "users", user.uid)
            await updateDoc(docRef, {
                name: formData.name,
                phone: formData.phone,
                location: formData.location,
                title: formData.title,
                bio: formData.bio,
                updatedAt: new Date()
            })
            toast.success("Perfil actualizado correctamente")
        } catch (error) {
            console.error("Error updating profile:", error)
            toast.error("Error al actualizar el perfil")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#1890ff]" /></div>

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
                <p className="text-slate-500">Administra tu información personal y profesional.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* READ ONLY SECTION */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={formData.email} disabled className="bg-slate-50 text-slate-500 border-slate-200" />
                            <p className="text-xs text-slate-400">El email no se puede cambiar por seguridad.</p>
                        </div>
                    </div>

                    <Separator />

                    {/* EDITABLE SECTION */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Título Profesional</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ej: Desarrollador Frontend"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+56 9 1234 5678"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Ubicación (Región)</Label>
                            <LocationInput
                                value={formData.location}
                                onChange={handleLocationChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Biografía / Sobre mí</Label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Cuéntanos un poco sobre tu experiencia profesional..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="btn-primary min-w-[150px]" disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
