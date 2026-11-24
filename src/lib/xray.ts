export const MAX_XRAY_IMAGE_BYTES = 10 * 1024 * 1024;

export type ImageValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export function validateXrayImage(file: Pick<File, "type" | "size">): ImageValidationResult {
  if (file.type !== "image/png" && file.type !== "image/jpeg") {
    return { valid: false, message: "Choose a PNG or JPG image." };
  }

  if (file.size > MAX_XRAY_IMAGE_BYTES) {
    return { valid: false, message: "This image is larger than the 10 MB limit." };
  }

  return { valid: true };
}

export const DEMONSTRATION_SAMPLE = {
  category: "Pneumonia",
  scores: [
    { category: "Normal", score: 23 },
    { category: "Pneumonia", score: 64 },
    { category: "COVID-19", score: 8 },
    { category: "Tuberculosis", score: 5 },
  ],
  observations: [
    "These fixed example values are not predictions.",
    "The uploaded image was not evaluated by a classifier.",
    "No medical finding can be inferred from this demonstration.",
  ],
} as const;