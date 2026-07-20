export async function getNativeDeviceId(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const { Device } = await import("@capacitor/device");
    const idInfo = await Device.getId();
    return idInfo.identifier || null;
  } catch (error) {
    console.warn("Capacitor Device plugin is not available (running in pure web browser or plugin not registered).", error);
    return null;
  }
}
