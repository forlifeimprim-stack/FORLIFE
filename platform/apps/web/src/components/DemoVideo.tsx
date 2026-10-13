import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "./ui";

/** Vidéo de démonstration (1 min 35) : proposée à la première connexion, puis accessible à tout moment. */
const SOURCES = [
  { src: "/demo/forlife-demo.webm", type: "video/webm" },
  { src: "/demo/forlife-demo.mp4", type: "video/mp4" },
];
const POSTER = "/demo/forlife-demo-poster.jpg";
const EVENT = "forlife:demo";
const TRANSCRIPT = [
  "Bienvenue sur Forlife Com, votre plateforme de croissance propulsée par l'IA. Voici l'essentiel en une minute et demie.",
  "L'accueil vous montre chaque jour quoi faire en priorité : étapes à compléter, ventes, leads et crédits.",
  "Commencez par le Brand DNA : l'IA extrait votre ton, vos mots clés et vos mots interdits. Vous validez, toutes les créations le respectent.",
  "Fixez vos objectifs, puis générez un plan stratégique avec des recommandations classées par impact.",
  "Le Content Studio rédige vos publications pour Facebook, Instagram, TikTok, LinkedIn et WhatsApp.",
  "Le Creative Studio produit des visuels à vos couleurs, notés par un critique exigeant.",
  "Le Video Studio crée des vidéos verticales de 15 secondes, avec storyboard et sous-titres.",
  "Rien ne part sans votre accord : chaque contenu est relu, approuvé, puis programmé.",
  "Le Social Hub publie sur vos pages connectées et mesure les résultats.",
  "Les demandes de vos clients arrivent dans le CRM : relancez-les sur WhatsApp au bon moment.",
  "Analytics & ROI relie vos contenus aux leads et aux ventes réelles.",
  "L'AI Copilot et ses 12 agents répondent à vos questions et proposent des actions que vous validez.",
  "Première étape : complétez votre Brand DNA. Bonne croissance avec Forlife Com !",
];

const seenKey = (userId: string) => `forlife.demoSeen.${userId}`;
function wasSeen(userId: string): boolean {
  try {
    return localStorage.getItem(seenKey(userId)) === "1";
  } catch {
    return true;
  }
}
function markSeen(userId: string) {
  try {
    localStorage.setItem(seenKey(userId), "1");
  } catch {
    /* stockage indisponible : la vidéo reste accessible depuis l'accueil */
  }
}

/** Ouvre la vidéo de démo depuis n'importe quel écran. */
export function openDemo() {
  window.dispatchEvent(new Event(EVENT));
}

export function DemoVideoButton({ label = "▶ Vidéo de démo (1 min 35)", variant = "secondary" as const }: { label?: string; variant?: "secondary" | "ghost" }) {
  return (
    <Button variant={variant} onClick={openDemo}>
      {label}
    </Button>
  );
}

export function DemoVideoHost({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!wasSeen(userId)) setOpen(true);
    const onOpen = () => setOpen(true);
    window.addEventListener(EVENT, onOpen);
    return () => window.removeEventListener(EVENT, onOpen);
  }, [userId]);
  const close = () => {
    video.current?.pause();
    markSeen(userId);
    setOpen(false);
  };
  return (
    <Modal open={open} title="Découvrez Forlife Com en 1 min 35" onClose={close} footer={<Button onClick={close}>Commencer</Button>}>
      <div className="demo-video">
        <video ref={video} poster={POSTER} controls preload="none" playsInline>
          {SOURCES.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
          Votre navigateur ne lit pas cette vidéo.
        </video>
      </div>
      <p className="muted small">Visite guidée : Brand DNA, stratégie, création de contenus, visuels et vidéos, validation, publication, CRM, analytics et AI Copilot. Vous pouvez la revoir à tout moment depuis l'accueil.</p>
      <details>
        <summary>Transcription</summary>
        <ol className="small">
          {TRANSCRIPT.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
      </details>
    </Modal>
  );
}
