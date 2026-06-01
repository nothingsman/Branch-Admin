<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Kelem Branch Admin

Next.js branch-admin frontend for the Kelem backend.

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   `npm install`
2. Create `.env.local` from `.env.example`
3. Set `NEXT_PUBLIC_API_BASE_URL` to the backend base URL
4. Run the app:
   `npm run dev`

## Backend Integration

The app now reads and writes against the backend API through [src/lib/api.ts](/home/ubuntu/Documents/Final-Year-Project/Branch-Admin/src/lib/api.ts).

Required environment variables:

- `NEXT_PUBLIC_API_BASE_URL`
  Example: `http://localhost:8000`

Auth flow assumptions:

- The frontend authenticates with JWT tokens from `/auth/jwt/create/`
- Access and refresh tokens are stored in local storage
- The logged-in branch admin context is resolved from `/api/branch-admins/`
- The UI expects `organization`, `branch`, and academic-year context to exist for most modules

## Key API-backed Modules

- `Parents`: parent creation, editing, linking, and bulk import
- `Teachers`: teacher creation, assignment creation, homeroom creation, and bulk import
- `Attendance`: daily attendance status and attendance summaries
- `Announcements`: create, edit, draft, schedule, recall/delete
- `Academia`: grade, section, subject, and role management
