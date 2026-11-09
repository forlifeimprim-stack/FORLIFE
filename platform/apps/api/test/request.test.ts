import type { FastifyRequest } from "fastify";
import { describe, expect, it } from "vitest";
import { clientIp } from "../src/lib/request.js";

const req = (headers: Record<string, string>, remoteAddress = "10.0.0.1") =>
  ({ headers, socket: { remoteAddress } }) as unknown as FastifyRequest;

describe("Adresse IP du client", () => {
  it("via Firebase Hosting : en-tête de Hosting, jamais l'adresse de sortie partagée", () => {
    const egress = "35.191.10.20";
    const a = clientIp(req({ "fastly-client-ip": "197.159.0.1", "x-forwarded-for": `197.159.0.1, ${egress}` }));
    const b = clientIp(req({ "fastly-client-ip": "197.159.0.2", "x-forwarded-for": `197.159.0.2, ${egress}` }));
    expect([a, b]).toEqual(["197.159.0.1", "197.159.0.2"]);
    expect(clientIp(req({ "x-fah-client-ip": "198.51.100.7", "x-forwarded-for": egress }))).toBe("198.51.100.7");
  });

  it("ignore les valeurs invalides et l'entrée de gauche de X-Forwarded-For", () => {
    expect(clientIp(req({ "fastly-client-ip": "pas-une-ip", "x-forwarded-for": "1.2.3.4, 203.0.113.9" }))).toBe("203.0.113.9");
    expect(clientIp(req({}, "10.1.2.3"))).toBe("10.1.2.3");
  });
});
