import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LogoMark } from "../components/ui";

const UPDATED = "14 octobre 2026";
const CONTACT = "WhatsApp et appels : +225 07 79 59 05 62 · +225 05 85 80 18 56";

function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="legal">
      <header className="legal-head">
        <Link to="/" className="row" style={{ textDecoration: "none", color: "inherit" }}>
          <LogoMark size={28} /> <strong>Forlife Com</strong>
        </Link>
        <nav className="row small">
          <Link to="/confidentialite">Confidentialité</Link>
          <Link to="/conditions">Conditions d'utilisation</Link>
        </nav>
      </header>
      <main className="legal-body card" role="main">
        <h1>{title}</h1>
        <p className="muted small">Dernière mise à jour : {UPDATED}</p>
        {children}
      </main>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <p>
        Forlife Com (« nous ») édite la plateforme <b>Forlife Com — AI Growth &amp; Creative OS</b>, accessible sur ai-growth-et-creative-os.web.app, qui aide les PME à
        planifier, créer, publier et mesurer leurs contenus marketing et à suivre leurs prospects. Forlife Com est basée à Bingerville, Côte d'Ivoire. Cette politique explique
        quelles données nous traitons, pourquoi, et comment exercer vos droits.
      </p>

      <h2>1. Données que nous traitons</h2>
      <ul>
        <li><b>Compte</b> : nom, adresse email, mot de passe (stocké uniquement sous forme chiffrée irréversible), organisation et rôle.</li>
        <li><b>Contenus de l'espace de travail</b> : Brand DNA, objectifs, textes, images, vidéos, campagnes et calendrier que vous créez ou importez.</li>
        <li><b>Prospects (CRM)</b> : nom, téléphone, email et échanges des prospects que vous saisissez ou qui remplissent vos formulaires, avec leur consentement à être recontactés.</li>
        <li><b>Comptes de réseaux sociaux connectés</b> (Facebook, Instagram, LinkedIn, TikTok, YouTube) : identifiant et nom public du compte, photo de profil, jetons d'accès accordés par vous, et statistiques des publications faites via Forlife Com.</li>
        <li><b>Paiements</b> : référence et statut des transactions mobile money ; nous ne recevons jamais vos codes ni vos numéros de carte.</li>
        <li><b>Données techniques</b> : journaux de sécurité (adresse IP, date, action) pour protéger les comptes.</li>
      </ul>

      <h2>2. Données TikTok</h2>
      <p>Lorsque vous connectez un compte TikTok, avec votre autorisation explicite via TikTok Login Kit, nous utilisons :</p>
      <ul>
        <li><b>user.info.basic</b> : votre identifiant TikTok, nom affiché et photo de profil, pour afficher le compte connecté dans le Social Hub ;</li>
        <li><b>video.upload</b> : pour envoyer vers votre compte TikTok les vidéos que vous avez créées et validées dans Forlife Com, afin que vous les finalisiez et les publiiez depuis l'application TikTok ;</li>
        <li><b>video.list</b> : pour afficher la liste de vos vidéos et leurs statistiques publiques (vues, j'aime, commentaires, partages) dans vos tableaux de bord.</li>
      </ul>
      <p>
        Nous n'utilisons les données TikTok que pour ces fonctions, à votre demande. Nous ne les vendons pas, ne les utilisons pas pour de la publicité et ne les partageons avec
        aucun tiers. Les jetons d'accès sont chiffrés et ne quittent jamais nos serveurs. Vous pouvez déconnecter le compte à tout moment dans le Social Hub (les jetons sont alors
        supprimés) ou retirer l'autorisation depuis les paramètres de TikTok.
      </p>

      <h2>3. Pourquoi nous utilisons vos données</h2>
      <ul>
        <li>fournir le service (création, validation, programmation et publication des contenus, CRM, statistiques) ;</li>
        <li>générer des propositions avec l'intelligence artificielle à partir des informations de votre espace ;</li>
        <li>sécuriser les comptes, prévenir les abus et respecter nos obligations légales ;</li>
        <li>gérer l'abonnement et les crédits.</li>
      </ul>

      <h2>4. Prestataires</h2>
      <p>Nous faisons appel à des prestataires qui traitent les données pour notre compte, uniquement pour fournir le service :</p>
      <ul>
        <li>Google Cloud et Firebase (hébergement, base de données et fichiers, région Europe) ;</li>
        <li>Anthropic (génération de textes par IA ; les données envoyées ne servent pas à entraîner leurs modèles selon leurs conditions commerciales) ;</li>
        <li>les plateformes que vous connectez (Meta, LinkedIn, TikTok, Google/YouTube) pour publier à votre demande ;</li>
        <li>notre prestataire d'envoi d'emails et notre agrégateur de paiement mobile money.</li>
      </ul>

      <h2>5. Conservation</h2>
      <p>
        Les données sont conservées tant que votre compte est actif. Après suppression d'un compte ou d'un espace, elles sont effacées dans un délai de 30 jours, sauf obligation
        légale de conservation (par exemple les justificatifs de paiement). Les jetons d'un réseau social sont supprimés dès sa déconnexion.
      </p>

      <h2>6. Sécurité</h2>
      <p>
        Connexions chiffrées (HTTPS), mots de passe et jetons chiffrés, accès cloisonnés par organisation et par rôle, journal d'audit des actions sensibles. Aucune publication
        n'est faite sans validation par un membre autorisé de votre équipe.
      </p>

      <h2>7. Vos droits</h2>
      <p>
        Conformément à la loi ivoirienne n° 2013-450 relative à la protection des données à caractère personnel, vous pouvez demander l'accès, la rectification ou la suppression de
        vos données, ou vous opposer à leur traitement, en nous écrivant ({CONTACT}). Vous pouvez aussi saisir l'ARTCI, autorité de protection des données en Côte d'Ivoire.
      </p>

      <h2>8. Contact</h2>
      <p>Forlife Com, Bingerville, Côte d'Ivoire — {CONTACT}.</p>

      <h2>English summary</h2>
      <p className="small">
        Forlife Com is a marketing platform for small businesses. With your explicit consent, we use TikTok Login Kit (user.info.basic) to display your connected account, and the
        Content Posting API (video.upload, video.list) to send the videos you created and approved in Forlife Com to your TikTok account and to show their public statistics. We
        never sell or share TikTok data, never use it for advertising, store access tokens encrypted, and delete them as soon as you disconnect the account. Contact: {CONTACT}.
      </p>
    </LegalLayout>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title="Conditions d'utilisation">
      <p>
        Ces conditions régissent l'utilisation de la plateforme <b>Forlife Com — AI Growth &amp; Creative OS</b> (ai-growth-et-creative-os.web.app), éditée par Forlife Com,
        Bingerville, Côte d'Ivoire. En créant un compte, vous les acceptez.
      </p>

      <h2>1. Le service</h2>
      <p>
        Forlife Com aide les entreprises à définir leur stratégie, créer des contenus (textes, visuels, vidéos) avec l'aide de l'intelligence artificielle, les faire valider,
        les programmer et les publier sur les réseaux sociaux connectés, suivre leurs prospects et mesurer leurs résultats.
      </p>

      <h2>2. Votre compte</h2>
      <ul>
        <li>Vous fournissez des informations exactes et gardez votre mot de passe confidentiel.</li>
        <li>Vous êtes responsable des actions faites depuis votre compte et des droits accordés aux membres de votre équipe.</li>
      </ul>

      <h2>3. Vos contenus et vos comptes connectés</h2>
      <ul>
        <li>Vous restez propriétaire de vos contenus. Vous nous autorisez à les traiter uniquement pour fournir le service.</li>
        <li>Les contenus proposés par l'IA sont des suggestions : vous les relisez et les validez avant toute publication, et vous restez responsable de ce qui est publié.</li>
        <li>
          Lorsque vous connectez un réseau social (Facebook, Instagram, LinkedIn, TikTok, YouTube), Forlife Com n'agit qu'à votre demande et dans la limite des autorisations que
          vous accordez. Vous respectez aussi les conditions de ces plateformes, notamment les conditions d'utilisation et les règles de la communauté de TikTok.
        </li>
        <li>Il est interdit de publier des contenus illégaux, trompeurs, haineux, ou portant atteinte aux droits d'autrui, et de contacter des personnes sans leur consentement.</li>
      </ul>

      <h2>4. Abonnement et crédits</h2>
      <p>
        Certaines fonctions sont payantes (abonnement et crédits IA), payables par mobile money. Les prix sont affichés avant tout paiement. Les crédits consommés ne sont pas
        remboursables, sauf en cas d'échec technique de notre fait.
      </p>

      <h2>5. Disponibilité et responsabilité</h2>
      <p>
        Nous faisons nos meilleurs efforts pour assurer la disponibilité et la sécurité du service, sans garantie d'absence d'interruption. Les statistiques et recommandations
        sont des estimations : nous ne garantissons pas de résultat commercial. Notre responsabilité est limitée aux montants payés au cours des 12 derniers mois.
      </p>

      <h2>6. Résiliation</h2>
      <p>
        Vous pouvez arrêter d'utiliser le service et demander la suppression de vos données à tout moment. Nous pouvons suspendre un compte qui enfreint ces conditions.
      </p>

      <h2>7. Données personnelles</h2>
      <p>
        Le traitement de vos données est décrit dans notre <Link to="/confidentialite">politique de confidentialité</Link>.
      </p>

      <h2>8. Droit applicable et contact</h2>
      <p>Ces conditions sont régies par le droit ivoirien. Contact : Forlife Com, Bingerville, Côte d'Ivoire — {CONTACT}.</p>
    </LegalLayout>
  );
}
