import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, User, Briefcase, Settings, LogOut, FileText } from "lucide-react";

const MENU_ITEMS = [
    { name: "Mi Panel", href: "/candidate/dashboard", icon: LayoutDashboard },
    { name: "Mi Perfil", href: "/candidate/profile", icon: User },
    { name: "Mis Postulaciones", href: "/candidate/applications", icon: FileText },
    { name: "Buscar Empleos", href: "/empleos", icon: Briefcase },
]

export default function CandidateLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed inset-y-0 z-50">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#1890ff] flex items-center justify-center">
                            <span className="text-white font-bold text-lg">R</span>
                        </div>
                        <span className="font-bold text-xl text-slate-900">
                            <span className="text-[#1890ff]">Re</span>
                            <span>clut</span>
                        </span>
                    </Link>
                    <div className="mt-2 px-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidato</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {MENU_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-[#1890ff] hover:bg-blue-50 transition-all font-medium group"
                        >
                            <item.icon className="w-5 h-5 text-slate-400 group-hover:text-[#1890ff] transition-colors" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 space-y-1">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all font-medium"
                    >
                        <Settings className="w-5 h-5 text-slate-400" />
                        Configuración
                    </Link>
                    <Link
                        href="/logout"
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all font-medium text-left"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen">
                {children}
            </main>
        </div>
    )
}
