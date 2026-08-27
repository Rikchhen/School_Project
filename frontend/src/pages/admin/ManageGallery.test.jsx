import { describe, expect, it } from "vitest";
import { galleryTitleFromFilename } from "./ManageGallery";

describe("galleryTitleFromFilename", () => {
  it("replaces too-short image filenames with a valid gallery title", () => {
    expect(galleryTitleFromFilename("a.jpg", 0)).toBe("Photo 1");
    expect(galleryTitleFromFilename("1.png", 2)).toBe("Photo 3");
  });

  it("preserves a descriptive filename without its extension", () => {
    expect(galleryTitleFromFilename("school-event.webp", 0)).toBe("school-event");
  });
});
