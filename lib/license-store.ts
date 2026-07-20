import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface License {
  key: string;
  customerName: string;
  customerEmail: string;
  type: "trial" | "monthly" | "annual" | "lifetime";
  createdAt: number;
  expiresAt: number;
  activatedAt?: number;
  deviceId?: string;
  status: "active" | "inactive" | "suspended";
}

const FILE_PATH = path.join(process.cwd(), "lib", "licenses.json");

// Helper to ensure the file exists
function ensureFileExists() {
  const dir = path.dirname(FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), "utf-8");
  }
}

export function getLicenses(): License[] {
  ensureFileExists();
  try {
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading licenses file:", error);
    return [];
  }
}

export function saveLicenses(licenses: License[]) {
  ensureFileExists();
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(licenses, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing licenses file:", error);
  }
}

export function getLicenseByKey(key: string): License | undefined {
  const licenses = getLicenses();
  return licenses.find((l) => l.key.toUpperCase() === key.toUpperCase());
}

export function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segment = () => {
    let str = "";
    for (let i = 0; i < 4; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
  };
  return `SPOS-${segment()}-${segment()}-${segment()}-${segment()}`;
}

// Generate a cryptographic signature for offline verification
export function generateLicenseSignature(key: string, email: string, expiresAt: number): string {
  const secret = process.env.LICENSE_SECRET || "smart_pos_default_secure_secret_2026_xyz";
  const payload = `${key}:${email}:${expiresAt}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}
