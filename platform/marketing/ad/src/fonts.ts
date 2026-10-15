import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

/** Charge Poppins depuis public/fonts (rendu hors ligne). */
export function useFonts() {
  const [handle] = useState(() => delayRender("Polices"));
  useEffect(() => {
    Promise.all(
      [400, 600, 700, 800, 900].flatMap((w) =>
        ["latin", "latin-ext"].map((sub) =>
          new FontFace("Poppins", `url(${staticFile(`fonts/poppins-${sub}-${w}-normal.woff2`)})`, { weight: String(w) })
            .load()
            .then((f) => (document.fonts as unknown as { add: (x: FontFace) => void }).add(f)),
        ),
      ),
    ).finally(() => continueRender(handle));
  }, [handle]);
}
