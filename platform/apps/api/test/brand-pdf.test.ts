import { describe, expect, it } from "vitest";
import { documentText } from "../src/modules/brand/routes.js";

/** PDF minimal valide (une page, police standard) construit avec sa table des références. */
function tinyPdf(text: string): Buffer {
  const stream = `BT /F1 18 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

describe("Brand DNA : lecture des documents", () => {
  it("extrait le texte d'un PDF et ignore un PDF illisible", async () => {
    expect(await documentText(tinyPdf("Pagnes wax et tissus a Abidjan"), "application/pdf")).toContain("Pagnes wax et tissus a Abidjan");
    expect(await documentText(Buffer.from("pas un pdf"), "application/pdf")).toBe("");
    expect(await documentText(Buffer.from("Texte brut"), "text/plain")).toBe("Texte brut");
  });
});
