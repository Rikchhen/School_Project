# Hero text and crop preview debug report

## Symptoms

- Text entered for an admin hero banner did not appear on the public home page.
- The selected image did not appear inside the crop dialog before upload.

## Root causes

1. `HeroCarousel` had been changed to an image/video-only design. Banner text remained in the settings model and admin form, but the carousel never rendered it.
2. The cropper displays a selected local image using `URL.createObjectURL()`. Helmet's image CSP omitted the `blob:` scheme, so the browser blocked that preview.

## Fixes

- Restored bilingual hero title, subtitle, and CTA rendering with a responsive contrast overlay.
- Added `blob:` only to `img-src`, preserving the CSP restrictions for scripts and all other resource types.

## Evidence

- New hero regression test verifies admin title, subtitle, CTA label, and CTA destination are rendered.
- New backend regression test verifies the CSP permits blob image previews.
- Frontend: 15/15 tests passed and production build passed.
- Backend: 20/20 tests passed and TypeScript production build passed.
- Live `http://localhost:5000`: root and health returned 200; CSP contains `img-src 'self' data: blob: https:`.

## Status

DONE
