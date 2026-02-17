export const MAX_DOCUMENT_IMAGE_FILE_SIZE_BYTES = 2 * 1024 * 1024;
export const MAX_DOCUMENT_IMAGE_COUNT = 8;

export function readDocumentImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Greska pri citanju slike."));
    reader.readAsDataURL(file);
  });
}
