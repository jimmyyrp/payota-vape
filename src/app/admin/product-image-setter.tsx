"use client";

import { useRef, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Crop, ImagePlus, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { cropImageToDataUrl } from "./image-crop";

const MAX_FILE_MB = 15;

/**
 * Pengatur foto produk: unggah, crop persegi (drag/zoom/rotasi) via
 * canvas, pratinjau, dan hapus. Hasil crop WebP diunggah ke penyimpanan
 * cloud (bucket Supabase Storage) saat produk disimpan.
 */
export function ProductImageSetter({
  value,
  onChange,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [source, setSource] = useState<string>("");
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetEditor = () => {
    setEditing(false);
    setSource("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setPixels(null);
    setError(null);
  };

  const openEditor = (imageSrc: string) => {
    setSource(imageSrc);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setPixels(null);
    setError(null);
    setEditing(true);
  };

  const onFilePicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (PNG, JPG, atau WebP).");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Ukuran file maksimal ${MAX_FILE_MB}MB.`);
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => openEditor(String(reader.result ?? ""));
    reader.onerror = () => setError("Gagal membaca file. Coba file lain.");
    reader.readAsDataURL(file);
  };

  const applyCrop = async () => {
    if (!source || !pixels) return;
    setApplying(true);
    try {
      const dataUrl = await cropImageToDataUrl(source, pixels, rotation);
      onChange(dataUrl);
      resetEditor();
    } catch (err) {
      setError((err as Error).message || "Gagal memproses gambar.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div>
      {error && (
        <p className="mb-3 rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {editing ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative h-64 w-full max-w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0C] sm:h-72">
              <Cropper
                image={source}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="rect"
                showGrid
                maxZoom={4}
                minZoom={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={(_: Area, croppedAreaPixels: Area) =>
                  setPixels(croppedAreaPixels)
                }
              />
            </div>

            <div className="flex w-full max-w-[320px] flex-col gap-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  Zoom
                  <span className="ml-auto tabular-nums">{zoom.toFixed(2)}x</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-primary"
                  aria-label="Zoom"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  Rotasi
                  <span className="ml-auto tabular-nums">{rotation}°</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full accent-primary"
                    aria-label="Rotasi"
                  />
                  <button
                    type="button"
                    onClick={() => setRotation(0)}
                    title="Reset rotasi"
                    aria-label="Reset rotasi"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition-colors hover:border-white/30 hover:text-foreground"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Seret gambar untuk memindah bingkai, gunakan slider untuk
                zoom &amp; rotasi. Hasil crop selalu persegi (1:1), dikonversi
                ke WebP, dan diunggah ke penyimpanan cloud saat disimpan.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={resetEditor}
              disabled={applying}
              className="btn-outline"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={applyCrop}
              disabled={applying || !pixels}
              className="btn-primary disabled:opacity-50"
            >
              {applying ? (
                <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Crop className="h-4 w-4" aria-hidden />
              )}
              Terapkan Crop
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0C]">
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="Pratinjau foto produk"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                <ImagePlus className="h-5 w-5" aria-hidden />
                <span className="px-3 text-center text-[10px] font-bold uppercase tracking-[0.2em]">
                  Tanpa Foto
                </span>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-start gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="btn-primary h-10 px-5"
              >
                <ImagePlus className="h-4 w-4" aria-hidden />
                {value ? "Ganti Foto" : "Unggah Foto"}
              </button>
              {value && (
                <>
                  <button
                    type="button"
                    onClick={() => openEditor(value)}
                    className="btn-outline h-10 px-5"
                  >
                    <Crop className="h-4 w-4" aria-hidden />
                    Crop Ulang
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange("")}
                    className="btn-outline h-10 px-5 hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Hapus
                  </button>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Foto menggantikan visual SVG otomatis di katalog & halaman
              produk. Biarkan kosong untuk memakai varian Art sebagai
              tampilan produk.
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFilePicked}
      />
    </div>
  );
}