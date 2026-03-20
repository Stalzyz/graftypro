const fs = require('fs');

const replacements = [
  {
    file: 'app/dashboard/settings/integrations/page.tsx',
    from: /Connect GRAFTY to/g,
    to: 'Connect Grafty to'
  },
  {
    file: 'app/dashboard/chat/page.tsx',
    from: /GRAFTY CORE/g,
    to: 'Grafty CORE'
  },
  {
    file: 'app/dashboard/commerce/page.tsx',
    from: /\[GRAFTY\]/g,
    to: '[Grafty]'
  },
  {
    file: 'app/landing/reseller/page.tsx',
    from: /GRAFTY<span/g,
    to: 'Grafty<span'
  }
];

replacements.forEach(({ file, from, to }) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(from, to);
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
