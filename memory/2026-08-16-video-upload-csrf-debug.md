# Video upload CSRF debug report

## Symptom

Admin video upload returned `CSRF token required` while local admin authentication was disabled.

## Root cause

The development auth bypass returns a synthetic administrator without creating a session or CSRF token. A stale authentication cookie from an earlier login still caused the global CSRF middleware to demand a token, blocking the multipart upload before it reached the upload handler.

## Fix

CSRF checks now skip requests only while the development-only authentication bypass is active. Test and production environments continue using normal CSRF enforcement because they cannot activate `adminAuthDisabled`.

## Evidence

- Before the fix, a POST with a stale cookie returned 403 `CSRF token required`.
- After the fix, the identical request passed CSRF and reached the upload handler, returning the expected 400 `No file provided` for the deliberately empty reproduction request.
- Backend: 21/21 tests passed and TypeScript build passed.

## Status

DONE
