import { NextRequest } from "next/server";
import { forwardToLicenseServer } from "@/lib/license-helper";

export async function GET(req: NextRequest) {
  try {
    const serverUrl = process.env.LICENSE_SERVER_URL || "https://ais-pre-bkxv65hf2f2focysxjwl7c-61170093996.asia-southeast1.run.app";
    const authHeader = req.headers.get("authorization");

    return await forwardToLicenseServer(`${serverUrl}/api/license/list`, {
      method: "GET",
      headers: authHeader ? { "Authorization": authHeader } : {},
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

