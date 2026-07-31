import { NextRequest, NextResponse } from "next/server";
import { getLicenses } from "@/lib/license-store";
import { forwardToLicenseServer } from "@/lib/license-helper";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const serverUrl = process.env.LICENSE_SERVER_URL;
    const authHeader = req.headers.get("authorization");

    if (serverUrl) {
      try {
        const remoteRes = await forwardToLicenseServer(`${serverUrl}/api/license/list`, {
          method: "GET",
          headers: authHeader ? { "Authorization": authHeader } : {},
        });
        if (remoteRes.status < 500) {
          return remoteRes;
        }
      } catch (err) {
        console.warn("Forwarding list request to license server failed, using local fallback:", err);
      }
    }

    const licenses = getLicenses();
    return NextResponse.json({ success: true, licenses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal mengambil daftar lisensi." }, { status: 500 });
  }
}


