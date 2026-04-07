import { createBrowserSupabaseClientOrNull } from "@/lib/supabase/client";

export const INSTITUTION_IMAGES_BUCKET = "institution-images";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DATA_URL_CHARS = 2_400_000;

function extensionForMime(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

function readAsDataUrlFallback(
  file: File,
): Promise<{ ok: true; publicUrl: string } | { ok: false; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result ?? "");
      if (s.length > MAX_DATA_URL_CHARS) {
        resolve({
          ok: false,
          message:
            "Önizleme modunda görsel çok büyük. Supabase bağlayın veya daha küçük dosya / URL kullanın.",
        });
        return;
      }
      resolve({ ok: true, publicUrl: s });
    };
    reader.onerror = () => resolve({ ok: false, message: "Dosya okunamadı." });
    reader.readAsDataURL(file);
  });
}

/**
 * Kurum galerisi: Storage’a yükler. `institutionId` yoksa (yeni kurum formu) taslak klasörü kullanılır.
 * Supabase yoksa (demo) data URL döner.
 */
export async function uploadInstitutionImage(
  file: File,
  institutionId?: string | null,
): Promise<{ ok: true; publicUrl: string } | { ok: false; message: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, message: "Yalnızca JPEG, PNG, WebP veya GIF yükleyin." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "Dosya en fazla 5 MB olabilir." };
  }

  const supabase = createBrowserSupabaseClientOrNull();
  if (!supabase) {
    return readAsDataUrlFallback(file);
  }

  const ext = extensionForMime(file.type);
  const id = institutionId?.trim();
  const folder = id ? `institutions/${id}` : "institutions/draft";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(INSTITUTION_IMAGES_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) {
    return { ok: false, message: error.message };
  }
  const { data } = supabase.storage.from(INSTITUTION_IMAGES_BUCKET).getPublicUrl(path);
  return { ok: true, publicUrl: data.publicUrl };
}
