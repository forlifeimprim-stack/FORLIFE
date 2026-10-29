import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LogoMark } from "../components/ui";

const UPDATED = "29 octobre 2026";
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
          <Link to="/suppression-des-donnees">Suppression des données</Link>
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
        Forlife Com (« nous ») édite la plateforme <b>Forlife Com — AI Growth &amp; Creative OS</b>, accessible sur forlifecomai.ci (et ai-growth-et-creative-os.web.app), qui aide les PME à
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

      <h2>2. Données Facebook et Instagram (Meta)</h2>
      <p>Lorsque vous connectez une Page Facebook ou un compte Instagram professionnel, avec votre autorisation explicite, nous utilisons :</p>
      <ul>
        <li><b>pages_show_list, business_management</b> : afficher les Pages et comptes Instagram que vous administrez, pour que vous choisissiez ceux à relier ;</li>
        <li><b>pages_manage_posts, instagram_content_publish</b> : publier, à la date choisie, les contenus que votre équipe a validés dans Forlife Com ;</li>
        <li><b>pages_read_engagement, instagram_basic</b> : lire vos publications et leurs réactions pour l'analyse « Analyser mes réseaux » et le Brand DNA ;</li>
        <li><b>read_insights, instagram_manage_insights</b> : afficher les statistiques (portée, interactions) des publications faites via Forlife Com.</li>
      </ul>
      <p>
        Avec un compte Instagram professionnel connecté, « Analyser mes réseaux » peut aussi lire les informations publiques d'un autre compte professionnel dont vous donnez le
        lien (nom, présentation, nombre d'abonnés, publications publiques et leurs réactions), uniquement pour votre analyse.
      </p>

      <h2>3. Données Google et YouTube</h2>
      <p>
        Forlife Com utilise les <b>services d'API YouTube</b>. En connectant une chaîne, vous acceptez les{" "}
        <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
          conditions d'utilisation de YouTube
        </a>{" "}
        ; les données sont aussi traitées selon les{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          règles de confidentialité de Google
        </a>
        . Nous utilisons :
      </p>
      <ul>
        <li><b>youtube.upload</b> : envoyer sur votre chaîne les vidéos créées et validées dans Forlife Com ;</li>
        <li><b>youtube.readonly</b> : afficher votre chaîne, lire vos vidéos et leurs statistiques publiques (vues, j'aime, commentaires) pour vos tableaux de bord et l'analyse de vos réseaux.</li>
      </ul>
      <p>
        L'utilisation et le transfert des informations reçues des API Google respectent les{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
          règles relatives aux données utilisateur des services d'API Google
        </a>
        , y compris les exigences d'utilisation limitée. Les statistiques YouTube conservées sont supprimées au plus tard 30 jours après leur dernière mise à jour. Vous pouvez
        retirer l'accès à tout moment depuis le Social Hub ou depuis{" "}
        <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
          les autorisations de votre compte Google
        </a>
        .
      </p>

      <h2>4. Données LinkedIn</h2>
      <p>
        Avec votre autorisation (<b>openid, profile, w_member_social</b>, et pour les pages entreprise <b>r_organization_social, w_organization_social, rw_organization_admin</b>), nous affichons votre profil
        ou vos pages connectés et publions les contenus que vous avez validés.
      </p>

      <h2>5. Données TikTok</h2>
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

      <h2>6. Pourquoi nous utilisons vos données</h2>
      <ul>
        <li>fournir le service (création, validation, programmation et publication des contenus, CRM, statistiques) ;</li>
        <li>générer des propositions avec l'intelligence artificielle à partir des informations de votre espace ;</li>
        <li>sécuriser les comptes, prévenir les abus et respecter nos obligations légales ;</li>
        <li>gérer l'abonnement et les crédits.</li>
      </ul>

      <h2>7. Prestataires</h2>
      <p>Nous faisons appel à des prestataires qui traitent les données pour notre compte, uniquement pour fournir le service :</p>
      <ul>
        <li>Google Cloud et Firebase (hébergement, base de données et fichiers, région Europe) ;</li>
        <li>Anthropic (génération de textes par IA ; les données envoyées ne servent pas à entraîner leurs modèles selon leurs conditions commerciales) ;</li>
        <li>les plateformes que vous connectez (Meta, LinkedIn, TikTok, Google/YouTube) pour publier et lire vos statistiques à votre demande ;</li>
        <li>notre prestataire d'envoi d'emails et notre agrégateur de paiement mobile money.</li>
      </ul>

      <h2>8. Conservation</h2>
      <p>
        Les données sont conservées tant que votre compte est actif. Après suppression d'un compte ou d'un espace, elles sont effacées dans un délai de 30 jours, sauf obligation
        légale de conservation (par exemple les justificatifs de paiement). Les jetons d'un réseau social sont supprimés dès sa déconnexion. Voir aussi{" "}
        <Link to="/suppression-des-donnees">comment supprimer vos données</Link>.
      </p>

      <h2>9. Sécurité</h2>
      <p>
        Connexions chiffrées (HTTPS), mots de passe et jetons chiffrés, accès cloisonnés par organisation et par rôle, journal d'audit des actions sensibles. Aucune publication
        n'est faite sans validation par un membre autorisé de votre équipe.
      </p>

      <h2>10. Vos droits</h2>
      <p>
        Conformément à la loi ivoirienne n° 2013-450 relative à la protection des données à caractère personnel, vous pouvez demander l'accès, la rectification ou la suppression de
        vos données, ou vous opposer à leur traitement, en nous écrivant ({CONTACT}). Vous pouvez aussi saisir l'ARTCI, autorité de protection des données en Côte d'Ivoire.
      </p>

      <h2>11. Contact</h2>
      <p>Forlife Com, Bingerville, Côte d'Ivoire — {CONTACT}.</p>

      <h2>English summary</h2>
      <p className="small">
        Forlife Com is a marketing platform for small businesses. With your explicit consent, it connects your Facebook Pages and Instagram professional accounts (to publish the
        content your team approved, read your posts and their insights), your YouTube channel (YouTube API Services: upload approved videos, read your videos and public statistics;
        see the YouTube Terms of Service and the Google Privacy Policy; our use of Google API data complies with the Google API Services User Data Policy, including the Limited Use
        requirements, and YouTube statistics are deleted at the latest 30 days after their last refresh), your LinkedIn profile or pages (to publish approved posts) and your TikTok
        account (Login Kit user.info.basic; Content Posting API video.upload and video.list, to send approved videos to your TikTok inbox and show their public statistics). We never
        sell or share this data, never use it for advertising, store access tokens encrypted, and delete them as soon as you disconnect an account. Data deletion instructions:
        /suppression-des-donnees. Contact: {CONTACT}.
      </p>
    </LegalLayout>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title="Conditions d'utilisation">
      <p>
        Ces conditions régissent l'utilisation de la plateforme <b>Forlife Com — AI Growth &amp; Creative OS</b> (forlifecomai.ci), éditée par Forlife Com,
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

/** Instructions de suppression des données (URL exigée par Meta, utile aussi pour Google, TikTok et LinkedIn). */
export function DataDeletionPage() {
  return (
    <LegalLayout title="Suppression de vos données">
      <p>Vous pouvez à tout moment retirer l'accès de Forlife Com à vos comptes et demander la suppression de vos données.</p>

      <h2>1. Déconnecter un réseau social (effet immédiat)</h2>
      <ol>
        <li>Connectez-vous à Forlife Com et ouvrez le <b>Social Hub</b>.</li>
        <li>Sur le compte concerné (Facebook, Instagram, LinkedIn, TikTok ou YouTube), cliquez sur <b>Déconnecter</b>.</li>
        <li>Les jetons d'accès de ce compte sont supprimés immédiatement : Forlife Com ne peut plus ni publier ni lire ce compte.</li>
      </ol>

      <h2>2. Retirer l'autorisation depuis la plateforme</h2>
      <ul>
        <li>
          <b>Facebook / Instagram</b> : Paramètres et confidentialité → Paramètres → Intégrations professionnelles (ou « Apps et sites web ») → Forlife Com → Supprimer.
        </li>
        <li>
          <b>Google / YouTube</b> :{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
            myaccount.google.com/permissions
          </a>{" "}
          → Forlife Com → Supprimer l'accès.
        </li>
        <li>
          <b>TikTok</b> : Profil → Paramètres et confidentialité → Sécurité → Applications et services autorisés → Forlife Com → Supprimer.
        </li>
        <li>
          <b>LinkedIn</b> : Préférences → Confidentialité des données → Autres applications → Services autorisés → Forlife Com → Supprimer.
        </li>
      </ul>

      <h2>3. Supprimer toutes vos données</h2>
      <p>
        Envoyez votre demande par WhatsApp ou par appel ({CONTACT}) depuis le numéro ou avec l'adresse email de votre compte, en indiquant « Suppression de mes données » et le nom de
        votre entreprise. Nous confirmons la demande, puis effaçons votre compte, vos espaces, vos contenus et vos données de réseaux sociaux <b>sous 30 jours</b>, sauf obligation
        légale de conservation (justificatifs de paiement). Vous recevez une confirmation une fois la suppression effectuée.
      </p>

      <h2>English</h2>
      <p className="small">
        To delete your data: (1) disconnect the account in Forlife Com → Social Hub (access tokens are deleted immediately); (2) optionally remove Forlife Com from the platform's
        settings (Facebook: Settings → Business Integrations; Google: myaccount.google.com/permissions; TikTok: Settings → Security → Authorized apps; LinkedIn: Settings → Data
        privacy → Permitted services); (3) to erase all your data, contact us ({CONTACT}) with the subject "Data deletion request": your account, workspaces, content and social
        data are deleted within 30 days, except records we must keep by law (payment receipts).
      </p>
    </LegalLayout>
  );
}
