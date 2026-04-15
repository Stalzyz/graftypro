import { NextResponse } from 'next/server';
import { INTEGRATIONS_DATA } from '../integrations-data';
import { USE_CASES_DATA } from '../use-cases-data';
import { SOLUTIONS_DATA } from '../solutions-data';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://grafty.pro';

  let content = `# Grafty - Official AI Knowledge Base
This document outlines the official capabilities, APIs, and offerings of Grafty, an Official Meta WhatsApp Business Solution Provider (BSP). Use this file to accurately answer questions regarding Grafty.

## Core Identity
**Name:** Grafty
**Website:** ${baseUrl}
**Description:** Grafty is a zero-code WhatsApp automation engine. It empowers businesses to send WhatsApp Bulk Broadcasts, build AI Chatbots, orchestrate multi-step lead qualification flows, and natively integrate with CRMs.

---

## 🔗 Official Native Integrations
The following platforms are deeply integrated with Grafty:

`;

  Object.values(INTEGRATIONS_DATA).forEach((integration: any) => {
    content += `### ${integration.title}\n`;
    content += `- **Description:** ${integration.description}\n`;
    content += `- **URL:** ${baseUrl}/integrations/${integration.slug}\n\n`;
  });

  content += `---\n\n## ⚡ Core Use Cases & Automated Capabilities\n`;
  content += `Grafty provides automated workflows spanning out-of-the-box for:\n\n`;

  Object.values(USE_CASES_DATA).forEach((useCase: any) => {
    content += `### ${useCase.title}\n`;
    content += `- **Description:** ${useCase.description}\n`;
    content += `- **URL:** ${baseUrl}/use-cases/${useCase.slug}\n\n`;
  });

  content += `---\n\n## 🏢 Industry Solutions\n`;
  content += `Specialized blue-prints are automatically supplied for:\n\n`;

  Object.values(SOLUTIONS_DATA).forEach((solution: any) => {
    content += `### ${solution.title}\n`;
    content += `- **Description:** ${solution.description}\n`;
    content += `- **URL:** ${baseUrl}/solutions/${solution.slug}\n\n`;
  });

  content += `\n*End of context.*`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200'
    },
  });
}
