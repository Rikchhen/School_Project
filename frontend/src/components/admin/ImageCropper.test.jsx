// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { theme } from "../../styles/theme";
import { ImageCropper } from "./ImageCropper";

describe("ImageCropper", () => {
  beforeEach(() => {
    window.PointerEvent = MouseEvent;
    URL.createObjectURL = vi.fn(() => "blob:test-image");
    URL.revokeObjectURL = vi.fn();
  });

  it("keeps moving throughout a drag after React rerenders", async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ImageCropper
          file={new File(["image"], "photo.jpg", { type: "image/jpeg" })}
          onCancel={vi.fn()}
          onCropped={vi.fn()}
        />
      </ThemeProvider>,
    );

    const image = container.querySelector("img");
    Object.defineProperties(image, {
      naturalWidth: { value: 1000 },
      naturalHeight: { value: 750 },
    });
    fireEvent.load(image);

    const selection = screen.getByRole("group", { name: /crop selection/i });
    const initialLeft = parseFloat(selection.style.left);
    fireEvent.pointerDown(selection, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(window, { clientX: 120, clientY: 100 });
    await waitFor(() => expect(parseFloat(selection.style.left)).toBeGreaterThan(initialLeft));
    const firstLeft = parseFloat(selection.style.left);

    fireEvent.pointerMove(window, { clientX: 140, clientY: 100 });
    await waitFor(() => expect(parseFloat(selection.style.left)).toBeGreaterThan(firstLeft));
    fireEvent.pointerUp(window);
  });

  it("supports precise keyboard adjustment", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ImageCropper file={new File(["x"], "photo.png", { type: "image/png" })} onCancel={vi.fn()} onCropped={vi.fn()} />
      </ThemeProvider>,
    );
    const image = container.querySelector("img");
    Object.defineProperties(image, { naturalWidth: { value: 500 }, naturalHeight: { value: 400 } });
    fireEvent.load(image);
    const selection = screen.getByRole("group", { name: /crop selection/i });
    const initialLeft = parseFloat(selection.style.left);
    fireEvent.keyDown(selection, { key: "ArrowRight" });
    expect(parseFloat(selection.style.left)).toBe(initialLeft + 1);
  });
});
