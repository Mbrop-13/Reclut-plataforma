"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { db, auth, storage } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { Loader2, Save, Building2, CreditCard, Upload } from "lucide-react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export default function ConfiguracionPage() {
    const [userId, setUserId] = useState<string | null>(null)
    const [companySlug, setCompanySlug] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Form State
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        website: "",
        address: "",
        contactEmail: ""
    })

    // Plan State
    const [plan, setPlan] = useState({
        name: "Plan Gratuito",
        status: "active",
        nextBilling: "-"
    })

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid)
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid))
                    if (userDoc.exists()) {
                        const userData = userDoc.data()
                        setCompanySlug(userData.companySlug)

                        // Update Plan if available in user data
                        if (userData.plan) {
                            setPlan({
                                name: userData.plan,
                                status: "active",
                                nextBilling: "-" // Retrieve from billing provider if exists
                            })
                        }

                        if (userData.companySlug) {
                            const companyDoc = await getDoc(doc(db, "companies", userData.companySlug))
                            if (companyDoc.exists()) {
                                const data = companyDoc.data()
                                setFormData({
                                    name: data.name || "",
                                    description: data.description || "",
                                    website: data.website || "",
                                    address: data.location?.address || "",
                                    contactEmail: user.email || ""
                                })
                                setLogoPreview(data.logoUrl || null)
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error fetching company:", error)
                    toast.error("Error al cargar datos de la empresa")
                } finally {
                    setIsLoading(false)
                }
            }
        })
        return () => unsubscribe()
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.size > 2 * 1024 * 1024) {
                toast.error("El archivo es demasiado grande (max 2MB)")
                return
            }
            setLogoFile(file)
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    const handleSave = async () => {
        if (!userId || !companySlug) return

        try {
            setIsSaving(true)

            let logoUrl = logoPreview

            // Upload new logo if selected
            if (logoFile) {
                const storageRef = ref(storage, `logos/${userId}/${logoFile.name}`)
                await uploadBytes(storageRef, logoFile)
                logoUrl = await getDownloadURL(storageRef)
            }

            // Update Company Doc
            await updateDoc(doc(db, "companies", companySlug), {
                name: formData.name,
                description: formData.description,
                website: formData.website,
                logoUrl: logoUrl,
                "location.address": formData.address,
                updatedAt: new Date().toISOString()
            })

            toast.success("Configuración guardada exitosamente")
            setLogoFile(null) // Reset file input

        } catch (error) {
            console.error("Error saving:", error)
            toast.error("Error al guardar cambios")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>

    return (
        <div className="container py-8 max-w-5xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-[hsl(var(--gray-900))]">Configuración</h1>
                <p className="text-[hsl(var(--gray-500))]">Administra la información de tu empresa y suscripción.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr_300px]">
                {/* Main: Company Profile */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                Perfil de Empresa
                            </CardTitle>
                            <CardDescription>Esta información será visible para los candidatos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Logo */}
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden bg-gray-50 group">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <span className="text-xs text-gray-400">Sin Logo</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">Logo de la Empresa</h4>
                                    <p className="text-xs text-gray-500 mb-2">Recomendado 400x400px. Max 2MB.</p>
                                    <Button variant="outline" size="sm" className="relative">
                                        Subir imagen
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre de la Empresa</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descripción</Label>
                                    <Textarea
                                        className="min-h-[100px]"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Sitio Web</Label>
                                        <Input
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Dirección</Label>
                                        <Input
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSave} disabled={isSaving} className="btn-primary">
                                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Guardar Cambios
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Plan & Billing */}
                <div className="space-y-6">
                    <Card className="border-[#1890ff] shadow-md bg-blue-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#1890ff]">
                                <CreditCard className="w-5 h-5" />
                                Tu Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-lg">{plan.name}</span>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 uppercase text-xs">
                                    {plan.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                                Próxima facturación: <span className="font-medium text-gray-900">{plan.nextBilling}</span>
                            </p>
                            <Button className="w-full bg-[#1890ff] hover:bg-blue-600 text-white">
                                Gestionar Suscripción
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Soporte</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-4">¿Necesitas ayuda con tu cuenta?</p>
                            <Button variant="outline" className="w-full">
                                Contactar Soporte
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
