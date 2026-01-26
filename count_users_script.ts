import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const userCount = await prisma.user.count()
    console.log(`Total User records: ${userCount}`)
    
    const coachCount = await prisma.coachProfile.count()
    console.log(`Total CoachProfile records: ${coachCount}`)
  } catch (error) {
    console.error('Error connecting to database:', error)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
