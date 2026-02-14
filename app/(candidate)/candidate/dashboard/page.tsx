import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase, FileText, User } from "lucide-react"

export default function CandidateDashboardPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Bienvenido a tu Panel</h1>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Perfil Profesional</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">100%</div>
                        <p className="text-xs text-muted-foreground mb-4">Tu perfil está completo</p>
                        <Link href="/candidate/profile">
                            <Button variant="outline" className="w-full">Editar Perfil</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Postulaciones Activas</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mb-4">No tienes postulaciones recientes</p>
                        <Link href="/candidate/applications">
                            <Button variant="outline" className="w-full">Ver Mis Postulaciones</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Buscar Empleo</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5,000+</div>
                        <p className="text-xs text-muted-foreground mb-4">Nuevas ofertas esta semana</p>
                        <Link href="/empleos">
                            <Button className="w-full btn-primary">Explorar Ofertas</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
