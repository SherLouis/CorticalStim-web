import { Navigate, useLocation } from "react-router-dom"
import { useAuthState } from "../../context/AuthContext"

const RequireAuth = ({ children, noAuthRedirect }: { children: React.ReactElement, noAuthRedirect: string }): React.ReactElement => {
    const authState = useAuthState()
    const location = useLocation();
    return authState.isAuthenticated ? children : <Navigate to={noAuthRedirect} replace state={{ path: location.pathname }} />;
}

export { RequireAuth }