import { create } from 'zustand'
import { auth } from '@/lib/firebase'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth'

type UserRole = 'ADMIN' | 'RECRUITER' | 'CANDIDATE' | null

interface User {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
    role: UserRole
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    signup: (email: string, password: string, role: UserRole) => Promise<void>
    logout: () => Promise<void>
    setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start loading to check auth state

    login: async (email, password) => {
        if (!auth) throw new Error("Firebase Auth not initialized")
        set({ isLoading: true })
        try {
            await signInWithEmailAndPassword(auth, email, password)
            // onAuthStateChanged will handle the state update
        } catch (error) {
            set({ isLoading: false })
            throw error
        }
    },

    signup: async (email, password, role) => {
        if (!auth) throw new Error("Firebase Auth not initialized")
        set({ isLoading: true })
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            // Here you would typically save the role to Firestore
            // For now, we rely on the state update, but role persistence needs a DB
        } catch (error) {
            set({ isLoading: false })
            throw error
        }
    },

    logout: async () => {
        if (!auth) return
        set({ isLoading: true })
        try {
            await signOut(auth)
            set({ user: null, isAuthenticated: false, isLoading: false })
        } catch (error) {
            set({ isLoading: false })
            throw error
        }
    },

    setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false })
}))

// Initialize auth listener
if (auth) {
    onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            useAuthStore.getState().setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: null // Role fetching would happen here
            })
        } else {
            useAuthStore.getState().setUser(null)
        }
    })
} else {
    useAuthStore.getState().setUser(null)
}
