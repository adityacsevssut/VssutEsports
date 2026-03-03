# VSSUT Esports Backend

## Setup
1. Install dependencies: `npm install`
2. Configure `.env` with your MongoDB URI.
3. Run dev server: `npm run dev`

## Admin Setup
To create an admin with specific permissions, register a new user via POST `/api/auth/register` with:
```json
{
  "username": "freefire_admin",
  "email": "ff@admin.com",
  "password": "password123",
  "role": "admin",
  "allowedGames": ["freefire"]
}
```

For Super Admin:
```json
{
  "role": "superadmin",
  "allowedGames": ["all"]
}
```

## API Endpoints
- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Tournaments**: `/api/tournaments` (GET, POST, PUT, DELETE)
- **Registrations**: `/api/registrations` (POST, GET by tournament)
