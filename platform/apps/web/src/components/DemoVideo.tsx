import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "./ui";

/** Vidéo de présentation (2 min, voix off) : proposée à la première connexion, puis accessible à tout moment. */
const SOURCES = [{ src: "/demo/forlife-presentation.mp4", type: "video/mp4" }];
const POSTER = "/demo/forlife-presentation-poster.jpg";
const EVENT = "forlife:demo";
const TRANSCRIPT = [
  "Publier tous les jours… sans voir arriver les clients. C'est le quotidien de milliers d'entrepreneurs, en Afrique.",
  "Voici Forlife Com. Votre équipe marketing… propulsée par l'IA.",
  "Créez votre espace en une minute. Gratuitement.",
  "Chaque matin, vos missions du jour : ce qui compte vraiment, pour vendre plus.",
  "Le Brand DNA retient votre ton, vos produits… et reste fidèle à votre marque.",
  "Fixez vos objectifs : l'IA construit votre plan, et classe chaque action par impact.",
  "Le Content Studio rédige vos publications, adaptées à chaque réseau.",
  "Le Creative Studio crée vos visuels à vos couleurs… notés par un critique exigeant.",
  "Le Video Studio produit vos vidéos de quinze secondes, avec storyboard et sous-titres.",
  "Rien ne part sans votre accord. Vous validez… puis vous programmez.",
  "Le Social Hub publie sur vos pages, et mesure les résultats.",
  "Lancez des campagnes complètes, avec formulaires et suivi des prospects.",
  "Chaque demande arrive dans le CRM. Relancez sur WhatsApp.",
  "Analytics et ROI relient vos contenus à vos ventes réelles. En francs CFA.",
  "Et votre AI Copilot, avec ses douze agents, vous conseille et prépare le travail. Vous n'avez plus qu'à valider.",
  "Pensé pour l'Afrique : mobile money, WhatsApp, mobile d'abord. Awa l'a adopté… sa boutique ne désemplit plus.",
  "Forlife Com. Créez votre espace, gratuitement. Une question ? Écrivez-nous, ou appelez-nous sur WhatsApp : +225 07 79 59 05 62 · +225 05 85 80 18 56.",
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

export function DemoVideoButton({ label = "▶ Vidéo de présentation (2 min)", variant = "secondary" as const }: { label?: string; variant?: "secondary" | "ghost" }) {
  return (
    <Button variant={variant} onClick={openDemo}>
      {label}
    </Button>
  );
}

export function DemoVideoHost({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!wasSeen(userId)) setOpen(true);
    const onOpen = () => setOpen(true);
    window.addEventListener(EVENT, onOpen);
    return () => window.removeEventListener(EVENT, onOpen);
  }, [userId]);
  const close = () => {
    markSeen(userId);
    setOpen(false);
  };
  return <DemoVideoModal open={open} onClose={close} />;
}

/** Fenêtre de la vidéo de démo, partagée par l'accueil connecté et la page d'arrivée publique. */
export function DemoVideoModal({ open, onClose, footerLabel = "Commencer", onAction }: { open: boolean; onClose: () => void; footerLabel?: string; onAction?: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const close = () => {
    video.current?.pause();
    onClose();
  };
  return (
    <Modal open={open} title="Découvrez Forlife Com en 2 minutes" onClose={close} footer={
        <Button
          onClick={() => {
            close();
            onAction?.();
          }}
        >
          {footerLabel}
        </Button>
      }>
      <div className="demo-video">
        <video ref={video} poster={POSTER} controls preload="none" playsInline>
          {SOURCES.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
          Votre navigateur ne lit pas cette vidéo.
        </video>
      </div>
      <p className="muted small">Visite guidée : Brand DNA, stratégie, contenus, visuels et vidéos, validation, publication, campagnes, CRM, analytics et AI Copilot. Vous pouvez la revoir à tout moment depuis l'accueil.</p>
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
