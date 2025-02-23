import { PrismaClient, PatientName, VetName, Species, Medication } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean the database first
  await prisma.visit.deleteMany({})

  // Create 5 initial visits
  const visits = [
    {
      vetName: VetName.DR_SMITH,
      patientName: PatientName.MAX,
      species: Species.DOG,
      medications: [Medication.AMOXICILLIN, Medication.ANTI_INFLAMMATORY],
      notes: "Annual checkup. Mild inflammation in left paw. Prescribed antibiotics and anti-inflammatory medication.",
    },
    {
      vetName: VetName.DR_JOHNSON,
      patientName: PatientName.BELLA,
      species: Species.CAT,
      medications: [Medication.PARACETAMOL],
      notes: "Routine vaccination. Slight fever noticed, prescribed paracetamol for comfort.",
    },
    {
      vetName: VetName.DR_WILLIAMS,
      patientName: PatientName.CHARLIE,
      species: Species.MONKEY,
      medications: [Medication.ANTIBIOTIC_OINTMENT],
      notes: "Minor scratch treatment. Applied antibiotic ointment and cleaned wound.",
    },
    {
      vetName: VetName.DR_BROWN,
      patientName: PatientName.LUNA,
      species: Species.CHICKEN,
      medications: [Medication.IBUPROFEN],
      notes: "Wing injury assessment. Prescribed pain relief medication.",
    },
    {
      vetName: VetName.DR_DAVIS,
      patientName: PatientName.ROCKY,
      species: Species.COW,
      medications: [Medication.AMOXICILLIN, Medication.PARACETAMOL],
      notes: "Digestive issues treatment. Prescribed antibiotics and pain relief.",
    },
  ]

  for (const visit of visits) {
    await prisma.visit.create({
      data: visit,
    })
  }

  console.log('Database has been seeded with 5 initial visits! 🌱')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 