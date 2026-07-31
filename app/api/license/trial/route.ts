import { NextRequest, NextResponse } from "next/server";
import { registerTrialLocal } from "@/lib/license-store";
import { forwardToLicenseServer } from "@/lib/license-helper";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const serverUrl = process.env.LICENSE_SERVER_URL;

    if (serverUrl) {
      try {
        const remoteRes = await forwardToLicenseServer(`${serverUrl}/api/license/trial`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (remoteRes.status < 500) {
          return remoteRes;
        }
      } catch (err) {
        console.warn("Forwarding trial registration to license server failed, using local fallback:", err);
      }
    }

    // Local trial registration
    const result = registerTrialLocal(
      body.customerName || "Pengguna Trial",
      body.customerEmail || "trial@smartpos.id",
      body.deviceId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal mendaftarkan uji coba gratis." }, { status: 500 });
  }
}


