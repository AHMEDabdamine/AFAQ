import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import RouteFallback from './components/shared/RouteFallback'

// Home ships in the initial bundle because it's the landing page. Everything
// else loads on demand: the admin panel alone (13 pages, recharts, the table
// stack) was ~60% of a 1.3 MB bundle that every public visitor downloaded.
const About = lazy(() => import('./pages/About'))
const Projects = lazy(() => import('./pages/Projects'))
const Events = lazy(() => import('./pages/Events'))
const Gallery = lazy(() => import('./pages/Gallery'))
const JoinUs = lazy(() => import('./pages/JoinUs'))
const Registration = lazy(() => import('./pages/Registration'))
const Announcements = lazy(() => import('./pages/Announcements'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Chatbot = lazy(() => import('./components/chatbot/Chatbot'))

const Login = lazy(() => import('./admin/pages/Login'))
const ResetPassword = lazy(() => import('./admin/pages/ResetPassword'))
const Dashboard = lazy(() => import('./admin/pages/Dashboard'))
const EventsPage = lazy(() => import('./admin/pages/EventsPage'))
const RegistrationsPage = lazy(() => import('./admin/pages/RegistrationsPage'))
const MembershipPage = lazy(() => import('./admin/pages/MembershipPage'))
const ProjectsPage = lazy(() => import('./admin/pages/ProjectsPage'))
const GalleryPage = lazy(() => import('./admin/pages/GalleryPage'))
const MessagesPage = lazy(() => import('./admin/pages/MessagesPage'))
const AnnouncementsPage = lazy(() => import('./admin/pages/AnnouncementsPage'))
const AdminUsersPage = lazy(() => import('./admin/pages/AdminUsersPage'))
const SettingsPage = lazy(() => import('./admin/pages/SettingsPage'))
const AIKnowledgePage = lazy(() => import('./admin/pages/AIKnowledgePage'))
const ProtectedRoute = lazy(() => import('./admin/components/guards/ProtectedRoute'))
const RoleGuard = lazy(() => import('./admin/components/guards/RoleGuard'))

export default function App() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery') && !window.location.pathname.includes('/admin/reset-password')) {
      navigate('/admin/reset-password' + hash, { replace: true })
    }
  }, [navigate])

  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/join" element={<JoinUs />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/contact" element={<Contact />} />
            {/* Unknown URLs used to render a blank page inside the layout. */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="registrations" element={<RegistrationsPage />} />
            <Route path="membership" element={<MembershipPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="admins" element={
              <RoleGuard role="super_admin"><AdminUsersPage /></RoleGuard>
            } />
            <Route path="settings" element={
              <RoleGuard role="super_admin"><SettingsPage /></RoleGuard>
            } />
            <Route path="ai-knowledge" element={
              <RoleGuard role="super_admin"><AIKnowledgePage /></RoleGuard>
            } />
          </Route>
        </Routes>
      </Suspense>

      {/* The club's public assistant has no business inside the admin panel. */}
      {!isAdmin && (
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      )}
    </>
  )
}
