import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileImage,
  LoaderCircle,
  ScanLine,
  ShieldAlert,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DEMONSTRATION_SAMPLE, validateXrayImage } from "@/lib/xray";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ThoraxAI | Chest X-ray Disease Classification" },
      {
        name: "description",
        content:
          "A research and educational chest X-ray screening demonstration with local image preview and sample results.",
      },
      { property: "og:title", content: "ThoraxAI | Chest X-ray Disease Classification" },
      {
        property: "og:description",
        content:
          "A research and educational chest X-ray screening demonstration with local image preview and sample results.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ThoraxAI,
});

function ThoraxAI() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [sampleReady, setSampleReady] = useState(false);
  const [analysisTime, setAnalysisTime] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setImageUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setImageUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  function chooseImage(file: File | undefined) {
    if (!file) return;
    const validation = validateXrayImage(file);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setImage(file);
    setError(null);
    setReportError(null);
    setSampleReady(false);
    setAnalysisTime(null);
  }

  async function loadDemonstrationSample() {
    if (!image || processing) return;
    setProcessing(true);
    setSampleReady(false);
    setReportError(null);

    await new Promise<void>((resolve) => window.setTimeout(resolve, 650));
    setAnalysisTime(new Date().toLocaleString());
    setSampleReady(true);
    setProcessing(false);
  }

  async function downloadReport() {
    if (!image || !sampleReady) return;

    try {
      setReportError(null);
      const { jsPDF } = await import("jspdf");
      const report = new jsPDF({ format: "a4", unit: "mm" });
      report.setFont("helvetica", "bold");
      report.setFontSize(20);
      report.text("ThoraxAI", 18, 20);
      report.setFont("helvetica", "normal");
      report.setFontSize(10);
      report.text("Demonstration report — not a medical assessment", 18, 28);
      report.text(`Created: ${analysisTime ?? "Not recorded"}`, 18, 35);

      if (imageUrl) {
        const imageBlob = await fetch(imageUrl).then((response) => response.blob());
        const imageData = await blobToDataUrl(imageBlob);
        const format = image.type === "image/png" ? "PNG" : "JPEG";
        report.addImage(imageData, format, 18, 44, 84, 64, undefined, "FAST");
      }

      report.setFont("helvetica", "bold");
      report.text(`Illustrative category: ${DEMONSTRATION_SAMPLE.category}`, 18, 119);
      report.setFont("helvetica", "normal");
      DEMONSTRATION_SAMPLE.scores.forEach((item, index) => {
        report.text(`${item.category}: ${item.score}% (sample only)`, 18, 128 + index * 7);
      });
      report.setFont("helvetica", "bold");
      report.text("Illustrative notes", 18, 163);
      report.setFont("helvetica", "normal");
      DEMONSTRATION_SAMPLE.observations.forEach((observation, index) => {
        report.text(`• ${observation}`, 18, 171 + index * 7, { maxWidth: 172 });
      });
      report.setFontSize(9);
      report.text(
        "ThoraxAI is a research and educational screening application. Its AI-generated results are not a medical diagnosis and must not replace professional medical evaluation. Always consult a qualified radiologist or healthcare professional.",
        18,
        202,
        { maxWidth: 174 },
      );
      report.save("thoraxai-demonstration-report.pdf");
    } catch {
      setReportError("The report could not be created. Please try again.");
    }
  }

  function removeImage() {
    setImage(null);
    setError(null);
    setSampleReady(false);
    setAnalysisTime(null);
    setReportError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="masthead-grid border-b border-border/80">
        <div className="mx-auto max-w-6xl px-5 pb-8 pt-8 sm:px-8 sm:pb-9">
          <div className="flex items-center gap-2 text-primary">
            <Activity aria-hidden="true" className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">ThoraxAI</span>
          </div>
          <h1 className="mt-5 max-w-4xl font-display text-3xl font-medium leading-tight sm:text-4xl">
            Chest X-ray disease classification
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Upload a chest radiograph to screen for possible abnormalities using AI-assisted image
            analysis.
          </p>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-2">
        <section
          aria-labelledby="upload-title"
          className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-4 sm:p-5"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 id="upload-title" className="font-display text-lg font-semibold">
                Upload Your Chest X-ray
              </h2>
              <p className="mt-1 max-w-md text-sm leading-5 text-muted-foreground">
                PNG or JPG, up to 10 MB.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
              Demo mode
            </span>
          </div>

          <div
            className={`upload-zone flex min-h-64 flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed px-4 py-5 text-center sm:min-h-80 ${dragging ? "border-primary bg-accent/50" : "border-border bg-surface-deep"}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setDragging(false);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              chooseImage(event.dataTransfer.files.item(0) ?? undefined);
            }}
          >
            {imageUrl ? (
              <div className="flex h-full w-full min-h-56 flex-col items-center justify-center gap-3">
                <img
                  src={imageUrl}
                  alt="Selected chest X-ray preview"
                  className="max-h-64 w-full flex-1 object-contain"
                />
                <div className="flex w-full items-center justify-between gap-3 text-left">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileImage aria-hidden="true" className="size-4 shrink-0 text-primary" />
                    <span className="truncate text-sm">{image?.name ?? "Selected image"}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeImage}
                    aria-label="Remove selected image"
                  >
                    <X aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex max-w-sm flex-col items-center">
                <Upload aria-hidden="true" className="mb-4 size-8 text-primary" />
                <p className="font-medium">Drop an X-ray image here</p>
                <p className="mt-1 text-sm text-muted-foreground">PNG or JPG · up to 10 MB</p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,.png,.jpg,.jpeg"
            className="sr-only"
            aria-label="Choose a chest X-ray image"
            onChange={(event) => {
              chooseImage(event.currentTarget.files?.item(0) ?? undefined);
              event.currentTarget.value = "";
            }}
          />

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="sm:flex-1"
                onClick={() => inputRef.current?.click()}
              >
                <FileImage aria-hidden="true" />
                {image ? "Replace image" : "Browse files"}
              </Button>
              <Button
                type="button"
                className="sm:flex-1"
                onClick={loadDemonstrationSample}
                disabled={!image || processing}
              >
                {processing ? (
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                ) : (
                  <ScanLine aria-hidden="true" />
                )}
                {processing ? "Preparing example…" : "Analyse X-ray"}
              </Button>
            </div>
            {error ? (
              <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
                <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            ) : null}
          </div>

          <p className="mt-4 flex items-start gap-2 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
            This example does not process the uploaded image. It is for research and educational use
            only.
          </p>
        </section>

        <section
          aria-labelledby="results-title"
          aria-live="polite"
          className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-4 sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="results-title" className="font-display text-lg font-semibold">
                Analysis Results
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {analysisTime ? `Example created ${analysisTime}` : "Results will appear here."}
              </p>
            </div>
            {sampleReady ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                <AlertTriangle aria-hidden="true" className="size-3.5" />
                Illustrative only
              </span>
            ) : null}
          </div>

          {processing ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
              <LoaderCircle aria-hidden="true" className="size-7 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Preparing a fixed demonstration sample…</p>
            </div>
          ) : sampleReady ? (
            <div className="mt-6 flex flex-1 flex-col gap-5">
              <div className="rounded-lg border border-warning/35 bg-warning/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-warning">
                  No image classification was performed
                </p>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  These fixed sample values are not connected to your image and are not medical
                  findings.
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Illustrative category
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                  {DEMONSTRATION_SAMPLE.category}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Example confidence scores</h3>
                {DEMONSTRATION_SAMPLE.scores.map((item) => (
                  <div key={item.category}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span>{item.category}</span>
                      <span className="tabular-nums text-muted-foreground">{item.score}%</span>
                    </div>
                    <Progress
                      value={item.score}
                      aria-label={`${item.category} illustrative sample score`}
                      className="h-1.5 bg-secondary"
                    />
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-semibold">Example notes</h3>
                <ul className="mt-2 space-y-2">
                  {DEMONSTRATION_SAMPLE.observations.map((observation) => (
                    <li
                      key={observation}
                      className="flex items-start gap-2 text-sm leading-5 text-muted-foreground"
                    >
                      <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
                      {observation}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
                <Button type="button" variant="outline" onClick={downloadReport} className="sm:flex-1">
                  <Download aria-hidden="true" />
                  Download sample report
                </Button>
                <Button type="button" variant="ghost" onClick={removeImage} className="sm:flex-1">
                  <X aria-hidden="true" />
                  Analyse another image
                </Button>
              </div>
              {reportError ? (
                <p role="alert" className="text-sm text-destructive">
                  {reportError}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
              <ScanLine aria-hidden="true" className="size-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                {image ? "Choose Analyse X-ray to view the demonstration sample." : "Results will appear here after analysis."}
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <p className="flex items-start gap-2 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
          ThoraxAI is a research and educational screening application. Its AI-generated results are
          not a medical diagnosis and must not replace professional medical evaluation. Always
          consult a qualified radiologist or healthcare professional.
        </p>
      </footer>
    </div>
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Unable to read the selected image."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read the selected image."));
    reader.readAsDataURL(blob);
  });
}