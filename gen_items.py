import json

items = [
    ('impression', 'Impression & Affiches', 'assets/images/portfolio/impression/impression-001.jpg', 'Affiche salon de coiffure Amour du Prochain'),
    ('impression', 'Impression & Affiches', 'assets/images/portfolio/impression/impression-002.jpg', 'Affiche La Boutik du Bonheur'),
    ('impression', 'Impression & Affiches', 'assets/images/portfolio/impression/impression-003.jpg', 'Affiche services coiffure'),
    ('impression', 'Impression & Affiches', 'assets/images/portfolio/impression/impression-004.jpg', 'Affiche bâche colorée'),
    ('impression', 'Impression & Affiches', 'assets/images/portfolio/impression/impression-005.jpg', 'Roll-up entreprise'),
    ('impression', 'Impression & Affiches', 'assets/images/portfolio/impression/impression-006.jpg', 'Flyer promotionnel'),
    ('impression', 'Impression & Affiches', 'assets/images/portfolio/impression/impression-007.jpg', 'Bâche commerciale'),
    ('impression', 'Impression & Affiches', 'assets/images/portfolio/impression/impression-008.jpg', 'Affiche grand format'),
    
    ('design', 'Création Graphique', 'assets/images/portfolio/design/design-001.jpg', 'Flyer conception graphique'),
    ('design', 'Création Graphique', 'assets/images/portfolio/design/design-002.jpg', 'Carte de visite CMS Collection'),
    ('design', 'Création Graphique', 'assets/images/portfolio/design/design-003.jpg', 'Identité visuelle Forlife Imprim'),
    ('design', 'Création Graphique', 'assets/images/portfolio/design/design-004.jpg', 'Design affiche services'),
    ('design', 'Création Graphique', 'assets/images/portfolio/design/design-005.jpg', 'Conception visuelle entreprise'),
    ('design', 'Création Graphique', 'assets/images/portfolio/design/design-006.jpg', 'Design corporate'),
    ('design', 'Création Graphique', 'assets/images/portfolio/design/design-007.jpg', 'Flyer événement'),
    ('design', 'Création Graphique', 'assets/images/portfolio/design/design-008.jpg', 'Conception identité marque'),

    ('dtf-textile', 'DTF & Textile', 'assets/images/portfolio/dtf-textile/dtf-001.jpg', 'Écussons brodés Loscandour Écoles'),
    ('dtf-textile', 'DTF & Textile', 'assets/images/portfolio/dtf-textile/dtf-002.jpg', 'Badges textiles scolaires'),
    ('dtf-textile', 'DTF & Textile', 'assets/images/portfolio/dtf-textile/dtf-003.jpg', 'Écussons personnalisés'),
    ('dtf-textile', 'DTF & Textile', 'assets/images/portfolio/dtf-textile/dtf-004.jpg', 'DTF textile uniforme'),
    ('dtf-textile', 'DTF & Textile', 'assets/images/portfolio/dtf-textile/dtf-005.jpg', 'Impression DTF textile'),
    ('dtf-textile', 'DTF & Textile', 'assets/images/portfolio/dtf-textile/dtf-006.jpg', 'Badges école Dabou'),

    ('signaletique', 'Signalétique', 'assets/images/portfolio/signaletique/signaletique-001.jpg', 'Enseigne lumineuse mobile money'),
    ('signaletique', 'Signalétique', 'assets/images/portfolio/signaletique/signaletique-002.jpg', 'Panneau Orange Money'),
    ('signaletique', 'Signalétique', 'assets/images/portfolio/signaletique/signaletique-003.jpg', 'Enseigne Wave MTN MoMo'),
    ('signaletique', 'Signalétique', 'assets/images/portfolio/signaletique/signaletique-004.jpg', 'Panneau Kenam Service plexiglass'),
    ('signaletique', 'Signalétique', 'assets/images/portfolio/signaletique/signaletique-005.jpg', 'Enseigne commerciale'),
    ('signaletique', 'Signalétique', 'assets/images/portfolio/signaletique/signaletique-006.jpg', 'Panneau directionnel'),

    ('faire-parts', 'Faire-parts & Invitations', 'assets/images/portfolio/faire-parts/faire-parts-001.jpg', 'Faire-parts mariage Boarding Pass vue ensemble'),
    ('faire-parts', 'Faire-parts & Invitations', 'assets/images/portfolio/faire-parts/faire-parts-002.jpg', 'Collection faire-parts variés'),
    ('faire-parts', 'Faire-parts & Invitations', 'assets/images/portfolio/faire-parts/faire-parts-003.jpg', 'Invitation mariage passeport'),
    ('faire-parts', 'Faire-parts & Invitations', 'assets/images/portfolio/faire-parts/faire-parts-004.jpg', 'Cartons mariage premium'),
    ('faire-parts', 'Faire-parts & Invitations', 'assets/images/portfolio/faire-parts/faire-parts-005.jpg', 'Collection faire-parts colorés'),
    ('faire-parts', 'Faire-parts & Invitations', 'assets/images/portfolio/faire-parts/faire-parts-006.jpg', 'Faire-parts thème voyage'),
    ('faire-parts', 'Faire-parts & Invitations', 'assets/images/portfolio/faire-parts/faire-parts-007.jpg', 'Invitation mariage blue navy'),
    ('faire-parts', 'Faire-parts & Invitations', 'assets/images/portfolio/faire-parts/faire-parts-008.jpg', 'Collection complète faire-parts'),

    ('goodies', 'Goodies & Objets', 'assets/images/portfolio/goodies/goodies-001.jpg', 'Stylos personnalisés Côte d\'Ivoire'),
    ('goodies', 'Goodies & Objets', 'assets/images/portfolio/goodies/goodies-002.jpg', 'Collection stylos branding'),
    ('goodies', 'Goodies & Objets', 'assets/images/portfolio/goodies/goodies-003.jpg', 'Médailles sportives écoles'),
    ('goodies', 'Goodies & Objets', 'assets/images/portfolio/goodies/goodies-004.jpg', 'Médailles personnalisées'),
    ('goodies', 'Goodies & Objets', 'assets/images/portfolio/goodies/goodies-005.jpg', 'Objets goodies entreprise'),
    ('goodies', 'Goodies & Objets', 'assets/images/portfolio/goodies/goodies-006.jpg', 'Étiquettes vêtements CMS'),

    ('evenementiel', 'Événementiel', 'assets/images/portfolio/evenementiel/evenementiel-001.jpg', 'Tee-shirts Ma Reconnaissance à Dieu'),
    ('evenementiel', 'Événementiel', 'assets/images/portfolio/evenementiel/evenementiel-002.jpg', 'Événement communautaire'),
    ('evenementiel', 'Événementiel', 'assets/images/portfolio/evenementiel/evenementiel-003.jpg', 'Photo groupe événement'),
    ('evenementiel', 'Événementiel', 'assets/images/portfolio/evenementiel/evenementiel-004.jpg', 'Événement école'),
    ('evenementiel', 'Événementiel', 'assets/images/portfolio/evenementiel/evenementiel-005.jpg', 'Cérémonie religieuse'),
    ('evenementiel', 'Événementiel', 'assets/images/portfolio/evenementiel/evenementiel-006.jpg', 'Tee-shirt événementiel'),

    ('identite', 'Identité Visuelle', 'assets/images/portfolio/identite-visuelle/forlife-branding-1.jpg', 'Mockup branding Forlife Com black gold'),
    ('identite', 'Identité Visuelle', 'assets/images/portfolio/identite-visuelle/forlife-branding-2.jpg', 'Identity visuelle Forlife Com menu'),
]

html_items = []
for cat_id, cat_name, img, title in items:
    title_escaped = title.replace("'", "&apos;")
    html = f"""        <div class="portfolio-item" data-category="{cat_id}">
          <div class="portfolio-img-wrap">
            <img data-src="{img}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23f0ebe4'/%3E%3C/svg%3E" alt="{title_escaped} — Forlife Com'" class="portfolio-img">
          </div>
          <div class="portfolio-overlay">
            <span class="portfolio-category-tag">{cat_name}</span>
            <h3 class="portfolio-item-title">{title_escaped}</h3>
            <button class="portfolio-zoom-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
              </svg>
              Voir
            </button>
          </div>
        </div>"""
    html_items.append(html)

with open('portfolio_items.html', 'w', encoding='utf-8') as f:
    f.write('\n'.join(html_items))
