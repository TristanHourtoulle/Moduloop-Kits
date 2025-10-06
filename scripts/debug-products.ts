import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  console.log('🔍 Vérification des produits...\n');

  // Trouver Paul Levy
  const paulLevy = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { contains: 'Paul', mode: 'insensitive' } },
        { email: { contains: 'paul', mode: 'insensitive' } }
      ]
    }
  });

  if (!paulLevy) {
    console.log('❌ Paul Levy non trouvé');
    return;
  }

  console.log(`✅ Paul Levy trouvé: ${paulLevy.name} (${paulLevy.email})\n`);

  // Récupérer ses produits
  const products = await prisma.product.findMany({
    where: {
      createdById: paulLevy.id
    },
    take: 5
  });

  console.log(`📦 ${products.length} produits trouvés:\n`);

  products.forEach((p, i) => {
    console.log(`\n${i + 1}. ${p.nom} (${p.reference})`);
    console.log('   Legacy fields:');
    console.log(`     - prixAchat1An: ${p.prixAchat1An}`);
    console.log(`     - prixUnitaire1An: ${p.prixUnitaire1An}`);
    console.log(`     - prixVente1An: ${p.prixVente1An}`);
    console.log('   New fields:');
    console.log(`     - prixAchatAchat: ${p.prixAchatAchat || 'NULL'}`);
    console.log(`     - prixUnitaireAchat: ${p.prixUnitaireAchat || 'NULL'}`);
    console.log(`     - prixVenteAchat: ${p.prixVenteAchat || 'NULL'}`);
  });

  await prisma.$disconnect();
}

checkProducts().catch(console.error);
