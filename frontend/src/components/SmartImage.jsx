import { useState } from "react";
import styled from "styled-components";

/**
 * <img> with a guaranteed onError fallback to an inline SVG placeholder, so a
 * broken/expired image URL never shows a broken-image icon. Used everywhere the
 * app renders remote or uploaded images.
 */
const PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f2f4f8"/>
      <g fill="none" stroke="#b1002c" stroke-width="2" opacity="0.35">
        <circle cx="200" cy="130" r="34"/>
        <path d="M120 210 L170 160 L210 200 L250 165 L300 215" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <text x="200" y="260" font-family="Inter, sans-serif" font-size="15" fill="#916f6e" text-anchor="middle">Adarsha Rastriya Secondary School</text>
    </svg>`);

const Img = styled.img`
  width: 100%;
  height: ${({ $height }) => $height || "auto"};
  object-fit: ${({ $fit }) => $fit || "cover"};
  display: block;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 0.45s ease;
  @media (prefers-reduced-motion: reduce) { transition: none; opacity: 1; }
`;

export function SmartImage({ src, alt = "", height, fit, ...rest }) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const finalSrc = !src || errored ? PLACEHOLDER : src;
  return (
    <Img
      src={finalSrc}
      alt={alt}
      $height={height}
      $fit={fit}
      $loaded={loaded || errored}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => { setErrored(true); setLoaded(true); }}
      {...rest}
    />
  );
}

export { PLACEHOLDER };
export default SmartImage;
