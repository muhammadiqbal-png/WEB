const host = window.location.hostname;
const backendOverride = window.localStorage.getItem('suaimi_backend_url');
const defaultBackend = host.endsWith('infinityfreeapp.com')
  ? 'https://suaimi-backend.onrender.com'
  : 'http://localhost:3000';

window.AUTH_CONFIG = {
  BACKEND_BASE_URL: backendOverride || defaultBackend,
  LOGIN_ENDPOINT: '/api/auth/login',
  VERIFY_ENDPOINT: '/api/auth/me',
  LOGOUT_ENDPOINT: '/api/auth/logout',
  CATTLE_LIST_ENDPOINT: '/api/cattle',
  CATTLE_ADMIN_ENDPOINT: '/api/admin/cattle'
};
