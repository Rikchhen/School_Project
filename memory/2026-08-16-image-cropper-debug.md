
# Image cropper debug report

## Symptom

The admin image crop selection stopped responding during a drag, making moving and resizing appear broken.

## Root cause

`onPointerMove` depended on live React state (`crop`, `disp`, and `aspect`). Every pointer update changed `crop`, recreated the callback, and triggered the cleanup effect, which removed the active window-level pointer listener before the gesture finished.

## Fix

- Keep crop, display size, and aspect values in synchronized refs so the pointer callback stays stable for the full gesture.
- Add freeform corner resizing, 1–4× zoom, reset, movement buttons, keyboard nudging, larger touch targets, rule-of-thirds guides, Escape-to-close, and crop failure feedback.
- Retain the existing aspect-ratio presets and original-image option.

## Regression coverage

`ImageCropper.test.jsx` performs two pointer moves separated by a React rerender and verifies the crop continues moving. It also verifies keyboard adjustment.

## Verification

- Frontend tests: 14/14 passed.
- Production frontend build: passed.
- Vite reports the pre-existing large main-chunk advisory; it does not block the build.
