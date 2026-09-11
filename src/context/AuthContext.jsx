import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setLoading(false)
        return
      }

      // Fall back to the Firestore profile's displayName for accounts
      // created before the Auth-level displayName was set at signup.
      if (!firebaseUser.displayName) {
        try {
          const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
          const profileName = profileSnap.exists() ? profileSnap.data().displayName : null

          if (profileName) {
            setUser({ ...firebaseUser, displayName: profileName })
            setLoading(false)
            return
          }
        } catch (err) {
          console.log('Could not load profile displayName:', err)
        }
      }

      setUser(firebaseUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      logout: async () => {
        const { signOut } = await import('firebase/auth')
        return signOut(auth)
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}