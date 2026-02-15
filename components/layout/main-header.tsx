"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { LayoutDashboard, LogOut, User, Briefcase, Settings, Menu, X } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion"

export function MainHeader() {
    const [user, setUser] = useState<FirebaseUser | null>(null)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [scrolled, setScrolled] = useState(false)
    const [visible, setVisible] = useState(true)
    const [mobileMenu, setMobileMenu] = useState(false)
    const { scrollY } = useScroll()
    const router = useRouter()
    const pathname = usePathname()

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0
        if (latest > previous && latest > 100) {
            setVisible(false)
            setMobileMenu(false)
        } else {
            setVisible(true)
        }
        setScrolled(latest > 20)
    })

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser)
            if (currentUser) {
                const docRef = doc(db, "users", currentUser.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setUserProfile(docSnap.data())
                }
            } else {
                setUserProfile(null)
            }
        })
        return () => unsubscribe()
    }, [])

    const handleSignOut = async () => {
        await signOut(auth)
        router.push("/")
    }

    const getInitials = () => {
        if (userProfile?.name) return userProfile.name.substring(0, 2).toUpperCase()
        if (user?.email) return user.email.substring(0, 2).toUpperCase()
        return "U"
    }

    const isCompany = userProfile?.role === 'company'
    const isHome = pathname === '/'

    const navLinks = [
        ...(!isCompany ? [{ href: "/empleos", label: "Empleos" }] : []),
        { href: "/registro/empresa", label: "Para Empresas" },
    ]

    return (
        <>
            <motion.header
                initial={{ y: 0 }}
                animate={{ y: visible ? 0 : -100 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? "bg-white/90 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                    : "bg-white/80 backdrop-blur-xl"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-[72px]">
                        {/* Left Section: Logo + Nav */}
                        <div className="flex items-center gap-8">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2.5 group">
                                <div className="w-9 h-9 rounded-xl bg-[#1890ff] flex items-center justify-center shadow-lg shadow-[#1890ff]/25 group-hover:shadow-[#1890ff]/40 transition-shadow">
                                    <span className="text-white font-bold text-lg">R</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-slate-900">
                                    Re<span className="text-[#1890ff]">clu</span>
                                </span>
                            </Link>

                            {/* Desktop Nav */}
                            <nav className="hidden md:flex items-center gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === link.href
                                            ? "text-[#1890ff] bg-blue-50/80"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-3">
                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-[#1890ff]/30 transition-all focus:outline-none focus:ring-[#1890ff]/30">
                                            <div className="h-full w-full bg-gradient-to-br from-[#1890ff] to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                                {getInitials()}
                                            </div>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 rounded-xl shadow-xl border-slate-200/80 mt-2" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal px-4 py-3">
                                            <p className="text-sm font-semibold text-slate-900">{userProfile?.name || "Usuario"}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => router.push(isCompany ? "/dashboard" : "/candidate/dashboard")} className="px-4 py-2.5 cursor-pointer">
                                            <LayoutDashboard className="mr-3 h-4 w-4 text-slate-400" />
                                            <span>Mi Panel</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push(isCompany ? "/dashboard/settings" : "/candidate/profile")} className="px-4 py-2.5 cursor-pointer">
                                            <User className="mr-3 h-4 w-4 text-slate-400" />
                                            <span>Mi Perfil</span>
                                        </DropdownMenuItem>
                                        {!isCompany && (
                                            <DropdownMenuItem onClick={() => router.push("/empleos")} className="px-4 py-2.5 cursor-pointer">
                                                <Briefcase className="mr-3 h-4 w-4 text-slate-400" />
                                                <span>Buscar Empleos</span>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleSignOut} className="px-4 py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                            <LogOut className="mr-3 h-4 w-4" />
                                            <span>Cerrar Sesión</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link href="/login" className="hidden sm:block">
                                        <Button variant="ghost" className="text-sm font-medium rounded-lg px-4 text-slate-700 hover:text-slate-900">
                                            Iniciar Sesión
                                        </Button>
                                    </Link>
                                    <Link href="/registro">
                                        <Button className="bg-[#1890ff] hover:bg-blue-600 text-white text-sm font-semibold rounded-lg px-5 h-10 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
                                            Registrarse
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setMobileMenu(!mobileMenu)}
                                className="md:hidden p-2 rounded-lg transition-colors text-slate-700 hover:bg-slate-100"
                            >
                                {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenu && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden overflow-hidden bg-white border-t border-slate-100"
                        >
                            <div className="px-6 py-4 space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileMenu(false)}
                                        className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1890ff] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                {!user && (
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenu(false)}
                                        className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* Spacer */}
            <div className="h-[72px]" />
        </>
    )
}
