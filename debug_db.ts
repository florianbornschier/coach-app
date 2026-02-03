import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    try {
        const userCount = await prisma.user.count()
        const coachCount = await prisma.coachProfile.count()
        console.log(`DATABASE_STATUS:`)
        console.log(`Users: ${userCount}`)
        console.log(`Coaches: ${coachCount}`)

        if (coachCount > 0) {
            const topCoaches = await prisma.coachProfile.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' }
            })
            console.log('\nLATEST_COACHES:')
            topCoaches.forEach(c => {
                console.log(`- ID: ${c.id}, Username: ${c.username}, Created: ${c.createdAt.toISOString()}`)
            })
        }
    } catch (error) {
        console.error('ERROR:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
