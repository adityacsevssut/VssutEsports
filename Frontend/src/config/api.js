/**
 * Centralised API base URL
 * ─────────────────────────────────────────────────────────────
 * Set VITE_API_URL in your .env file:
 *   Development:  VITE_API_URL=http://localhost:5000/api
 *   Production:   VITE_API_URL=https://your-backend.onrender.com/api
 *
 * All API calls in the app import from this file.
 * Never hardcode localhost or a production URL in a component.
 */
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default API;
