import { NextRequest, NextResponse } from "next/server";
import { verifyLicenseLocal } from "@/lib/license-store";
import { forwardToLicenseServer } from "@/lib/license-helper";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const serverUrl = process.env.LICENSE_SERVER_URL;

    if (serverUrl) {
      try {
        const remoteRes = await forwardToLicenseServer(`${serverUrl}/api/license/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (remoteRes.status < 500) {
          return remoteRes;
        }
      } catch (err) {
        console.warn("Forwarding verify to license server failed, using local fallback:", err);
      }
    }

    // Local verification
    const result = verifyLicenseLocal(
      body.key || "",
      body.email || "",
      body.expiresAt || 0,
      body.signature || "",
      body.deviceId
    );

    if (!result.success) {
      return NextResponse.json({ success: false, active: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, active: false, error: error.message || "Gagal memverifikasi lisensi." }, { status: 500 });
  }
}


