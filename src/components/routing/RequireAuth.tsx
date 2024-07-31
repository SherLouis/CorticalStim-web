import { Navigate, useLocation } from "react-router-dom"
import { useAuthState } from "../../context/AuthContext"

const RequireAuth = ({ children }: { children: React.ReactElement }): React.ReactElement => {
    const authState = useAuthState()
    const location = useLocation();
    return authState.isAuthenticated ? children : <Navigate to="/login" replace state={{ path: location.pathname }} />;
}

export { RequireAuth }