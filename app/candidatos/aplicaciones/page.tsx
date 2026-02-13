"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Building2,
    ExternalLink,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Calendar
} from "lucide-react"

// Mock data
const APLICACIONES_MOCK = [
    {
        id: 1,
        vacante: "Desarrollador Full Stack Senior",
        empresa: "TechCorp LATAM",
        fechaAplicacion: "2024-02-08",
        estado: "En Revisión",
        etapa: "Entrevista Técnica Programada",
        proximoPaso: "Entrevista el 15 de Feb, 10:00 AM",
        logo: "https://api.dicebear.com/7.x/initials/svg?seed=TC"
    },
    {
        id: 2,
        vacante: "Product Manager",
        empresa: "Fintech Innovators",
        fechaAplicacion: "2024-02-06",
        estado: "Entrevista Completada",
        etapa: "Esperando Feedback",
        proximoPaso: "Respuesta esperada en 3-5 días",
        logo: "https://api.dicebear.com/7.x/initials/svg?seed=FI"
    },
    {
        id: 3,
        vacante: "Backend Engineer",
        empresa: "Cloud Solutions",
        fechaAplicacion: "2024-02-05",
        estado: "Rechazado",
        etapa: "Proceso Finalizado",
        proximoPaso: null,
        logo: "https://api.dicebear.com/7.x/initials/svg?seed=CS"
    },
    {
        id: 4,
        vacante: "Data Scientist",
        empresa: "AI Labs Colombia",
        fechaAplicacion: "2024-02-01",
        estado: "Oferta Recibida",
        etapa: "Negociación",
        proximoPaso: "Responder antes del 12 de Feb",
        logo: "https://api.dicebear.com/7.x/initials/svg?seed=AI"
    }
]

const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any, color: string }> = {
        "Pendiente": { variant: "outline", icon: Clock, color: "text-yellow-600" },
        "En Revisión": { variant: "secondary", icon: AlertCircle, color: "text-blue-600" },
        "Entrevista Completada": { variant: "default", icon: CheckCircle2, color: "text-green-600" },
        "Oferta Recibida": { variant: "default", icon: CheckCircle2, color: "text-green-600" },
        "Rechazado": { variant: "destructive", icon: XCircle, color: "text-red-600" }
    }

    const config = variants[estado] || variants["Pendiente"]
    const Icon = config.icon

    return (
        <Badge variant={config.variant} className="gap-1.5">
            <Icon className={`h-3.5 w-3.5 ${config.color}`} />
            {estado}
        </Badge>
    )
}

export default function AplicacionesPage() {
    const activas = APLICACIONES_MOCK.filter(a => !["Rechazado", "Oferta Recibida"].includes(a.estado))
    const finalizadas = APLICACIONES_MOCK.filter(a => ["Rechazado", "Oferta Recibida"].includes(a.estado))

    return (
        <div className="flex-1">
            <div className="container py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">
                        Mis Aplicaciones
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Gestiona y da seguimiento a tus aplicaciones
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total Aplicaciones</CardDescription>
                            <CardTitle className="text-3xl">{APLICACIONES_MOCK.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>En Proceso</CardDescription>
                            <CardTitle className="text-3xl text-blue-600">{activas.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Ofertas Recibidas</CardDescription>
                            <CardTitle className="text-3xl text-green-600">
                                {APLICACIONES_MOCK.filter(a => a.estado === "Oferta Recibida").length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Entrevistas esta Semana</CardDescription>
                            <CardTitle className="text-3xl">1</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="activas" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="activas">
                            Activas ({activas.length})
                        </TabsTrigger>
                        <TabsTrigger value="finalizadas">
                            Finalizadas ({finalizadas.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="activas" className="space-y-4">
                        {activas.map((app) => (
                            <Card key={app.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <img
                                                src={app.logo}
                                                alt={app.empresa}
                                                className="h-12 w-12 rounded-lg border"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <CardTitle className="text-xl">
                                                        {app.vacante}
                                                    </CardTitle>
                                                    {getEstadoBadge(app.estado)}
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                                    <Building2 className="h-4 w-4" />
                                                    {app.empresa}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground mb-1">Fecha de Aplicación</p>
                                                        <p className="font-medium">{new Date(app.fechaAplicacion).toLocaleDateString('es-MX', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground mb-1">Etapa Actual</p>
                                                        <p className="font-medium">{app.etapa}</p>
                                                    </div>
                                                    {app.proximoPaso && (
                                                        <div>
                                                            <p className="text-muted-foreground mb-1">Próximo Paso</p>
                                                            <p className="font-medium flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {app.proximoPaso}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Link href={`/empleos/${app.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Ver Vacante
                                                </Button>
                                            </Link>
                                            {app.estado === "En Revisión" && (
                                                <Button size="sm">
                                                    Ver Detalles
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}

                        {activas.length === 0 && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium mb-2">No tienes aplicaciones activas</p>
                                    <p className="text-muted-foreground mb-4">Comienza a buscar empleos para aplicar</p>
                                    <Link href="/empleos">
                                        <Button>Buscar Empleos</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="finalizadas" className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vacante</TableHead>
                                    <TableHead>Empresa</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {finalizadas.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">{app.vacante}</TableCell>
                                        <TableCell>{app.empresa}</TableCell>
                                        <TableCell>{new Date(app.fechaAplicacion).toLocaleDateString('es-MX')}</TableCell>
                                        <TableCell>{getEstadoBadge(app.estado)}</TableCell>
                                        <TableCell>
                                            <Link href={`/empleos/${app.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    Ver Detalles
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {finalizadas.length === 0 && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <p className="text-lg text-muted-foreground">No hay aplicaciones finalizadas aún</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
