function parseCookies(header: string | null) {
  const values = new Map<string, string>();
  for (const pair of (header || "").split(";")) {
    const separator = pair.indexOf("=");
    if (separator < 0) continue;
    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();
    if (name) values.set(name, decodeURIComponent(value));
  }
  return values;
}

export class NextRequest extends Request {
  readonly nextUrl: URL;
  readonly cookies: { get: (name: string) => { name: string; value: string } | undefined };

  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init);
    this.nextUrl = new URL(this.url);
    const cookies = parseCookies(this.headers.get("cookie"));
    this.cookies = {
      get: (name) => cookies.has(name) ? { name, value: cookies.get(name)! } : undefined,
    };
  }
}

export class NextResponse extends Response {
  static json(data: unknown, init?: ResponseInit) {
    return Response.json(data, init);
  }
}

export function userAgent(request: Request) {
  const value = request.headers.get("user-agent") || "";
  const isBot = /bot|crawler|spider|crawling|headlesschrome|lighthouse/i.test(value);
  const type = /ipad|tablet/i.test(value) ? "tablet" : /android|iphone|mobile/i.test(value) ? "mobile" : undefined;
  return { device: { type }, isBot };
}
