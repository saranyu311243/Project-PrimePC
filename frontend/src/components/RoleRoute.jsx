import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Route guard. Renders children only when the logged-in user's role is allowed.
 * - Not logged in       → redirect to /login (remembering where they came from)
 * - Logged in, wrong role → redirect to home
 * While the initial profile refresh is in flight we show a light placeholder so
 * we don't flash a redirect before auth state settles.
 */
function RoleRoute({ allow, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="grid min-h-[400px] place-items-center text-sm text-slate-400">กำลังตรวจสอบสิทธิ์...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RoleRoute
