export function requireAuth(navigate, isAuthenticated) {
  if (!isAuthenticated) {
    localStorage.setItem(
      'redirect_after_login',
      window.location.pathname + window.location.search
    );
    navigate('/auth/login');
    return false;
  }
  return true;
}
