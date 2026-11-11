const MAX_BYTES = 1.6 * 1024 * 1024;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível ler a imagem"));
    image.src = src;
  });
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

export async function compressPhoto(file, { maxWidth = 1600, quality = 0.78 } = {}) {
  if (!file || !file.type?.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Imagem muito grande. Use até 12 MB");
  }
  const raw = await readFile(file);
  const image = await loadImage(raw);
  const scale = Math.min(1, maxWidth / Math.max(image.width, 1));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);

  let q = quality;
  let data = canvas.toDataURL("image/jpeg", q);
  while (data.length > MAX_BYTES && q > 0.45) {
    q -= 0.08;
    data = canvas.toDataURL("image/jpeg", q);
  }
  if (data.length > MAX_BYTES) {
    const tighter = Math.min(1, 1200 / width);
    canvas.width = Math.round(width * tighter);
    canvas.height = Math.round(height * tighter);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    data = canvas.toDataURL("image/jpeg", 0.62);
  }
  return data;
}

export function isCustomPhoto(src) {
  return String(src || "").startsWith("data:image/");
}

export async function compressMany(fileList, options) {
  const files = [...fileList].filter((f) => f.type?.startsWith("image/"));
  const out = [];
  for (const file of files) {
    out.push(await compressPhoto(file, options));
  }
  return out;
}
