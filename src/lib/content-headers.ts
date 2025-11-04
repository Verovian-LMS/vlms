export interface ContentHeadersResult {
  ok: boolean;
  status?: number;
  contentType?: string;
  contentDisposition?: string;
}

// Perform a lightweight header check for a resource.
// Uses HEAD, and falls back to GET if HEAD is unsupported.
export async function checkContentHeaders(url: string): Promise<ContentHeadersResult> {
  try {
    // Try HEAD first
    let res: Response;
    try {
      res = await fetch(url, { method: 'HEAD' });
      if (!res.ok && res.status !== 405 && res.status !== 501) {
        // Non-OK and not a typical "method not allowed" -> still return headers
        return {
          ok: false,
          status: res.status,
          contentType: res.headers.get('content-type') || undefined,
          contentDisposition: res.headers.get('content-disposition') || undefined,
        };
      }
      if (res.ok) {
        return {
          ok: true,
          status: res.status,
          contentType: res.headers.get('content-type') || undefined,
          contentDisposition: res.headers.get('content-disposition') || undefined,
        };
      }
    } catch {
      // HEAD may fail; fall through to GET
    }

    // Fallback: GET without reading body (headers are available immediately)
    const getRes = await fetch(url, { method: 'GET' });
    return {
      ok: getRes.ok,
      status: getRes.status,
      contentType: getRes.headers.get('content-type') || undefined,
      contentDisposition: getRes.headers.get('content-disposition') || undefined,
    };
  } catch (e) {
    return { ok: false };
  }
}