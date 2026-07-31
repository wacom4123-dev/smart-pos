import { NextRequest, NextResponse } from "next/server";
import { activateLicenseLocal } from "@/lib/license-store";
import { forwardToLicenseServer } from "@/lib/license-helper";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const serverUrl = process.env.LICENSE_SERVER_URL;

    if (serverUrl) {
      try {
        const remoteRes = await forwardToLicenseServer(`${serverUrl}/api/license/activate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (remoteRes.status < 500) {
          return remoteRes;
        }
      } catch (err) {
        console.warn("Forwarding to external license server failed, using local activation fallback:", err);
      }
    }

    // Local activation
    const result = activateLicenseLocal(body.key || "", body.deviceId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memproses aktivasi lisensi." }, { status: 500 });
  }
}


