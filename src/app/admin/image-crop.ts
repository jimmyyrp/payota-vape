import type { Area } from "react-easy-crop";

/**
 * Crop foto produk via canvas (klien). Menghasilkan data URL JPEG/WebP
 * yang disimpan di kolom `image` produk — muatannya jauh lebih kecil
 * daripada file asli sehingga aman disimpan di kolom TEXT di database.
 */

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function rotatedBoxSize(width: number, height: number, rotation: number) {
  const rad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Gagal memuat gambar untuk dicrop."));
    image.src = src;
  });
}

/**
 * Crop area (hasil react-easy-crop) dari sebuah gambar, lalu hasilkan
 * data URL. Dimensi output dibatasi `maxOutput` agar tidak meledakkan
 * ukuran payload database.
 */
export async function cropImageToDataUrl(
  imageSrc: string,
  pixels: Area,
  rotation = 0,
  maxOutput = 1600,
  quality = 0.85,
): Promise<string> {
  const image = await loadImage(imageSrc);

  const rotatedCanvas = document.createElement("canvas");
  const rotatedCtx = rotatedCanvas.getContext("2d");
  if (!rotatedCtx) throw new Error("Browser ini tidak mendukung canvas.");

  const { width: boxWidth, height: boxHeight } = rotatedBoxSize(
    image.naturalWidth,
    image.naturalHeight,
    rotation,
  );
  rotatedCanvas.width = boxWidth;
  rotatedCanvas.height = boxHeight;

  rotatedCtx.translate(boxWidth / 2, boxHeight / 2);
  rotatedCtx.rotate(getRadianAngle(rotation));
  rotatedCtx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  const srcWidth = Math.max(1, Math.round(pixels.width));
  const srcHeight = Math.max(1, Math.round(pixels.height));
  const scale = Math.min(1, maxOutput / Math.max(srcWidth, srcHeight));
  const outWidth = Math.max(1, Math.round(srcWidth * scale));
  const outHeight = Math.max(1, Math.round(srcHeight * scale));

  const outCanvas = document.createElement("canvas");
  outCanvas.width = outWidth;
  outCanvas.height = outHeight;
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) throw new Error("Browser ini tidak mendukung canvas.");

  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";
  outCtx.fillStyle = "#0B0B0D";
  outCtx.fillRect(0, 0, outWidth, outHeight);
  outCtx.drawImage(
    rotatedCanvas,
    pixels.x,
    pixels.y,
    srcWidth,
    srcHeight,
    0,
    0,
    outWidth,
    outHeight,
  );

  const webp = outCanvas.toDataURL("image/webp", quality);
  if (webp.startsWith("data:image/webp")) return webp;
  return outCanvas.toDataURL("image/jpeg", quality);
}