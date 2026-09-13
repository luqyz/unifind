import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      let resolvedUser = firebaseUser

      // Fall back to the Firestore profile's displayName for accounts
      // created before the Auth-level displayName was set at signup.
      if (!firebaseUser.displayName) {
        try {
          const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
          const profileName = profileSnap.exists() ? profileSnap.data().displayName : null
          if (profileName) {
            resolvedUser = { ...firebaseUser, displayName: profileName }
          }
        } catch (err) {
          console.log('Could not load profile displayName:', err)
        }
      }

      // Check admin status from the user's own private profile doc.
      try {
        const privateSnap = await getDoc(doc(db, 'users', firebaseUser.uid, 'private', 'data'))
        setIsAdmin(privateSnap.exists() && privateSnap.data().role === 'admin')
      } catch (err) {
        setIsAdmin(false)
      }

      setUser(resolvedUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      logout: async () => {
        const { signOut } = await import('firebase/auth')
        return signOut(auth)
      },
    }),
    [user, loading, isAdmin],
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