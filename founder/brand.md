# La marque — Forlife Com'

La marque existe déjà : nom, logo, charte graphique v2 (README du dépôt), site et portfolio. Ce document **audite** donc la marque au regard du positionnement retenu (`marketing.md`, version A) au lieu de chercher un nouveau nom. Recommandation : **garder le nom**, resserrer la promesse.

## 1. Le nom : garder « Forlife Com' »

| Critère | Constat | Risque |
| --- | --- | --- |
| Ce qu'il dit | « For life » (« pour la vie ») : durée, fidélité. Correspond à la relation annuelle visée avec les écoles et les paroisses | Faible |
| À l'oral | Se prononce facilement en français ivoirien (« for-laïf-com ») ; l'apostrophe de « Com' » disparaît à l'oral | Faible |
| Sur une enseigne ou une icône | Court ; le « F » orange fonctionne en favicon | Faible |
| Lien avec Forlife Imprim | Atout : on hérite de la réputation de l'atelier d'impression | Moyen : deux noms pour le client. Recommandation : afficher « **Forlife Com' — l'atelier Forlife Imprim** » |
| Confusion avec un concurrent | Aucun concurrent de `competitors.md` ne porte un nom proche (DEKON, IDesign, DREAMIT, Prestige Communication, Jamel Design…) | Faible |

**Les vérifications à faire soi-même** (seules des recherches publiques sont possibles ici ; un conseil en propriété industrielle confirme ; rien n'est protégé tant que ce n'est pas déposé) :

- **Marque** : la Côte d'Ivoire relève de l'**OAPI** (Organisation africaine de la propriété intellectuelle, Yaoundé). Un dépôt OAPI couvre les 17 États membres. Chercher « Forlife » dans les bases OAPI (https://www.oapi.int) et WIPO Global Brand Database (https://branddb.wipo.int). Classes à vérifier : **35** (publicité, gestion des affaires), **40** (impression, traitement de matériaux), **41** (formation, photo et vidéo événementielles), **25** (vêtements, si les tee-shirts portent la marque Forlife), **16** (imprimés). Antenne locale : OIPI (Office ivoirien de la propriété intellectuelle).
- **Nom de domaine** : vérifier la disponibilité de **forlifecom.ci** et **forlife.ci** auprès du registre NIC.CI (https://www.nic.ci), et de **forlifecom.com**. Le site est aujourd'hui hébergé sur Firebase (`.firebaserc`) : un domaine en **.ci** renforcerait la confiance locale.
- **Comptes sur les réseaux** : vérifier « forlifecom » ou « forlife.com.ci » sur Facebook, Instagram, TikTok et YouTube, et réserver le même identifiant partout, même sans publier.

## 2. La promesse et la voix

**La promesse (ce sur quoi le client peut toujours compter)** :
> **« Prêt à la date promise. Vous validez avant de payer. »**

Elle répond à la peur numéro un du panel (le retard qui fait « honte devant la paroisse ou les parents ») et à la confiance (BAT avant paiement). Les signatures actuelles, « L'ami des PME, TPE, Écoles et Communautés » et « Donner du sens. Créer l'impact. », ne disent ni ce que le client reçoit ni pourquoi venir ici (critique du prisme Produit, `board.md`).

**Trois slogans possibles**
1. **« Prêt pour votre grand jour. »** (recommandé : événements, kermesses, mariages, rentrée)
2. « L'atelier qui tient ses dates. »
3. « Vos supports, à l'heure, à Bingerville. »

« Ensemble pour la vie ! » peut rester la signature de fin de message (elle sert la relation, pas la promesse).

**La voix en trois adjectifs**

| Adjectif | À faire | À éviter |
| --- | --- | --- |
| **Fiable** | Donner une date et un prix par écrit, tenir parole | « Dans les plus brefs délais », « on va voir » |
| **Proche** | Tutoyer seulement si le client le fait ; parler de Bingerville, des paroisses, des écoles par leur nom (avec accord) | Le jargon d'agence (« stratégie 360° », « ROI », « synergie ») |
| **Fier du travail bien fait** | Montrer les coulisses, les tests de lavage, les finitions | Les superlatifs sans preuve (« le meilleur », « la référence ») |

**Avant / après (une phrase du site)**
- *Avant* : « Forlife Com' accompagne chaque entrepreneur, école et communauté à Bingerville et Abidjan Est pour construire une image qui inspire confiance. »
- *Après* : « Bâches, tee-shirts, écussons, faire-parts : vous validez la maquette sur WhatsApp, vous payez en deux fois, et c'est prêt à la date promise. Sinon, on vous rembourse 20 %. »

## 3. Le look (audit de la charte v2)

**Couleurs** (déjà en place dans `css/style.css`) et contraste WCAG mesuré :

| Rôle | Couleur | Contraste | Verdict |
| --- | --- | ---: | --- |
| Accent (boutons, titres) | Orange `#EA7822` | Texte blanc sur orange : **2,91:1** | ❌ **Échoue WCAG AA** (4,5:1 requis pour le texte courant, 3:1 pour le gros texte) |
| | | Texte noir `#0D0D0D` sur orange : 6,67:1 | ✅ AA |
| Orange foncé | `#C96318` | Texte blanc : 3,98:1 | ⚠️ AA seulement pour le gros texte (≥ 18,66 px gras) |
| Orange pour texte sur fond clair | `#A9520F` (proposé) | Sur blanc : 5,38:1 | ✅ AA |
| Fond sombre | `#0D0D0D` | Orange sur noir : 6,67:1 ; or `#D9AC4E` sur noir : 9,22:1 | ✅ AA |
| Fond clair | Crème `#F9F6F2` | Texte `#1E1E1E` : 15,47:1 ; orange `#EA7822` : 2,7:1 | ✅ pour le texte ; ❌ pour du texte orange |

**À corriger sur le site** : les boutons « Demander un devis » avec du texte blanc sur orange `#EA7822` sont difficiles à lire au soleil sur un téléphone, là où la cible regarde. Deux options : texte **noir** sur orange, ou fond **`#A9520F`** avec texte blanc. Les textes orange sur fond crème doivent passer en `#A9520F`.

**Typographie** : **Poppins** (Google Fonts, licence libre SIL OFL) pour tout. Garder une seule famille : c'est simple et lisible.

**Brief logo** : le logo actuel (SVG, versions horizontale, pied de page et favicon) est conservé. Vérifier qu'il reste lisible (a) brodé à 5 cm sur un polo, (b) imprimé en une couleur sur un reçu, (c) en icône de 32 px sur WhatsApp. Si ce n'est pas le cas, prévoir une version « monogramme F » simplifiée.

**Les cinq premiers points de contact**
1. **Le profil WhatsApp Business** (c'est la vraie page d'accueil) : photo du logo, description « Atelier d'impression & communication — Bingerville. Prêt à la date promise. », catalogue en 4 rubriques, message d'accueil automatique demandant la date de l'événement.
2. **L'enseigne de l'atelier** : « Forlife Com' — l'atelier Forlife Imprim — Prêt pour votre grand jour » et le numéro WhatsApp en grand.
3. **Le BAT** : chaque maquette envoyée porte un cartouche « Date de remise promise : … / Acompte : … / Solde : … ».
4. **Le reçu** (papier ou WhatsApp) : date promise, date livrée, rappel du parrainage (« Recommandez-nous : 5 000 FCFA pour vous deux »).
5. **La réponse à la première réclamation** : le jour même, publique si l'avis est public : « Vous avez raison, nous avons livré le [date] au lieu du [date]. Voici vos 20 % comme promis. »
