import { NextRequest, NextResponse } from "next/server";
import { getLicenses, saveLicenses } from "@/lib/license-store";
import { forwardToLicenseServer } from "@/lib/license-helper";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const serverUrl = process.env.LICENSE_SERVER_URL;
    const authHeader = req.headers.get("authorization");

    if (serverUrl) {
      try {
        const remoteRes = await forwardToLicenseServer(`${serverUrl}/api/license/action`, {
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
        console.warn("Forwarding action request failed, using local fallback:", err);
      }
    }

    const { key, action, extendDays = 30 } = body;
    if (!key) {
      return NextResponse.json({ success: false, error: "Kunci lisensi wajib diisi." }, { status: 400 });
    }

    const licenses = getLicenses();
    const cleanKey = key.trim().toUpperCase();
    const target = licenses.find((l) => l.key.trim().toUpperCase() === cleanKey);

    if (!target) {
      return NextResponse.json({ success: false, error: "Lisensi tidak ditemukan." }, { status: 404 });
    }

    if (action === "suspend") {
      target.status = "suspended";
    } else if (action === "activate") {
      target.status = "active";
    } else if (action === "extend") {
      const currentExpiry = Math.max(Date.now(), target.expiresAt);
      target.expiresAt = currentExpiry + Number(extendDays) * 24 * 60 * 60 * 1000;
      target.status = "active";
    }

    saveLicenses(licenses);
    return NextResponse.json({ success: true, license: target });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memperbarui status lisensi." }, { status: 500 });
  }
}


