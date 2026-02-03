import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    try {
        const coaches = await prisma.coachProfile.findMany()
        console.log(`Total Coaches: ${coaches.length}`)
        coaches.forEach(c => {
            console.log(`- @${c.username} (ID: ${c.id}, FullName: ${c.fullName}, Niche: ${c.niche})`)
        })
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
