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
import { LayoutDashboard, LogOut, User, Briefcase, Settings } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"

export function MainHeader() {
    const [user, setUser] = useState<FirebaseUser | null>(null)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [scrolled, setScrolled] = useState(false)
    const [visible, setVisible] = useState(true)
    const { scrollY } = useScroll()
    const router = useRouter()
    const pathname = usePathname()

    // Hide header on scroll down, show on scroll up
    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0
        if (latest > previous && latest > 100) {
            setVisible(false)
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

    // Get initials for avatar
    const getInitials = () => {
        if (userProfile?.name) {
            return userProfile.name.substring(0, 2).toUpperCase()
        }
        if (user?.email) {
            return user.email.substring(0, 2).toUpperCase()
        }
        return "U"
    }

    const isCompany = userProfile?.role === 'company'

    return (
        <motion.header
            initial={{ y: 0 }}
            animate={{ y: visible ? 0 : -100 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm" : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#1890ff] flex items-center justify-center shadow-lg shadow-[#1890ff]/20">
                            <span className="text-white font-bold text-lg">R</span>
                        </div>
                        <span className={`text-xl font-bold tracking-tight hidden sm:block ${scrolled ? "text-slate-900" : "text-slate-900"}`}>
                            Re<span className="text-[#1890ff]">clut</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {!isCompany && (
                            <Link href="/empleos" className={`text-sm font-medium hover:text-[#1890ff] transition-colors ${pathname === '/empleos' ? 'text-[#1890ff]' : 'text-slate-600'}`}>
                                Buscar Empleos
                            </Link>
                        )}
                        {user && !isCompany && (
                            <Link href="/dashboard/applications" className="text-sm font-medium text-slate-600 hover:text-[#1890ff] transition-colors">
                                Mis Postulaciones
                            </Link>
                        )}
                    </nav>

                    {/* Auth Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-transparent hover:ring-[#1890ff]/20 transition-all">
                                        <div className="h-full w-full bg-gradient-to-br from-[#1890ff] to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                                            {getInitials()}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{userProfile?.name || "Usuario"}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push(isCompany ? "/dashboard" : "/candidate/dashboard")}>
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>Mi Panel</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push(isCompany ? "/dashboard/settings" : "/candidate/profile")}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Mi Perfil</span>
                                    </DropdownMenuItem>
                                    {!isCompany && (
                                        <DropdownMenuItem onClick={() => router.push("/empleos")}>
                                            <Briefcase className="mr-2 h-4 w-4" />
                                            <span>Buscar Empleos</span>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Cerrar Sesión</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login">
                                    <Button variant="ghost" className="text-sm font-medium">
                                        Iniciar Sesión
                                    </Button>
                                </Link>
                                <Link href="/registro">
                                    <Button className="btn-primary shadow-lg shadow-blue-500/20">
                                        Comenzar Gratis
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.header>
    )
}
