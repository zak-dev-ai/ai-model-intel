const fs = require('fs');
let c = fs.readFileSync('tools.html', 'utf8');

// Fix 1: Remove emoji from spotlight featured tools name
c = c.replace(
  '<div class="sp-name">${t.emoji||"🤖"} ${t.name}</div>',
  '<div class="sp-name">${t.name}</div>'
);

// Fix 2: Add image to paid slot sc-ico
// The current code has: <div class="sc-ico">${s.emoji}</div>
// The emoji/s.emoji is the emoji text like '🔥'
const oldIco = '<div class="sc-ico">${s.emoji}</div>';

// Build new version using template literal with proper escaping
const imgTag = String.raw`<img src="${s.image||''}" width="24" height="24" style="object-fit:contain;border-radius:4px" onerror="this.style.display='none'" loading="lazy">`;
const newIco = '<div class="sc-ico">' + imgTag + '<span>${s.emoji}</span></div>';

// Do the replacement
c = c.split(oldIco).join(newIco);

// Fix 3: Also remove emoji from the default ad slot sc-ico
// Same pattern

fs.writeFileSync('tools.html', c, 'utf8');
console.log('tools.html fixed');
