import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import ItemDetailPage from './pages/ItemDetailPage'
import LoginPage from './pages/LoginPage'
import MessagesPage from './pages/MessagesPage'
import PostPage from './pages/PostPage'
import ProfilePage from './pages/ProfilePage'
import SignupPage from './pages/SignupPage'
import WelcomePage from './pages/WelcomePage'

function HomeOrWelcome() {
  const hasVisited = localStorage.getItem('hasVisitedLostAndFound') === 'true'
  if (!hasVisited) {
    return <Navigate to="/welcome" replace />
  }
  return <HomePage />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell min-h-screen bg-cream text-navy">
          <Navbar />
          <main className="pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<HomeOrWelcome />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/items/:id" element={<ItemDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/post"
                element={
                  <ProtectedRoute>
                    <PostPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/items/:id/edit"
                element={
                  <ProtectedRoute>
                    <PostPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App