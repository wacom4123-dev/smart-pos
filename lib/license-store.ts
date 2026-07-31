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
  signature?: string;
}

let inMemoryLicenses: License[] = [];

function getFilePath(): string {
  return path.join(process.cwd(), "lib", "licenses.json");
}

function getTmpFilePath(): string {
  return path.join("/tmp", "spos_licenses.json");
}

function ensureFileExists() {
  const primaryPath = getFilePath();
  try {
    const dir = path.dirname(primaryPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(primaryPath)) {
      fs.writeFileSync(primaryPath, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (error) {
    // Fallback to /tmp if primary path is read-only
    try {
      const tmpPath = getTmpFilePath();
      if (!fs.existsSync(tmpPath)) {
        fs.writeFileSync(tmpPath, JSON.stringify([], null, 2), "utf-8");
      }
    } catch (e) {
      console.warn("Could not create license file in /tmp:", e);
    }
  }
}

export function getLicenses(): License[] {
  ensureFileExists();
  const primaryPath = getFilePath();
  const tmpPath = getTmpFilePath();

  try {
    if (fs.existsSync(primaryPath)) {
      const data = fs.readFileSync(primaryPath, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("Read primary licenses failed:", err);
  }

  try {
    if (fs.existsSync(tmpPath)) {
      const data = fs.readFileSync(tmpPath, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("Read tmp licenses failed:", err);
  }

  return inMemoryLicenses;
}

export function saveLicenses(licenses: License[]) {
  inMemoryLicenses = licenses;
  ensureFileExists();

  const primaryPath = getFilePath();
  const tmpPath = getTmpFilePath();

  try {
    fs.writeFileSync(primaryPath, JSON.stringify(licenses, null, 2), "utf-8");
    return;
  } catch (error) {
    // Write to /tmp if primary path is not writable
    try {
      fs.writeFileSync(tmpPath, JSON.stringify(licenses, null, 2), "utf-8");
    } catch (e) {
      console.warn("Failed to write licenses to /tmp:", e);
    }
  }
}

export function getLicenseByKey(key: string): License | undefined {
  const licenses = getLicenses();
  const cleanKey = key.trim().toUpperCase();
  return licenses.find((l) => l.key.trim().toUpperCase() === cleanKey);
}

export function generateLicenseKey(prefix = "SPOS"): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segment = () => {
    let str = "";
    for (let i = 0; i < 4; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
  };
  return `${prefix}-${segment()}-${segment()}-${segment()}`;
}

export function generateLicenseSignature(key: string, email: string, expiresAt: number): string {
  const secret = process.env.LICENSE_SECRET || "smart_pos_default_secure_secret_2026_xyz";
  const payload = `${key.trim().toUpperCase()}:${email.trim().toLowerCase()}:${expiresAt}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function activateLicenseLocal(keyInput: string, deviceId?: string) {
  const key = keyInput.trim().toUpperCase();
  let license = getLicenseByKey(key);

  const now = Date.now();

  if (!license) {
    // If key starts with SPOS- or contains TRAL/TRIAL or 3+ dashes, create/accept it dynamically
    if (key.startsWith("SPOS-")) {
      const isTrial = key.includes("TRAL") || key.includes("TRIAL");
      const durationDays = isTrial ? 14 : 365;
      const expiresAt = now + durationDays * 24 * 60 * 60 * 1000;
      const email = isTrial ? "trial@smartpos.id" : "client@smartpos.id";
      const name = isTrial ? "Pengguna Lisensi Trial" : "Pengguna Lisensi SPOS";

      license = {
        key,
        customerName: name,
        customerEmail: email,
        type: isTrial ? "trial" : "annual",
        createdAt: now,
        expiresAt,
        activatedAt: now,
        deviceId: deviceId || "DEV-UNKNOWN",
        status: "active",
      };

      const licenses = getLicenses();
      licenses.push(license);
      saveLicenses(licenses);
    } else {
      return {
        success: false,
        error: "Kunci lisensi tidak valid. Format harus diawali dengan SPOS- (contoh: SPOS-TRAL-1102-KKLM).",
      };
    }
  }

  if (license.status === "suspended") {
    return {
      success: false,
      error: "Lisensi ini telah ditangguhkan (Suspended). Silakan hubungi admin SPOS.",
    };
  }

  if (now > license.expiresAt) {
    return {
      success: false,
      error: "Masa berlaku lisensi ini telah berakhir (Expired).",
    };
  }

  // Update activated info
  license.activatedAt = now;
  if (deviceId) license.deviceId = deviceId;
  license.status = "active";

  const signature = generateLicenseSignature(license.key, license.customerEmail, license.expiresAt);
  const updatedLicense = { ...license, signature };

  // Save back
  const allLicenses = getLicenses().map((l) => (l.key.toUpperCase() === key ? updatedLicense : l));
  saveLicenses(allLicenses);

  return {
    success: true,
    license: updatedLicense,
  };
}

export function registerTrialLocal(customerName: string, customerEmail: string, deviceId?: string) {
  const now = Date.now();
  const expiresAt = now + 14 * 24 * 60 * 60 * 1000; // 14 days
  const trialKey = generateLicenseKey("SPOS-TRAL");

  const license: License = {
    key: trialKey,
    customerName,
    customerEmail,
    type: "trial",
    createdAt: now,
    expiresAt,
    activatedAt: now,
    deviceId: deviceId || "DEV-UNKNOWN",
    status: "active",
  };

  const signature = generateLicenseSignature(license.key, license.customerEmail, license.expiresAt);
  const signedLicense = { ...license, signature };

  const licenses = getLicenses();
  licenses.push(signedLicense);
  saveLicenses(licenses);

  return {
    success: true,
    key: trialKey,
    license: signedLicense,
  };
}

export function verifyLicenseLocal(key: string, email: string, expiresAt: number, signature: string, deviceId?: string) {
  const now = Date.now();
  if (now > expiresAt) {
    return { success: false, active: false, error: "Masa berlaku lisensi telah habis." };
  }

  const expectedSignature = generateLicenseSignature(key, email, expiresAt);
  if (signature && signature === expectedSignature) {
    return { success: true, active: true };
  }

  const license = getLicenseByKey(key);
  if (license && license.status === "active" && now <= license.expiresAt) {
    return { success: true, active: true };
  }

  return { success: false, active: false, error: "Signature lisensi tidak valid atau lisensi tidak ditemukan." };
}

