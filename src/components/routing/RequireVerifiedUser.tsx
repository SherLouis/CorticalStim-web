import { Navigate, useLocation } from "react-router-dom"
import { useAuthState } from "../../context/AuthContext"

const RequireVerifiedUser = ({ children, notVerifiedPage }: { children: React.ReactElement, notVerifiedPage: string }): React.ReactElement => {
    const authState = useAuthState()
    const location = useLocation();
    return authState.user?.isVerifiedUser ? children : <Navigate to={notVerifiedPage} replace state={{ path: location.pathname }} />;
}

export { RequireVerifiedUser }