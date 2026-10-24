import { useAuthContext } from '../context/AuthContext.jsx';

/**
 * Custom hook to access authentication state and methods
 */
export function useAuth() {
  return useAuthContext();
}

export default useAuth;
