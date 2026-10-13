# Audit de l'interface — 13/10/2026

Périmètre : 23 pages (publiques et connectées), 5 largeurs d'écran (360, 390, 768, 1024, 1440 px), soit 115 vérifications
automatisées (Playwright) : débordement horizontal, taille des zones tactiles, erreurs JavaScript et réseau, accessibilité
(axe-core, WCAG 2.1 AA) sur mobile et ordinateur.

| Constat initial | Correction |
|---|---|
| Débordement horizontal sur mobile : Brand DNA, Stratégie, Campagne, CRM (aussi sur ordinateur), Paramètres, Back-office | Colonnes de grille rétrécissables ; kanban, onglets et tableaux défilent dans leur propre zone |
| 32 contrastes insuffisants (liens et badges orange, coût dans les boutons, jours hors mois) | Orange de texte assombri (≥ 4,8:1 sur tous les fonds clairs) |
| Structure : pas de zone principale sur les pages publiques, rôles ARIA invalides, en-tête de colonne vide, tableaux défilants inaccessibles au clavier | Repères et rôles corrigés, tableaux focalisables |
| Zones tactiles trop petites (menu 32×29 px, cases à cocher 13 px, puces de version) | Menu 44 px, cases 20 px dans des libellés cliquables, puces 36 px |
| Menu mobile sans voile ni fermeture clavier | Voile cliquable + touche Échap |
| Clés React dupliquées (Analytics) | Corrigé |

Résultat après corrections : 0 débordement, 0 erreur JavaScript, 0 violation axe sur les 23 pages.
Les seules erreurs réseau observées sont des 429 volontaires du rafraîchissement de session lors du test intensif
(plus de 10 chargements de pages publiques par minute depuis la même adresse).

Bundle web : 130 ko compressés (JS) + 6 ko (CSS).

## Vidéo de démonstration

`apps/web/public/demo/` : vidéo guidée de 1 min 35 (captures réelles de la plateforme, voix off française, sous-titres
incrustés, transcription dans la fenêtre), en WebM (VP9) et MP4 (H.264). Proposée automatiquement à la première
connexion sur chaque appareil, puis disponible depuis l'accueil (« Vidéo de démo ») et le pied du menu.
