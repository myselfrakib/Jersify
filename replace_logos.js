const fs = require('fs');

const IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/jersify-f9b5e.firebasestorage.app/o/IMG-20260524-WA0002.webp?alt=media&token=22cbac50-3216-4154-a3f0-f666d79b94d3';
const IMAGE_HTML = `<img src="${IMAGE_URL}" alt="JERSIFY" style="height:30px; width:auto; image-rendering:-webkit-optimize-contrast;" />`;

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  // Pattern 1: <a href="index.html" class="logo">JERS<span>I</span>FY</a>
  const p1 = /<a href="index.html" class="logo">\s*JERS<span>I<\/span>FY\s*<\/a>/g;
  if (p1.test(content)) {
    content = content.replace(p1, `<a href="index.html" class="logo" style="display:flex;align-items:center;">${IMAGE_HTML}</a>`);
    changed = true;
  }

  // Pattern 2: <div class="logo">Jersify</div>
  const p2 = /<div class="logo">\s*Jersify\s*<\/div>/g;
  if (p2.test(content)) {
    content = content.replace(p2, `<div class="logo" style="display:flex;align-items:center;">${IMAGE_HTML}</div>`);
    changed = true;
  }

  // Pattern 3: <div class="logo-badge">JERSIFY</div>
  const p3 = /<div class="logo-badge">\s*JERSIFY\s*<\/div>/g;
  if (p3.test(content)) {
    content = content.replace(p3, `<div class="logo-badge" style="display:flex;align-items:center;">${IMAGE_HTML}</div>`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(f, content);
    console.log(`Updated ${f}`);
  }
});
