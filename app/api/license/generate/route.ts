import { NextRequest, NextResponse } from "next/server";
import { generateLicenseKey, getLicenses, saveLicenses, generateLicenseSignature, License } from "@/lib/license-store";
import { forwardToLicenseServer } from "@/lib/license-helper";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const serverUrl = process.env.LICENSE_SERVER_URL;
    const authHeader = req.headers.get("authorization");

    if (serverUrl) {
      try {
        const remoteRes = await forwardToLicenseServer(`${serverUrl}/api/license/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { "Authorization": authHeader } : {}),
          },
          body: JSON.stringify(body),
        });
        if (remoteRes.status < 500) {
          return remoteRes;
        }
      } catch (err) {
        console.warn("Forwarding generate request failed, using local fallback:", err);
      }
    }

    const { customerName, customerEmail, type = "annual", durationDays = 365 } = body;
    const key = generateLicenseKey();
    const now = Date.now();
    const expiresAt = now + Number(durationDays) * 24 * 60 * 60 * 1000;

    const license: License = {
      key,
      customerName: customerName || "Pelanggan SPOS",
      customerEmail: customerEmail || "client@smartpos.id",
      type,
      createdAt: now,
      expiresAt,
      status: "active",
    };

    const signature = generateLicenseSignature(license.key, license.customerEmail, license.expiresAt);
    const signedLicense = { ...license, signature };

    const licenses = getLicenses();
    licenses.push(signedLicense);
    saveLicenses(licenses);

    return NextResponse.json({ success: true, key, license: signedLicense });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal membuat lisensi baru." }, { status: 500 });
  }
}


