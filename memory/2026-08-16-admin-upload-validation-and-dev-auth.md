# Admin upload validation and development auth report

## Symptoms

- Some gallery image uploads ended with the generic message `Validation failed`.
- The admin requested temporary access without signing in.

## Root cause

Gallery bulk upload derived each required gallery title directly from the original filename. Short names such as `a.jpg` produced `a`, which violates the backend title minimum of three characters. The upload itself succeeded; creation of the gallery record failed afterward.

## Fix

- Short/empty filenames now receive valid titles such as `Photo 1`.
- API validation responses now append the first available validation detail to the toast.
- Admin authentication is bypassed only when `NODE_ENV=development` and `DISABLE_ADMIN_AUTH=true` (currently the development default). Test and production environments continue enforcing authentication.
- `/auth/me` supplies a local development administrator, the login page redirects to the dashboard, and Sign out is hidden while bypassed.

## Verification

- Frontend: 17/17 tests passed; production build passed.
- Backend: 20/20 tests passed; TypeScript build passed.
- Live development server returned an unauthenticated local admin and served `/admin` with HTTP 200.

## Status

DONE
