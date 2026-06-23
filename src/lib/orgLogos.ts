// Frontend-only storage for organisation logos.
// Backend has no logo column, so we persist uploaded images as base64 data URLs
// in localStorage keyed by organisation name. Cleared by clearing site data.

const STORAGE_KEY = "org_logos_v1";

type LogoMap = Record<string, string>;

function read(): LogoMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LogoMap) : {};
  } catch {
    return {};
  }
}

function write(map: LogoMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent("org-logos-changed"));
  } catch (e) {
    console.warn("Failed to save logo (storage may be full)", e);
  }
}

export function getLogo(name: string): string | undefined {
  return read()[name];
}

export function getAllLogos(): LogoMap {
  return read();
}

export function setLogo(name: string, dataUrl: string) {
  const map = read();
  map[name] = dataUrl;
  write(map);
}

export function removeLogo(name: string) {
  const map = read();
  delete map[name];
  write(map);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
