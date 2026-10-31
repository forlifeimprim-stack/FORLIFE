// Planches du Tome 1.
const { entete, ann, pt, leg, win, ruban, phone, nav, grille, fleche } = require('./kit');

// Clavier AZERTY dessiné touche par touche.
function clavier() {
  const Z = { l: '#F7C9A0', c: '#F2DDA6', k: '#BFE1CF', f: '#C9DBF0', n: '#DCCDF0' };
  const rangs = [
    [['Échap', 1.2, 'k'], ...'²&é"\'(-è_çà)='.split('').map((t) => [t, 1, 'c']), ['⌫ Retour', 2, 'k']],
    [['Tab ↹', 1.5, 'k'], ...'AZERTYUIOP^$'.split('').map((t) => [t, 1, 'l']), ['Entrée ↵', 1.5, 'k']],
    [['Verr Maj ⇪', 1.8, 'k'], ...'QSDFGHJKLMù*'.split('').map((t) => [t, 1, 'l']), ['', 1.2, 'k']],
    [['Maj ⇧', 1.4, 'k'], ...'<WXCVBN,;:!'.split('').map((t) => [t, 1, 'l']), ['Maj ⇧', 2.6, 'k']],
    [['Ctrl', 1.3, 'k'], ['⊞', 1.1, 'k'], ['Alt', 1.1, 'k'], ['Espace', 6.6, 'k'], ['Alt Gr', 1.3, 'k'], ['Ctrl', 1.3, 'k'], ['←', 1, 'f'], ['↑↓', 1, 'f'], ['→', 1, 'f']],
  ];
  const u = 62;
  const touches = rangs.map((r) => `<div style="display:flex;gap:6px">${r.map(([t, w, z]) =>
    `<div style="width:${w * u + (w - 1) * 6}px;height:${u}px;background:${Z[z]};border-radius:9px;border:2px solid #fff;box-shadow:0 2px 0 #c9c1b5;display:flex;align-items:center;justify-content:center;font-size:${t.length > 3 ? 15 : 22}px;font-weight:700">${t}</div>`).join('')}</div>`).join('');
  const pave = [['Verr Num', '/', '*'], ['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], ['0', '.', '↵']].map((r) =>
    `<div style="display:flex;gap:6px">${r.map((t) => `<div style="width:${u}px;height:${u}px;background:${Z.n};border-radius:9px;border:2px solid #fff;box-shadow:0 2px 0 #c9c1b5;display:flex;align-items:center;justify-content:center;font-size:${t.length > 2 ? 13 : 22}px;font-weight:700">${t}</div>`).join('')}</div>`).join('');
  return `<div style="display:flex;gap:26px;background:#E8E2DA;padding:22px;border-radius:18px;width:max-content">
    <div style="display:flex;flex-direction:column;gap:6px">${touches}</div><div style="display:flex;flex-direction:column;gap:6px">${pave}</div></div>
    <div style="display:flex;gap:26px;margin-top:22px;font-size:19px">${[['l', 'Les lettres'], ['c', 'Les chiffres (avec Maj)'], ['k', 'Les touches de commande'], ['f', 'Les flèches'], ['n', 'Le pavé numérique']].map(([z, t]) =>
      `<div style="display:flex;gap:10px;align-items:center"><span style="width:26px;height:26px;border-radius:6px;background:${Z[z]};border:2px solid #fff"></span>${t}</div>`).join('')}</div>`;
}

const fichiersCentre = (items) => `<div style="display:flex;flex-wrap:wrap;gap:22px;padding:20px">${items.map(([e, n]) =>
  `<div style="width:110px;text-align:center;font-size:14px"><div style="font-size:52px">${e}</div>${n}</div>`).join('')}</div>`;

const explorateur = ({ chemin, gauche, centre, w = 1040, pts = '' }) => win({ titre: 'Explorateur de fichiers', ic: '#F2C04C', w, corps: `
  <div style="display:flex;gap:10px;align-items:center;padding:10px 14px;border-bottom:1px solid #eee">
    <span class="btn p" style="position:relative">+ Nouveau</span><span class="btn">✂</span><span class="btn">⧉</span><span class="btn">📋</span><span class="btn">🗑</span><span class="btn">Afficher ▾</span></div>
  <div style="display:flex;gap:10px;align-items:center;padding:8px 14px;border-bottom:1px solid #eee"><span>← → ↑</span>
    <div class="champ" style="flex:1">${chemin}</div><div class="champ" style="width:230px;color:#888">🔍 Rechercher</div></div>
  <div style="display:flex;min-height:330px"><div style="width:230px;border-right:1px solid #eee;padding:12px 14px;font-size:15px;line-height:2">${gauche}</div>
  <div style="flex:1">${centre}</div></div>${pts}` });

module.exports = {
  ports: entete('MODULE 1 · LE TOUR DE L\'ORDINATEUR', 'Les ports de l\'ordinateur portable') + `
    <div class="ligne"><div class="col" style="gap:50px;padding-top:20px">
      ${[['Côté gauche', [['1', 'Chargeur', 60, 26, '#18162A', 13], ['2', 'USB-A', 54, 22, '#1F5F99', 4], ['3', 'USB-C', 40, 16, '#18162A', 8], ['4', 'HDMI', 64, 26, '#555', 4]]],
         ['Côté droit', [['5', 'Prise casque', 26, 26, '#18162A', 13], ['6', 'Lecteur de carte', 70, 10, '#555', 2], ['2', 'USB-A', 54, 22, '#1F5F99', 4], ['7', 'Aération', 150, 34, 'repeating-linear-gradient(90deg,#666 0 6px,transparent 6px 12px)', 3]]]].map(([cote, ports]) => `
        <div><div style="font-family:Bricolage;font-size:22px;margin-bottom:48px">${cote}</div>
        <div style="width:1000px;height:90px;background:linear-gradient(#cfd4da,#aeb4bb);border-radius:14px 14px 30px 30px;display:flex;align-items:center;gap:60px;padding:0 70px;position:relative">
        ${ports.map(([n, nom, w, h, c, r]) => `<div style="position:relative;display:flex;flex-direction:column;align-items:center"><div style="width:${w}px;height:${h}px;background:${c};border-radius:${r}px"></div>
          <div class="pt" style="top:-60px;left:${w / 2 - 19}px">${n}</div><div style="position:absolute;top:${h + 34}px;white-space:nowrap;font-size:16px">${nom}</div></div>`).join('')}</div></div>`).join('')}
    </div>${leg([['1', 'Chargeur', 'souvent marqué d\'un éclair'], ['2', 'USB-A', 'rectangle plat, un seul sens'], ['3', 'USB-C', 'petit ovale, deux sens'], ['4', 'HDMI', 'vers une télévision ou un vidéoprojecteur'], ['5', 'Prise casque', 'écouteurs, micro-casque'], ['6', 'Lecteur de carte', 'carte mémoire d\'appareil photo'], ['7', 'Aération', 'ne jamais la boucher']])}</div>`,

  verrouillage: entete('MODULE 1 · ALLUMER', 'De l\'écran de verrouillage au Bureau') + `
    <div class="ligne" style="align-items:center">
      <div style="width:620px;height:380px;border-radius:12px;border:12px solid var(--indigo);background:radial-gradient(ellipse at 30% 30%,#E2AC48,#A03E20 70%);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative">
        <div style="font-size:84px;font-weight:300">14:32</div><div style="font-size:24px">samedi 31 octobre</div>
        <div style="position:absolute;bottom:24px;font-size:16px;opacity:.9">Appuyez sur une touche ou cliquez</div>${pt('1', 'top:-20px;left:-20px')}</div>
      ${fleche()}
      <div style="width:620px;height:380px;border-radius:12px;border:12px solid var(--indigo);background:#1d4f6b;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff">
        <div style="width:80px;height:80px;border-radius:50%;background:#E8E2DA;color:#18162A;font-family:Bricolage;font-size:34px;display:flex;align-items:center;justify-content:center">A</div>
        <div style="font-size:24px;margin:10px 0">Akissi</div><div class="champ" style="width:260px;color:#888">Code PIN ••••</div>${pt('2', 'top:-20px;left:-20px')}</div>
    </div>
    <div class="note">1. L\'écran de verrouillage : appuyez sur une touche. &nbsp; 2. Tapez votre code PIN ou votre mot de passe, puis Entrée : le Bureau apparaît.</div>`,

  menu_demarrer: entete('MODULE 1 · ÉTEINDRE', 'Démarrer → Marche/Arrêt → Arrêter') + `
    <div class="ligne"><div><div style="width:760px;background:#f3f3f3;border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.2);padding:26px;position:relative">
      <div class="champ" style="border-radius:20px;color:#888">🔍 Rechercher des applications, des paramètres et des documents</div>
      <div style="display:flex;justify-content:space-between;margin:20px 4px 12px;font-weight:700"><span>Épinglé</span><span class="btn">Toutes les applications ›</span></div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:18px;text-align:center;font-size:13px">${[['📝', 'Word'], ['📊', 'Excel'], ['🌐', 'Edge'], ['📁', 'Explorateur'], ['⚙️', 'Paramètres'], ['🧮', 'Calculatrice'], ['🗒️', 'Bloc-notes'], ['🖼️', 'Photos'], ['🛍️', 'Store'], ['✉️', 'Courrier'], ['📅', 'Calendrier'], ['🎵', 'Musique']].map(([e, n]) => `<div><div style="font-size:38px">${e}</div>${n}</div>`).join('')}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:30px;padding-top:16px;border-top:1px solid #ddd">
        <span style="display:flex;gap:10px;align-items:center"><span style="width:34px;height:34px;border-radius:50%;background:#E8E2DA;display:flex;align-items:center;justify-content:center;font-weight:700">A</span>Akissi</span>
        <span style="position:relative;width:46px;height:46px;border-radius:50%;border:4px solid var(--orange);display:flex;align-items:center;justify-content:center;font-size:24px">⏻${pt('B', 'top:-26px;right:-26px')}</span></div>
      <div style="position:absolute;right:-250px;bottom:70px;background:#fff;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.2);padding:8px 0;width:220px;font-size:17px">
        ${['😴 Mettre en veille', '⏹️ Arrêter', '🔄 Redémarrer'].map((t, i) => `<div style="padding:10px 18px;${i === 1 ? 'background:#FEF0E4;font-weight:700' : ''}">${t}</div>`).join('')}${pt('C', 'top:-18px;right:-18px')}</div>
      </div><div style="width:760px;height:56px;margin-top:14px;background:rgba(240,243,248,.95);border-radius:8px;display:flex;align-items:center;justify-content:center;gap:12px;position:relative">
        <div style="display:grid;grid-template-columns:15px 15px;gap:3px;outline:3px solid #EA7822;outline-offset:4px;border-radius:4px"><i style="width:15px;height:15px;background:#1E6FD9"></i><i style="width:15px;height:15px;background:#1E6FD9"></i><i style="width:15px;height:15px;background:#1E6FD9"></i><i style="width:15px;height:15px;background:#1E6FD9"></i></div>
        <div class="champ" style="border-radius:16px;width:160px;padding:5px 12px;color:#888">🔍 Rechercher</div><span style="font-size:24px">📁 🌐 📝</span>${pt('A', 'top:-24px;left:300px')}</div></div>
      <div style="margin-left:280px">${leg([['A', 'Le bouton Démarrer', 'au centre de la barre des tâches'], ['B', 'Marche/Arrêt', 'en bas à droite du menu'], ['C', 'Le choix', 'veille, arrêter ou redémarrer']])}</div></div>`,

  infos_systeme: entete('MODULE 1 · EXERCICE 3', 'La carte d\'identité de mon ordinateur') + win({ titre: 'Paramètres', ic: '#6B6560', w: 1400, corps: `
    <div style="display:flex;min-height:470px"><div style="width:300px;background:#f6f6f6;padding:20px;font-size:16px;line-height:2.3">
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px"><span style="width:44px;height:44px;border-radius:50%;background:#E8E2DA;display:flex;align-items:center;justify-content:center;font-weight:700">A</span><b>Akissi</b></div>
      ${['🖥️ Système', '🔵 Bluetooth et appareils', '🌐 Réseau et Internet', '🎨 Personnalisation', '📦 Applications', '👤 Comptes', '♿ Accessibilité', '🔄 Windows Update'].map((t, i) => `<div style="padding:0 10px;border-radius:6px;${i === 0 ? 'background:#e8e8e8;font-weight:700' : ''}">${t}</div>`).join('')}</div>
    <div style="flex:1;padding:26px 34px"><div style="font-size:15px;color:#666">Système ›</div><div style="font-size:30px;font-weight:700;margin-bottom:20px">Informations système</div>
      <div style="background:#f9f9f9;border-radius:10px;padding:18px 22px"><b>Spécifications de l\'appareil</b>
      ${[['Nom de l\'appareil', 'PC-AKISSI'], ['Processeur', 'Intel(R) Core(TM) i5-1235U 1.30 GHz', 1], ['Mémoire RAM installée', '8,00 Go', 1], ['ID de périphérique', 'A1B2C3D4-…'], ['Type du système', 'Système d\'exploitation 64 bits']].map(([k, v, h]) =>
        `<div style="display:grid;grid-template-columns:260px 1fr;padding:9px 10px;margin-top:6px;border-radius:6px;${h ? 'background:#FEF0E4;outline:3px solid #EA7822' : ''}"><span style="color:#555">${k}</span><span>${v}</span></div>`).join('')}</div>
      <div style="background:#f9f9f9;border-radius:10px;padding:14px 22px;margin-top:14px"><b>Spécifications de Windows</b><div style="display:grid;grid-template-columns:260px 1fr;padding:9px 10px"><span style="color:#555">Édition</span><span>Windows 11 Famille</span></div></div>
    </div></div>` }),

  souris: entete('MODULE 2 · LE DÉCLIC', 'La souris : chaque doigt à sa place') + `
    <div class="ligne" style="align-items:center;gap:80px"><svg width="460" height="560" viewBox="0 0 460 560">
      <path d="M230 30 C 110 30 70 120 70 230 L 70 380 C 70 480 140 530 230 530 C 320 530 390 480 390 380 L 390 230 C 390 120 350 30 230 30 Z" fill="#fff" stroke="#18162A" stroke-width="6"/>
      <path d="M70 230 L 390 230 M230 30 L 230 230" stroke="#18162A" stroke-width="5"/>
      <path d="M78 222 C 80 120 120 40 222 38 L 222 222 Z" fill="#FEF0E4"/><path d="M238 38 C 340 40 380 120 382 222 L 238 222 Z" fill="#E8F1FA"/>
      <rect x="213" y="90" width="34" height="80" rx="17" fill="#18162A"/><rect x="221" y="102" width="18" height="10" rx="3" fill="#E2AC48"/><rect x="221" y="122" width="18" height="10" rx="3" fill="#E2AC48"/><rect x="221" y="142" width="18" height="10" rx="3" fill="#E2AC48"/>
      <text x="140" y="190" font-size="26" text-anchor="middle" font-family="Bricolage" fill="#C96318">Gauche</text><text x="320" y="190" font-size="26" text-anchor="middle" font-family="Bricolage" fill="#1F5F99">Droit</text>
      <path d="M120 300 C 140 360 150 420 230 440" stroke="#7A4A2A" stroke-width="40" stroke-linecap="round" fill="none" opacity=".35"/></svg>
      ${leg([['1', 'Bouton gauche (l\'index)', 'clic : choisir · double-clic : ouvrir · maintenir : glisser'], ['2', 'Bouton droit (le majeur)', 'clic droit : le menu des choix'], ['3', 'La molette', 'faire défiler la page'], ['4', 'La paume', 'posée sans serrer, la souris glisse à plat']])}</div>`,

  clavier: entete('MODULE 2 · LE DÉCLIC', 'Le clavier AZERTY et ses quartiers') + clavier() + `<div class="note">Une touche à trois étages : <b>à</b> (normal) · <b>0</b> (avec Maj) · <b>@</b> (avec Alt Gr).</div>`,

  blocnotes: entete('MODULE 2 · PAS À PAS', 'Mes premières lignes dans le Bloc-notes') + `<div class="ligne">${win({ titre: 'Sans titre – Bloc-notes', ic: '#6B6B6B', w: 980, corps: `
    <div style="display:flex;gap:22px;padding:8px 16px;font-size:15px;border-bottom:1px solid #eee"><span>Fichier</span><span>Modifier</span><span>Affichage</span></div>
    <div style="padding:24px 28px;font-size:24px;line-height:1.8;min-height:300px;font-family:Consolas,monospace">Akissi<br>Je suis à Abidjan.<br><span style="position:relative">Je bois mon café<span style="display:inline-block;width:3px;height:30px;background:#18162A;vertical-align:middle;margin-left:2px"></span>${pt('A', 'top:-46px;right:-60px')}</span></div>` })}
    ${leg([['A', 'Le curseur', 'le petit trait qui clignote : la prochaine lettre s\'écrira ici']])}</div>`,

  cote_a_cote: entete('MODULE 3 · PAS À PAS', 'Deux fenêtres côte à côte') + `
    <div style="width:1480px;height:560px;border-radius:12px;border:12px solid var(--indigo);background:#1d4f6b;display:flex;gap:6px;padding:6px">
      <div class="win" style="flex:1"><div class="tb"><span class="ic" style="background:#555"></span>Calculatrice<div class="bt"><span>—</span><span>☐</span><span>✕</span></div></div>
        <div style="padding:16px;background:#f3f3f3;height:100%"><div style="text-align:right;font-size:56px;padding:20px 10px">12 500</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${'7 8 9 ÷ 4 5 6 × 1 2 3 − 0 , = +'.split(' ').map((t) => `<div style="background:${'÷×−+='.includes(t) ? '#E8E2DA' : '#fff'};height:58px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:24px">${t}</div>`).join('')}</div></div></div>
      <div class="win" style="flex:1"><div class="tb"><span class="ic" style="background:#6B6B6B"></span>Comptes – Bloc-notes<div class="bt"><span>—</span><span>☐</span><span>✕</span></div></div>
        <div style="padding:22px;font-size:22px;line-height:1.8;font-family:Consolas,monospace">Wax hollandais : 18 000<br>Foulard : 2 000<br>Total du jour : 12 500 + …</div></div></div>
    <div class="note">Glissez une fenêtre par sa barre de titre contre le bord gauche de l\'écran, puis choisissez celle qui ira à droite.</div>`,

  explorateur: entete('MODULE 4 · PAS À PAS', 'L\'Explorateur de fichiers : l\'armoire de l\'ordinateur') + `<div class="ligne">${explorateur({
    chemin: 'Ce PC › Documents › Formation',
    gauche: '🏠 Accueil<br>🖥️ Bureau<br>⬇️ Téléchargements<br><b>📄 Documents</b><br>🖼️ Images<br>💻 Ce PC<br>🔌 Clé USB (D:)',
    centre: fichiersCentre([['📁', 'Famille'], ['📁', 'Travail'], ['📁', 'Administratif'], ['📁', 'Formation'], ['📄', '2026-11-03 Mes notes.txt'], ['📝', '2026-11-03 Demande de stage.docx']]),
    pts: pt('A', 'top:200px;left:90px') + pt('B', 'top:96px;left:520px') + pt('C', 'top:40px;left:20px') + pt('D', 'top:96px;right:120px') + pt('E', 'top:200px;left:620px'),
  })}${leg([['A', 'Le volet de gauche', 'les grands rangements et Ce PC'], ['B', 'La barre d\'adresse', 'le chemin du dossier ouvert'], ['C', '+ Nouveau', 'créer un dossier'], ['D', 'Rechercher', 'retrouver un fichier perdu'], ['E', 'Le contenu', 'dossiers et fichiers']])}</div>`,

  arbre: entete('MODULE 4 · LA MÉTHODE FOR LIFE', 'Une place pour chaque chose') + `
    <div style="display:flex;flex-direction:column;align-items:center"><div class="carte" style="font-family:Bricolage;font-size:26px">📄 Documents</div>
    <div style="width:1380px;height:30px;border:3px solid #c9c1b5;border-bottom:none;border-radius:14px 14px 0 0;margin-top:18px"></div>
    <div style="display:flex;gap:20px;margin-top:-4px">${[['Famille', ['Actes de naissance', 'Bulletins des enfants', 'Photos']], ['Travail', ['Courriers', 'Rapports']], ['Boutique', ['Factures', 'Stock', 'Ventes']], ['Administratif', ['CIE-SODECI', 'Impôts', 'Banque']], ['Formation', ['Tome 1', 'Exercices']]].map(([d, s], i) =>
      `<div style="width:262px"><div class="carte" style="background:${['#FEF0E4', '#E7F6EE', '#F2E3C4', '#E8F1FA', '#F1EBF8'][i]};font-family:Bricolage;font-size:22px;text-align:center">📁 ${d}</div>
      <div style="margin:10px 0 0 30px;border-left:3px solid #c9c1b5;padding-left:16px;display:flex;flex-direction:column;gap:10px;padding-top:10px">${s.map((x) => `<div style="font-size:18px">📁 ${x}</div>`).join('')}</div></div>`).join('')}</div></div>
    <div class="note">Nom des fichiers : la date à l\'envers, puis le sujet. Exemple : <b>2026-11-03 Courrier mairie.docx</b></div>`,

  word: entete('MODULE 5 · LE DÉCLIC', 'Word et son ruban') + `<div class="ligne">${win({ titre: '2026-11-03 Demande de stage – Word', ic: '#2B579A', w: 1080, corps: `
    <div style="position:relative">${ruban(['Fichier', 'Accueil', 'Insertion', 'Mise en page', 'Références', 'Révision', 'Affichage'], 'Accueil',
      `<span class="champ" style="width:150px">Calibri</span><span class="champ" style="width:60px">11</span><span class="btn"><b>G</b></span><span class="btn"><i>I</i></span><span class="btn"><u>S</u></span><span class="btn">A▾</span>
       <span class="btn">≡</span><span class="btn">☰</span><span class="btn">≣</span><span class="btn">• Puces</span><span class="btn">Titre 1</span><span class="btn">Normal</span>`)}
      ${pt('A', 'top:-10px;left:-14px')}${pt('B', 'top:40px;left:-14px')}${pt('C', 'top:2px;left:380px')}</div>
    <div style="background:#e9e9e9;padding:26px;display:flex;justify-content:center"><div style="width:520px;background:#fff;padding:40px 46px;font-size:12px;line-height:1.7;box-shadow:0 2px 8px rgba(0,0,0,.15);position:relative">
      Yao Kouamé<br>Cocody, Abidjan<br><br><div style="text-align:right">Abidjan, le 3 novembre 2026</div><br><b>Objet : demande de stage</b><br><br>Madame, Monsieur,<br>Étudiant en deuxième année de licence de gestion, je souhaite effectuer un stage…<span style="display:inline-block;width:2px;height:14px;background:#000;vertical-align:middle"></span>${pt('D', 'top:150px;right:-60px')}</div></div>
    <div style="display:flex;justify-content:space-between;padding:6px 14px;font-size:13px;color:#555;background:#f3f3f3;position:relative"><span>Page 1 sur 1 · 64 mots · Français (Côte d\'Ivoire)</span><span>− ——●—— + 100 %</span>${pt('E', 'top:-24px;left:200px')}</div>` })}
    ${leg([['A', 'Les onglets du ruban', 'Fichier pour enregistrer et imprimer'], ['B', 'Police et taille', 'Calibri, 11'], ['C', 'Gras, italique, souligné, alignements', 'd\'abord sélectionner'], ['D', 'La page et le curseur', ''], ['E', 'La barre d\'état', 'pages, mots, zoom']])}</div>`,

  lettre: entete('MODULE 5 · PAS À PAS', 'Le plan de la lettre formelle') + `<div class="ligne"><div style="width:760px;background:#fff;padding:46px 56px;font-size:17px;line-height:1.6;box-shadow:0 10px 30px rgba(0,0,0,.15);position:relative">
    ${ann('1', '<div>Yao Kouamé<br>Cité universitaire, Cocody<br>07 00 00 00 00 · yao.kouame@gmail.com</div>', 'top:-6px;left:-60px')}
    ${ann('2', '<div style="margin-left:400px;margin-top:18px">Monsieur le Directeur<br>Ivoire Distribution<br>Plateau, Abidjan</div>', 'top:0;left:350px')}
    ${ann('3', '<div style="text-align:right;margin-top:18px">Abidjan, le 3 novembre 2026</div>', 'top:0;left:350px')}
    ${ann('4', '<div style="margin-top:18px"><b>Objet : demande de stage</b></div>', 'top:-6px;left:-60px')}
    ${ann('5', '<div style="margin-top:14px">Monsieur le Directeur,</div>', 'top:-6px;left:-60px')}
    ${ann('6', '<div style="margin-top:10px;color:#777">Qui je suis… ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬<br>Ce que je demande et pourquoi chez vous… ▬▬▬▬▬▬▬▬▬▬▬<br>Ce que j\'apporte, ma disponibilité… ▬▬▬▬▬▬▬▬▬▬▬▬</div>', 'top:10px;left:-60px')}
    ${ann('7', '<div style="margin-top:12px">Dans l\'attente de votre réponse, je vous prie d\'agréer, Monsieur le Directeur, l\'expression de mes salutations distinguées.</div>', 'top:0;left:-60px')}
    ${ann('8', '<div style="margin-top:22px;margin-left:420px">Yao Kouamé<br><span class="main" style="font-size:30px">Yao K.</span></div>', 'top:0;left:350px')}</div>
    ${leg([['1', 'Vos coordonnées'], ['2', 'Le destinataire'], ['3', 'Lieu et date'], ['4', 'L\'objet, en gras'], ['5', 'La formule d\'appel'], ['6', 'Le corps en trois paragraphes'], ['7', 'La formule de politesse'], ['8', 'La signature']])}</div>`,

  excel: entete('MODULE 6 · LE DÉCLIC', 'Excel : chaque case a son adresse') + `<div class="ligne">${win({ titre: '2026-11 Ventes de novembre – Excel', ic: '#217346', w: 1080, corps: `
    <div style="position:relative">${ruban(['Fichier', 'Accueil', 'Insertion', 'Formules', 'Données', 'Affichage'], 'Accueil', '<span class="btn"><b>G</b></span><span class="btn">Bordures ▾</span><span class="btn">🪣</span><span class="btn">000</span><span class="btn">,00 →</span><span class="btn" style="margin-left:auto">Σ Somme automatique</span>')}${pt('E', 'top:44px;right:120px')}</div>
    <div style="display:flex;gap:8px;padding:6px 10px;border-bottom:1px solid #ddd;position:relative"><span class="champ" style="width:80px">B3</span><span style="color:#888;padding:8px">fx</span><span class="champ" style="flex:1">Pagne baoulé</span>${pt('C', 'top:-14px;left:30px')}${pt('D', 'top:-14px;left:420px')}</div>
    <div style="padding:10px;position:relative">${grille(['A', 'B', 'C', 'D', 'E'], [['Ventes de novembre', '', '', '', ''], ['', '', '', '', ''], ['Date', 'Pagne baoulé', 'Quantité', 'Prix', 'Montant'], ['03/11', 'Wax', '2', '18000', '36000'], ['', '', '', '', ''], ['', '', '', '', '']], { sel: 'B3', larg: { A: 140, B: 160 } })}
      ${pt('A', 'top:-4px;left:250px')}${pt('B', 'top:120px;left:-6px')}</div>
    <div style="display:flex;gap:4px;padding:6px 10px;background:#f3f3f3;font-size:14px;position:relative"><span style="background:#fff;padding:4px 14px;border-bottom:3px solid #217346">Feuil1</span><span style="padding:4px 10px">+</span>${pt('F', 'top:-20px;left:110px')}</div>` })}
    ${leg([['A', 'Les colonnes', 'des lettres'], ['B', 'Les lignes', 'des chiffres'], ['C', 'La zone Nom', 'l\'adresse de la cellule : B3'], ['D', 'La barre de formule', 'ce que contient vraiment la cellule'], ['E', 'Σ Somme automatique', ''], ['F', 'Les feuilles', 'les pages du classeur']])}</div>`,

  ventes: entete('MODULE 6 · LE RÉSULTAT', 'Le cahier de ventes qui compte tout seul') + `<div class="carte" style="display:inline-block;padding:24px">
    ${grille(['A', 'B', 'C', 'D', 'E'], [[{ t: '<b style="font-size:20px">Ventes de novembre 2026</b>', s: '' }, '', '', '', ''], ['', '', '', '', ''],
      ...[['Date', 'Article', 'Quantité', 'Prix unitaire', 'Montant']].map((r) => r.map((t) => ({ t: `<b>${t}</b>`, s: 'background:#EA7822;color:#fff' }))),
      ['03/11/2026', 'Wax hollandais', '2', '18 000', '36 000'], ['03/11/2026', 'Pagne baoulé', '1', '25 000', '25 000'], ['04/11/2026', 'Wax ordinaire', '5', '6 500', '32 500'], ['05/11/2026', 'Foulard', '4', '2 000', '8 000'], ['05/11/2026', 'Wax hollandais', '1', '18 000', '18 000'],
      ['', '', '', { t: '<b>TOTAL</b>', s: 'background:#FEF0E4' }, { t: '<b>119 500</b>', s: 'background:#FEF0E4' }]].map((l) => l.map((v) => (typeof v === 'string' && /^[\d ]+$/.test(v) && v.length > 1 ? { t: v, s: 'text-align:right' } : v))), { larg: { A: 150, B: 190, D: 150, E: 140 } })}
    <div class="note">En E9 : <b>=SOMME(E4:E8)</b>. En E4 : <b>=C4*D4</b>, recopiée vers le bas. Changez une quantité : le total change tout seul.</div></div>`,

  edge: entete('MODULE 7 · PAS À PAS', 'Le navigateur : votre véhicule sur Internet') + `<div class="ligne"><div style="position:relative">${nav({ url: 'https://www.servicepublic.gouv.ci', onglets: ['Service Public – Portail', 'prix machine à coudre…'], w: 1060, corps: `
    <div style="padding:30px 40px;min-height:330px;background:#fff"><div style="font-family:Bricolage;font-size:30px;color:#187A52">servicepublic.gouv.ci</div><div style="color:#666;margin:8px 0 22px">Le portail des démarches administratives de Côte d\'Ivoire</div>
    <div class="champ" style="width:520px">🔍 Rechercher une démarche…</div><div style="display:flex;gap:16px;margin-top:24px">${['Particuliers', 'Entreprises', 'Associations'].map((t) => `<div class="carte" style="width:200px;text-align:center">${t}</div>`).join('')}</div></div>` })}
    ${pt('A', 'top:62px;left:2px')}${pt('B', 'top:62px;left:96px')}${pt('C', 'top:62px;left:280px')}${pt('D', 'top:62px;right:96px')}${pt('E', 'top:-14px;left:200px')}${pt('F', 'top:-14px;left:520px')}</div>
    ${leg([['A', 'Précédent et suivant', ''], ['B', 'Actualiser', ''], ['C', 'Le cadenas et l\'adresse', '.gouv.ci : site officiel'], ['D', 'L\'étoile des favoris', ''], ['E', 'Les onglets', 'plusieurs pages ouvertes'], ['F', 'Nouvel onglet', 'Ctrl + T']])}</div>`,

  gmail: entete('MODULE 8 · PAS À PAS', 'Écrire un e-mail') + `<div class="ligne"><div style="position:relative">${nav({ url: 'mail.google.com', onglets: ['Boîte de réception – yao.kouame'], w: 1080, corps: `
    <div style="display:flex;min-height:470px;background:#f6f8fc"><div style="width:230px;padding:16px;font-size:15px;line-height:2.2">
      <div class="btn" style="padding:14px 20px;border-radius:16px;background:#c2e7ff;border:none;font-weight:700">✏️ Nouveau message</div><br>
      <b style="background:#d3e3fd;padding:4px 12px;border-radius:14px">📥 Boîte de réception 3</b><br>⭐ Messages suivis<br>📤 Envoyés<br>📝 Brouillons<br>⚠️ Spam</div>
    <div style="flex:1;background:#fff;margin:10px;border-radius:14px;padding:6px 0;font-size:15px">${[['Ivoire Distribution', 'Votre candidature – Bien reçu, nous revenons vers vous'], ['Mariam Koné', 'Compte rendu de la réunion'], ['CIE', 'Votre facture de novembre']].map(([a, o], i) => `<div style="display:flex;gap:20px;padding:12px 18px;border-bottom:1px solid #eee;${i === 0 ? 'font-weight:700' : ''}"><span style="width:170px">${a}</span><span>${o}</span></div>`).join('')}</div></div>
    <div style="position:absolute;right:20px;bottom:0;width:470px;background:#fff;border-radius:12px 12px 0 0;box-shadow:0 8px 30px rgba(0,0,0,.25);font-size:15px">
      <div style="background:#f2f6fc;padding:10px 16px;border-radius:12px 12px 0 0;font-weight:700">Nouveau message</div>
      <div style="padding:9px 16px;border-bottom:1px solid #eee;position:relative">À &nbsp; recrutement@exemple.ci${pt('B', 'top:-2px;left:-56px')}</div><div style="padding:9px 16px;border-bottom:1px solid #eee;position:relative">Candidature au stage d\'assistant commercial${pt('C', 'top:-2px;left:-56px')}</div>
      <div style="padding:12px 16px;height:110px;color:#444;position:relative">Madame, Monsieur,<br>Étudiant en deuxième année de licence de gestion…${pt('D', 'top:20px;left:-56px')}</div>
      <div style="padding:6px 16px;font-size:13px;color:#1F5F99">📎 CV_Yao_Kouame.pdf (120 Ko)</div>
      <div style="display:flex;gap:40px;align-items:center;padding:12px 16px 12px 70px;position:relative"><span class="btn b" style="border-radius:18px">Envoyer</span><span style="font-size:24px">📎</span>${pt('F', 'top:8px;left:14px')}${pt('E', 'top:8px;left:240px')}</div></div>` })}
    ${pt('A', 'top:96px;left:-14px')}</div>
    ${leg([['A', 'Nouveau message', ''], ['B', 'À', 'l\'adresse du destinataire'], ['C', 'L\'objet', 'le sujet en quelques mots'], ['D', 'Le message', 'poli et court'], ['E', 'Le trombone', 'joindre un fichier'], ['F', 'Envoyer', 'après avoir tout relu']])}</div>`,

  dcim: entete('MODULE 9 · PAS À PAS', 'Les photos du téléphone sur l\'ordinateur') + `<div class="ligne" style="align-items:center">
    ${phone(`<div style="padding:20px"><div style="font-size:13px;color:#666">Système Android</div><div style="font-weight:700;font-size:18px;margin:6px 0 16px">Utiliser la connexion USB pour</div>
      ${['Transfert de fichiers / Android Auto', 'Partage de connexion USB', 'MIDI', 'Transfert de photos (PTP)', 'Recharge uniquement'].map((t, i) => `<div style="display:flex;gap:12px;align-items:center;padding:12px 0;font-size:15px"><span style="width:22px;height:22px;border-radius:50%;border:3px solid ${i === 0 ? '#187A52' : '#999'};${i === 0 ? 'background:radial-gradient(#187A52 45%,#fff 50%)' : ''}"></span>${t}</div>`).join('')}</div>`, { style: 'position:relative' })}
    ${fleche()}
    ${explorateur({ w: 980, chemin: 'Ce PC › Galaxy A15 › Stockage interne › DCIM › Camera', gauche: '🖥️ Bureau<br>📄 Documents<br>🖼️ Images<br>💻 Ce PC<br><b>📱 Galaxy A15</b>',
      centre: `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;padding:18px">${Array.from({ length: 15 }, (_, i) => `<div style="height:92px;border-radius:6px;background:linear-gradient(135deg,${['#EA7822', '#187A52', '#E2AC48', '#A03E20', '#1F5F99'][i % 5]},#F6EFE6)"></div>`).join('')}</div>` })}</div>
    <div class="note">Sur le téléphone : choisir <b>Transfert de fichiers</b>. Sur l\'ordinateur : <b>Ce PC › nom du téléphone › Stockage interne › DCIM › Camera</b>.</div>`,

  print_pdf: entete('MODULE 11 · GARDER LA PREUVE', 'Enregistrer n\'importe quelle page en PDF') + win({ titre: 'Imprimer', ic: '#6B6560', w: 1300, corps: `
    <div style="display:flex;min-height:470px"><div style="flex:1;background:#e9e9e9;display:flex;align-items:center;justify-content:center"><div style="width:330px;height:430px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.2);padding:30px;font-size:12px;line-height:1.7">
      <b style="font-size:16px">Accusé de réception</b><br>Dossier n° 2026-118-457<br>Concours administratif – inscription<br>Candidat : KOFFI N\'Guessan<br>Date : 15/11/2026 à 21 h 14<br><br>Paiement reçu : 10 000 F<br>Référence : MM-88412-CI<br><br>Conservez ce document.</div></div>
    <div style="width:430px;padding:26px;font-size:16px;display:flex;flex-direction:column;gap:18px"><div style="font-size:24px;font-weight:700">Imprimer <span style="font-size:15px;color:#666;font-weight:400">1 feuille</span></div>
      <div>Destination<div class="champ" style="margin-top:6px;outline:3px solid #EA7822;font-weight:700">🖨️ Microsoft Print to PDF ▾</div></div>
      <div>Pages<div class="champ" style="margin-top:6px">Toutes</div></div><div>Disposition<div class="champ" style="margin-top:6px">Portrait</div></div>
      <div style="margin-top:auto;display:flex;gap:12px;justify-content:flex-end"><span class="btn b">Imprimer</span><span class="btn">Annuler</span></div></div></div>` }) + `<div class="note">Ctrl + P, choisir <b>Microsoft Print to PDF</b>, Imprimer, puis enregistrer le PDF dans le dossier de la démarche.</div>`,
};
