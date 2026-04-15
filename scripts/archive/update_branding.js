const fs = require('fs');

const replacements = [
  {
    file: 'app/globals.css',
    from: /WABOT BSP - WhatsApp/g,
    to: 'Grafty - WhatsApp'
  },
  {
    file: 'app/api/credits/recharge/verify/route.ts',
    from: /Wabot Credit Pack/g,
    to: 'Grafty Credit Pack'
  },
  {
    file: 'app/api/reseller/branding/test-smtp/route.ts',
    from: /Wabot BSP/g,
    to: 'Grafty'
  },
  {
    file: 'app/api/super-admin/finance/invoices/seed-dummy/route.ts',
    from: /Wabot Enterprise Cloud/g,
    to: 'Grafty Enterprise Cloud'
  },
  {
    file: 'app/api/super-admin/growth/recovery/route.ts',
    from: /Wabot dashboard/g,
    to: 'Grafty dashboard'
  },
  {
    file: 'app/api/crm/webhook/[workspace_id]/route.ts',
    from: /SST_WABOT_SECURE_VERIFY/g,
    to: 'SST_GRAFTY_SECURE_VERIFY'
  },
  {
    file: 'components/crm/CrmSetupModal.tsx',
    from: /SST_WABOT_SECURE_VERIFY/g,
    to: 'SST_GRAFTY_SECURE_VERIFY'
  },
  {
    file: 'app/api/settings/api-keys/generate/route.ts',
    from: /"wabot_"/g,
    to: '"grafty_"'
  },
  {
    file: 'app/data-deletion/page.tsx',
    from: /Grafty \(Wabot BSP\)/g,
    to: 'Grafty'
  },
  {
    file: 'app/dashboard/settings/integrations/page.tsx',
    from: /Connect WABOT to/g,
    to: 'Connect GRAFTY to'
  },
  {
    file: 'app/dashboard/chat/page.tsx',
    from: /WABOT CORE/g,
    to: 'GRAFTY CORE'
  },
  {
    file: 'app/dashboard/commerce/page.tsx',
    from: /\[WABOT\]/g,
    to: '[GRAFTY]'
  },
  {
    file: 'app/landing/reseller/page.tsx',
    from: /WABOT<span/g,
    to: 'GRAFTY<span'
  },
  {
    file: 'components/landing-new/LandingFooter.tsx',
    from: /href: "\/#features"/g,
    to: 'href: "https://grafty.pro/how-to-use/flow-builder"' // Specifically for Flow Orchestration, we'll refine below
  }
];

// Special handling for LandingFooter to only replace Flow Orchestration
let footer = fs.readFileSync('components/landing-new/LandingFooter.tsx', 'utf8');
footer = footer.replace(/\{ label: "Flow Orchestration", href: ".*" \}/g, '{ label: "Flow Orchestration", href: "https://grafty.pro/how-to-use/flow-builder" }');
fs.writeFileSync('components/landing-new/LandingFooter.tsx', footer);


replacements.forEach(({ file, from, to }) => {
  if (file === 'components/landing-new/LandingFooter.tsx') return; // Handled specially
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(from, to);
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`Skipped ${file} (not found)`);
  }
});
