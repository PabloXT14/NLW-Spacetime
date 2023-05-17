import fastify from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const app = fastify()

const PORT = 3333

app.get('/users', async (request, reply) => {
  const users = await prisma.user.findMany()

  return reply.status(200).send({ users })
})

app
  .listen({
    port: PORT,
  })
  .then(() => console.log(`Server listening on port ${PORT}`))
