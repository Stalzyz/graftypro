import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkDomains() {
  const resellers = await prisma.reseller.findMany({
    select: { id: true, name: true, custom_domain: true, external_home_url: true, home_page_type: true }
  });
  console.log("Resellers with external URL:");
  resellers.filter((r: any) => r.external_home_url).forEach((r: any) => console.log(`  ${r.name}: ${r.external_home_url}`));

  const domains = await prisma.partnerDomain.findMany({
    select: { domain: true, reseller: { select: { external_home_url: true, name: true } } }
  });
  console.log("\nPartner Domains with external URL inheritance:");
  domains.filter((d: any) => d.reseller?.external_home_url).forEach((d: any) => console.log(`  ${d.domain}: ${d.reseller.name} -> ${d.reseller.external_home_url}`));
}

checkDomains()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
