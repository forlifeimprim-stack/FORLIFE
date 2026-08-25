const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set.");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);

async function generateContent(topic) {
  console.log(`Generating content for: ${topic.topic}...`);
  const model = genAI.getGenerativeModel({ model: "gemini-3.7-flash" });
  
  const prompt = `Tu es un expert en communication marketing en Côte d'Ivoire. Rédige un article de blog court (environ 400 mots) pour l'agence "Forlife Com'", basée à Bingerville.
  Le ton doit être chaleureux, teinté d'humour, et professionnel.
  Titre de l'article : "${topic.topic}"
  Domaine : "${topic.category}"
  
  Format de sortie : uniquement du HTML (sans balises HTML globales, juste le contenu, par ex : des <h2>, des <p>, des <ul>). Ne mets pas de <h1> car le titre de l'article sera déjà un <h1>. N'inclus pas non plus le markdown \`\`\`html.
  Termine l'article avec une petite blague ou un trait d'esprit lié au sujet.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();
  // Remove markdown formatting if any
  text = text.replace(/```html/g, '').replace(/```/g, '').trim();
  return text;
}

function generateSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  const rootDir = path.join(__dirname, '..');
  const topicsFile = path.join(__dirname, 'topics.json');
  
  // Read topics
  let topics = [];
  try {
    topics = JSON.parse(fs.readFileSync(topicsFile, 'utf8'));
  } catch(e) {
    console.error("Failed to read topics.json", e);
    process.exit(1);
  }

  // Find next unused topic
  const nextTopicIndex = topics.findIndex(t => !t.used);
  if (nextTopicIndex === -1) {
    console.log("All topics have been used. Congratulations!");
    process.exit(0);
  }

  const topic = topics[nextTopicIndex];
  const slug = generateSlug(topic.topic);
  
  // Generate HTML content
  const contentHtml = await generateContent(topic);
  
  // Create excerpt (first 120 chars without HTML tags)
  const plainText = contentHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const excerpt = plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;

  // Generate image using Pollinations API (free, no key needed)
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent("professional marketing communication agency ivory coast " + topic.keyword)}?width=800&height=400&nologo=true`;
  const relativeImagePath = `../assets/images/blog/${slug}.jpg`;
  
  // We'll download the image so the site remains fast and independent
  const imageDestPath = path.join(rootDir, `assets`, `images`, `blog`, `${slug}.jpg`);
  
  // Create dir if not exists
  const imgDir = path.dirname(imageDestPath);
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  try {
    const imgRes = await fetch(imageUrl);
    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(imageDestPath, buffer);
    console.log(`Image downloaded to ${imageDestPath}`);
  } catch (e) {
    console.error("Failed to download image. We'll link directly.", e);
  }
  
  // Date formatting
  const today = new Date();
  const dateIso = today.toISOString().split('T')[0];
  const dateFr = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(today);

  // Read template
  const templatePath = path.join(rootDir, 'blog', 'article-template.html');
  let template = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders
  template = template.replace(/\{\{TITLE\}\}/g, topic.topic);
  template = template.replace(/\{\{CATEGORY\}\}/g, topic.category);
  template = template.replace(/\{\{EXCERPT\}\}/g, excerpt);
  template = template.replace(/\{\{DATE_ISO\}\}/g, dateIso);
  template = template.replace(/\{\{DATE_FR\}\}/g, dateFr);
  template = template.replace(/\{\{IMAGE_URL\}\}/g, relativeImagePath);
  template = template.replace(/\{\{CONTENT\}\}/g, contentHtml);

  // Write new HTML file
  const articlePath = path.join(rootDir, 'blog', `${slug}.html`);
  fs.writeFileSync(articlePath, template);
  console.log(`Created new article at ${articlePath}`);

  // Update index.html
  const indexHtmlPath = path.join(rootDir, 'blog', 'index.html');
  let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  
  const cardHtml = `
        <article class="blog-card" aria-label="Article de blog">
          <a href="${slug}.html" class="blog-card-link">
            <div class="blog-card-img-wrap">
              <img src="${relativeImagePath}" alt="${topic.topic.replace(/"/g, '&quot;')}" class="blog-card-img">
              <span class="blog-card-category">${topic.category}</span>
            </div>
            <div class="blog-card-body">
              <div class="blog-card-meta">
                <time datetime="${dateIso}">${dateFr}</time>
                <span>·</span>
                <span>3 min de lecture</span>
              </div>
              <h3 class="blog-card-title">${topic.topic}</h3>
              <p class="blog-card-excerpt">${excerpt}</p>
            </div>
          </a>
        </article>`;

  indexHtml = indexHtml.replace('<!-- AUTOMATION_INJECTION_MARKER -->', `<!-- AUTOMATION_INJECTION_MARKER -->\n${cardHtml}`);
  fs.writeFileSync(indexHtmlPath, indexHtml);
  console.log("Updated blog/index.html");

  // Mark topic as used
  topics[nextTopicIndex].used = true;
  fs.writeFileSync(topicsFile, JSON.stringify(topics, null, 2));
  console.log("Updated topics.json");
}

main().catch(e => { console.error(e); process.exit(1); });
