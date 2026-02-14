import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Briefcase, Users, Calendar, Settings, LogOut, Building2 } from "lucide-react";

const MENU_ITEMS = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Positions", href: "/dashboard/positions", icon: Briefcase },
    { name: "Candidates", href: "/dashboard/candidates", icon: Users },
    { name: "Interviews", href: "/dashboard/interviews", icon: Calendar },
    { name: "Company Profile", href: "/dashboard/company-profile", icon: Building2 },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
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
                            <span>clu</span>
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
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
                        Settings
                    </Link>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all font-medium text-left">
                        <LogOut className="w-5 h-5" />
                        Log out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen">
                {children}
            </main>
        </div>
    )
}
