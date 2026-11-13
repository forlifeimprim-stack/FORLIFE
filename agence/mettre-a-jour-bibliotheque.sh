#!/usr/bin/env bash
# Met à jour les skills et guides importés de GitHub (mêmes sélections que l'installation initiale).
# Usage : bash agence/mettre-a-jour-bibliotheque.sh        (depuis la racine du dépôt)
# Relire ensuite le diff (git diff --stat) avant de committer : ce sont des fichiers externes.
set -euo pipefail
RACINE="$(cd "$(dirname "$0")/.." && pwd)"; cd "$RACINE"
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
cloner() { git clone -q --depth 1 "https://github.com/$1.git" "$T/$(echo "$1" | tr / _)"; }

MARKETING_FR="ad-creative ads ai-seo analytics co-marketing community-marketing competitor-profiling content-strategy copy-editing copywriting cro customer-research emails image launch lead-magnets marketing-council marketing-ideas marketing-plan marketing-psychology offers pricing product-marketing prospecting public-relations referrals sales-enablement schema seo-audit site-architecture sms social video"
SOCIAL="brand-profile social-strategy audience-research goals-and-kpis content-pillars content-calendar batch-content-plan community-management crisis-and-moderation reply-and-comment-writer engagement-routine caption-writer carousel-writer hook-writer writing-style-and-tone storytelling-and-narrative facebook-strategy facebook-groups instagram-growth instagram-reels-publishing tiktok-growth tiktok-script reels-script short-form-video-script scripting-and-storyboarding talking-head-and-piece-to-camera before-after-and-transformation behind-the-scenes-and-founder social-proof-and-testimonials ugc-and-influencer trend-jacking seasonal-and-moment-marketing livestream-and-realtime linkedin-company-pages analytics-and-reporting canva capcut thumbnail-design quote-cards-and-text-graphics design-and-templates infographic-and-data-viz platform-specs-and-validation image-prompt ai-image-editing nano-banana ai-video kling veo-3 ai-music-and-sound ai-voiceover"

echo "== Marketing FR (david-corroy/skills-marketing-fr)"
cloner david-corroy/skills-marketing-fr
for s in $MARKETING_FR; do rm -rf "agence/bibliotheque/marketing-fr/$s"; cp -r "$T/david-corroy_skills-marketing-fr/skills/$s" agence/bibliotheque/marketing-fr/; done

echo "== Réseaux sociaux (social-media-skills/skills)"
cloner social-media-skills/skills
for s in $SOCIAL; do rm -rf "agence/bibliotheque/reseaux-sociaux/$s"; cp -r "$T/social-media-skills_skills/skills/$s" agence/bibliotheque/reseaux-sociaux/; done
find agence/bibliotheque/reseaux-sociaux -type d -name evals -prune -exec rm -rf {} +

echo "== Montage vidéo (Melvynx/video-agent-skills) -> .claude/skills"
cloner Melvynx/video-agent-skills
for d in "$T/Melvynx_video-agent-skills/skills/"*/; do s="$(basename "$d")"; rm -rf ".claude/skills/$s"; cp -r "$d" ".claude/skills/$s"; done

echo "== Motion (echris6/motion-video-kit) et design (designrique/ai-graphic-design-skill)"
cloner echris6/motion-video-kit
rm -rf agence/bibliotheque/motion-video/business-motion-film
cp -r "$T/echris6_motion-video-kit/business-motion-film" agence/bibliotheque/motion-video/
cp "$T/echris6_motion-video-kit/LICENSE" agence/bibliotheque/motion-video/business-motion-film/LICENSE
cloner designrique/ai-graphic-design-skill
cp "$T/designrique_ai-graphic-design-skill/SKILL.md" "$T/designrique_ai-graphic-design-skill/LICENSE" agence/bibliotheque/design-graphique/ai-graphic-design/

echo "Terminé. Vérifier : git diff --stat ; puis committer."
