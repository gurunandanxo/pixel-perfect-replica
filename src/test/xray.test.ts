import { describe, expect, it } from "vitest";

import { MAX_XRAY_IMAGE_BYTES, validateXrayImage } from "@/lib/xray";

describe("chest X-ray image validation", () => {
  it("accepts PNG and JPG images up to the 10 MB limit", () => {
    expect(validateXrayImage({ type: "image/png", size: MAX_XRAY_IMAGE_BYTES })).toEqual({
      valid: true,
    });
    expect(validateXrayImage({ type: "image/jpeg", size: 128 })).toEqual({ valid: true });
  });

  it("rejects unsupported formats", () => {
    expect(validateXrayImage({ type: "image/webp", size: 128 })).toMatchObject({ valid: false });
  });

  it("rejects images larger than 10 MB", () => {
    expect(
      validateXrayImage({ type: "image/png", size: MAX_XRAY_IMAGE_BYTES + 1 }),
    ).toMatchObject({ valid: false });
  });
});