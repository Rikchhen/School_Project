import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Check, X, Crop as CropIcon, RotateCcw, ZoomIn, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "../ui/Button";

const MAX_W = 520;
const MAX_H = 420;
const MIN = 32;

const ASPECTS = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "3:4", value: 3 / 4 },
];

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Dependency-free image cropper. Given a File, lets the admin drag/resize a
 * crop box (with optional aspect presets) and returns a cropped File via canvas.
 */
export function ImageCropper({ file, onCancel, onCropped }) {
  const [url, setUrl] = useState("");
  const [disp, setDisp] = useState({ w: 0, h: 0 }); // displayed image size
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [aspect, setAspect] = useState(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef(null);
  const dragRef = useRef(null);
  const cropRef = useRef(crop);
  const dispRef = useRef(disp);
  const aspectRef = useRef(aspect);

  const updateCrop = useCallback((next) => {
    cropRef.current = next;
    setCrop(next);
  }, []);
  useEffect(() => { dispRef.current = disp; }, [disp]);
  useEffect(() => { aspectRef.current = aspect; }, [aspect]);

  useEffect(() => {
    const objUrl = URL.createObjectURL(file);
    setUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [file]);

  const onImgLoad = (e) => {
    const nw = e.target.naturalWidth;
    const nh = e.target.naturalHeight;
    const scale = Math.min(MAX_W / nw, MAX_H / nh, 1);
    const w = Math.round(nw * scale);
    const h = Math.round(nh * scale);
    setNatural({ w: nw, h: nh });
    setDisp({ w, h });
    // Start with a centered 80% crop.
    const cw = Math.round(w * 0.8);
    const ch = Math.round(h * 0.8);
    setZoom(1);
    updateCrop({ x: Math.round((w - cw) / 2), y: Math.round((h - ch) / 2), w: cw, h: ch });
  };

  const applyAspect = useCallback(
    (a) => {
      setAspect(a);
      if (!a || !disp.w) return;
      // Fit a centered crop of ratio `a` inside the image.
      let w = disp.w * 0.9;
      let h = w / a;
      if (h > disp.h * 0.9) { h = disp.h * 0.9; w = h * a; }
      setZoom(1);
      updateCrop({ x: (disp.w - w) / 2, y: (disp.h - h) / 2, w, h });
    },
    [disp, updateCrop]
  );

  const onPointerDown = (mode) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      crop: { ...cropRef.current },
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = useCallback((e) => {
      const d = dragRef.current;
      if (!d) return;
      const liveDisp = dispRef.current;
      const liveAspect = aspectRef.current;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const c = d.crop;
      let next = { ...c };

      if (d.mode === "move") {
        next.x = clamp(c.x + dx, 0, liveDisp.w - c.w);
        next.y = clamp(c.y + dy, 0, liveDisp.h - c.h);
      } else {
        // Corner resize against the opposite fixed anchor.
        const right = c.x + c.w;
        const bottom = c.y + c.h;
        let x = c.x, y = c.y, w = c.w, h = c.h;

        if (d.mode === "se") { w = clamp(c.w + dx, MIN, liveDisp.w - c.x); h = liveAspect ? w / liveAspect : clamp(c.h + dy, MIN, liveDisp.h - c.y); }
        if (d.mode === "ne") { w = clamp(c.w + dx, MIN, liveDisp.w - c.x); h = liveAspect ? w / liveAspect : clamp(c.h - dy, MIN, bottom); y = bottom - h; }
        if (d.mode === "sw") { w = clamp(c.w - dx, MIN, right); h = liveAspect ? w / liveAspect : clamp(c.h + dy, MIN, liveDisp.h - c.y); x = right - w; }
        if (d.mode === "nw") { w = clamp(c.w - dx, MIN, right); h = liveAspect ? w / liveAspect : clamp(c.h - dy, MIN, bottom); x = right - w; y = bottom - h; }

        // Keep within bounds after aspect adjustment.
        if (y < 0) { y = 0; if (liveAspect) { h = bottom - y; w = h * liveAspect; x = (d.mode === "nw" || d.mode === "sw") ? right - w : x; } }
        if (x < 0) { x = 0; if (liveAspect) { w = right - x; h = w / liveAspect; y = (d.mode === "nw" || d.mode === "ne") ? bottom - h : y; } }
        if (x + w > liveDisp.w) w = liveDisp.w - x;
        if (y + h > liveDisp.h) h = liveDisp.h - y;

        next = { x, y, w, h };
      }
      updateCrop(next);
    }, [updateCrop]);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }, [onPointerMove]);

  const nudge = (dx, dy) => {
    const c = cropRef.current, d = dispRef.current;
    updateCrop({ ...c, x: clamp(c.x + dx, 0, d.w - c.w), y: clamp(c.y + dy, 0, d.h - c.h) });
  };

  const changeZoom = (value) => {
    const nextZoom = Number(value);
    const c = cropRef.current, d = dispRef.current;
    const ratio = zoom / nextZoom;
    const w = clamp(c.w * ratio, MIN, d.w);
    const h = clamp(c.h * ratio, MIN, d.h);
    const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
    updateCrop({ x: clamp(cx - w / 2, 0, d.w - w), y: clamp(cy - h / 2, 0, d.h - h), w, h });
    setZoom(nextZoom);
  };

  const reset = () => {
    if (!disp.w) return;
    if (aspect) {
      applyAspect(aspect);
      return;
    }
    const w = disp.w * 0.8, h = disp.h * 0.8;
    setZoom(1);
    updateCrop({ x: (disp.w - w) / 2, y: (disp.h - h) / 2, w, h });
  };

  const onCropKeyDown = (e) => {
    const distance = e.shiftKey ? 10 : 1;
    const directions = {
      ArrowLeft: [-distance, 0], ArrowRight: [distance, 0],
      ArrowUp: [0, -distance], ArrowDown: [0, distance],
    };
    if (!directions[e.key]) return;
    e.preventDefault();
    nudge(...directions[e.key]);
  };

  useEffect(() => {
    const closeOnEscape = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onCancel]);

  useEffect(() => () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }, [onPointerMove, onPointerUp]);

  const confirm = async () => {
    if (!natural.w || crop.w < 1) return;
    setWorking(true);
    setError("");
    try {
      const scale = natural.w / disp.w; // natural px per displayed px
      const sx = crop.x * scale, sy = crop.y * scale;
      const sw = crop.w * scale, sh = crop.h * scale;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(sw);
      canvas.height = Math.round(sh);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      const type = file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await new Promise((res) => canvas.toBlob(res, type, 0.92));
      if (!blob) throw new Error("The cropped image could not be created.");
      const ext = type === "image/png" ? "png" : "jpg";
      const name = (file.name || "image").replace(/\.[^.]+$/, "") + `-cropped.${ext}`;
      onCropped(new File([blob], name, { type }));
    } catch {
      setError("Could not crop this image. Please try another image or use the original.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <Overlay role="dialog" aria-modal="true" aria-label="Crop image">
      <Panel>
        <Head>
          <h3><CropIcon size={18} /> Crop image</h3>
          <IconBtn onClick={onCancel} aria-label="Cancel"><X size={18} /></IconBtn>
        </Head>

        <Aspects>
          {ASPECTS.map((a) => (
            <AspBtn key={a.label} $active={aspect === a.value} onClick={() => applyAspect(a.value)}>
              {a.label}
            </AspBtn>
          ))}
        </Aspects>

        <Controls>
          <ZoomControl>
            <ZoomIn size={16} aria-hidden="true" />
            <label htmlFor="crop-zoom">Zoom</label>
            <input id="crop-zoom" type="range" min="1" max="4" step="0.05" value={zoom} onChange={(e) => changeZoom(e.target.value)} />
            <output>{zoom.toFixed(1)}×</output>
          </ZoomControl>
          <NudgeGroup aria-label="Move crop selection">
            <ToolBtn onClick={() => nudge(-5, 0)} aria-label="Move crop left"><ArrowLeft size={16} /></ToolBtn>
            <ToolBtn onClick={() => nudge(0, -5)} aria-label="Move crop up"><ArrowUp size={16} /></ToolBtn>
            <ToolBtn onClick={() => nudge(0, 5)} aria-label="Move crop down"><ArrowDown size={16} /></ToolBtn>
            <ToolBtn onClick={() => nudge(5, 0)} aria-label="Move crop right"><ArrowRight size={16} /></ToolBtn>
          </NudgeGroup>
          <ToolBtn onClick={reset} aria-label="Reset crop"><RotateCcw size={16} /> Reset</ToolBtn>
        </Controls>

        <Stage>
          {url && (
            <ImgBox style={{ width: disp.w, height: disp.h }}>
              <img ref={imgRef} src={url} alt="" onLoad={onImgLoad} draggable={false} style={{ width: "100%", height: "100%" }} />
              {disp.w > 0 && (
                <>
                  <Shade style={{ clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${crop.y}px, ${crop.x}px ${crop.y}px, ${crop.x}px ${crop.y + crop.h}px, ${crop.x + crop.w}px ${crop.y + crop.h}px, ${crop.x + crop.w}px ${crop.y}px, 0 ${crop.y}px)` }} />
                  <Box
                    style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
                    onPointerDown={onPointerDown("move")}
                    onKeyDown={onCropKeyDown}
                    tabIndex={0}
                    role="group"
                    aria-label="Crop selection. Drag to move, drag corner handles to resize, or use arrow keys."
                  >
                    <Grid aria-hidden="true"><i /><i /><b /><b /></Grid>
                    <Handle style={{ left: -6, top: -6, cursor: "nwse-resize" }} onPointerDown={onPointerDown("nw")} />
                    <Handle style={{ right: -6, top: -6, cursor: "nesw-resize" }} onPointerDown={onPointerDown("ne")} />
                    <Handle style={{ left: -6, bottom: -6, cursor: "nesw-resize" }} onPointerDown={onPointerDown("sw")} />
                    <Handle style={{ right: -6, bottom: -6, cursor: "nwse-resize" }} onPointerDown={onPointerDown("se")} />
                  </Box>
                </>
              )}
            </ImgBox>
          )}
        </Stage>

        <Hint>Drag the frame to move it, drag any corner to resize freely, or use the arrow keys. Hold Shift for larger keyboard steps.</Hint>
        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

        <Foot>
          <Button $variant="ghost" onClick={() => onCropped(file)}>Use original</Button>
          <div style={{ display: "flex", gap: 12 }}>
            <Button $variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button $variant="primary" onClick={confirm} disabled={working}>
              <Check size={16} /> {working ? "Cropping…" : "Apply crop"}
            </Button>
          </div>
        </Foot>
      </Panel>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: ${({ theme }) => theme.zIndex.cropper};
  background: ${({ theme }) => theme.colors.overlay};
  display: grid; place-items: center; padding: ${({ theme }) => theme.space[4]};
`;
const Panel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  width: 100%; max-width: 600px; max-height: 92vh; overflow: auto;
  display: flex; flex-direction: column;
`;
const Head = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: ${({ theme }) => theme.space[5]}; border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  h3 { display: flex; align-items: center; gap: 8px; color: ${({ theme }) => theme.colors.text}; }
`;
const IconBtn = styled.button`color: ${({ theme }) => theme.colors.textMuted}; &:hover { color: ${({ theme }) => theme.colors.text}; }`;
const Aspects = styled.div`display: flex; gap: 6px; padding: ${({ theme }) => theme.space[4]} ${({ theme }) => theme.space[5]} 0; flex-wrap: wrap;`;
const Controls = styled.div`
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: ${({ theme }) => theme.space[3]} ${({ theme }) => theme.space[5]} 0;
`;
const ZoomControl = styled.div`
  display: flex; align-items: center; gap: 8px; min-width: 220px; flex: 1;
  color: ${({ theme }) => theme.colors.textBody}; font-size: ${({ theme }) => theme.fontSizes.sm};
  input { min-width: 100px; flex: 1; accent-color: ${({ theme }) => theme.colors.primary}; }
  output { width: 34px; font-variant-numeric: tabular-nums; }
`;
const NudgeGroup = styled.div`display: flex; gap: 4px;`;
const ToolBtn = styled.button`
  min-width: 36px; min-height: 36px; padding: 6px 9px; display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.textBody}; background: ${({ theme }) => theme.colors.surface};
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.primary}; }
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.shadows.focus}; }
`;
const AspBtn = styled.button`
  padding: 4px 12px; border-radius: ${({ theme }) => theme.radii.pill}; font-size: ${({ theme }) => theme.fontSizes.xs}; font-weight: 600;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? "#fff" : theme.colors.textBody)};
`;
const Stage = styled.div`
  padding: ${({ theme }) => theme.space[5]}; display: grid; place-items: center;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  margin: ${({ theme }) => theme.space[4]} ${({ theme }) => theme.space[5]};
  border-radius: ${({ theme }) => theme.radii.md}; min-height: 200px;
`;
const ImgBox = styled.div`
  position: relative; user-select: none; touch-action: none;
  img { display: block; pointer-events: none; }
`;
const Shade = styled.div`position: absolute; inset: 0; background: rgba(17,24,39,0.55); pointer-events: none;`;
const Box = styled.div`
  position: absolute; border: 2px solid #fff; box-shadow: 0 0 0 1px rgba(0,0,0,0.4);
  cursor: move; touch-action: none;
  &:focus-visible { outline: 3px solid ${({ theme }) => theme.colors.secondaryFaint}; outline-offset: 3px; }
`;
const Handle = styled.span`
  position: absolute; width: 24px; height: 24px; transform: translate(-6px, -6px); touch-action: none;
  &::after { content: ""; position: absolute; inset: 6px; background: #fff; border: 1px solid ${({ theme }) => theme.colors.primary}; border-radius: 2px; }
`;
const Grid = styled.span`
  position: absolute; inset: 0; pointer-events: none;
  i, b { position: absolute; display: block; background: rgba(255,255,255,.55); }
  i { top: 0; bottom: 0; width: 1px; } i:nth-child(1) { left: 33.333%; } i:nth-child(2) { left: 66.666%; }
  b { left: 0; right: 0; height: 1px; } b:nth-child(3) { top: 33.333%; } b:nth-child(4) { top: 66.666%; }
`;
const Hint = styled.p`
  margin: -6px ${({ theme }) => theme.space[5]} ${({ theme }) => theme.space[4]};
  color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.xs};
`;
const ErrorMessage = styled.p`
  margin: 0 ${({ theme }) => theme.space[5]} ${({ theme }) => theme.space[4]}; color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;
const Foot = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: ${({ theme }) => theme.space[5]}; border-top: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 480px) { align-items: stretch; flex-direction: column; > div { justify-content: flex-end; } }
`;

export default ImageCropper;
