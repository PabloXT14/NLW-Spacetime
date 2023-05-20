import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    await request.jwtVerify()
  })

  app.get('/', async (request, reply) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    const memoriesFormatted = memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'),
      }
    })

    return reply.status(200).send({ memories: memoriesFormatted })
  })

  app.get('/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    try {
      const { id } = paramsSchema.parse(request.params)

      const memory = await prisma.memory.findUniqueOrThrow({
        where: {
          id,
        },
      })

      if (!memory.isPublic && memory.userId !== request.user.sub) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      return reply.status(200).send({ memory })
    } catch (error) {
      console.log(error)
      if (error instanceof z.ZodError) {
        const { issues } = error
        return reply.status(400).send({ issues })
      }

      return reply.status(500).send({ error })
    }
  })

  app.post('/', async (request, reply) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    try {
      const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

      const memory = await prisma.memory.create({
        data: {
          content,
          coverUrl,
          isPublic,
          userId: request.user.sub,
        },
      })

      return reply.status(201).send({ memory })
    } catch (error) {
      console.log(error)

      if (error instanceof z.ZodError) {
        const { issues } = error
        return reply.status(400).send({ issues })
      }

      return reply.status(500).send({ error })
    }
  })

  app.put('/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      content: z.string().optional(),
      coverUrl: z.string().optional(),
      isPublic: z.coerce.boolean().default(false),
    })

    try {
      const { id } = paramsSchema.parse(request.params)
      const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

      let memory = await prisma.memory.findUniqueOrThrow({
        where: {
          id,
        },
      })

      if (memory.userId !== request.user.sub) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      memory = await prisma.memory.update({
        where: {
          id,
        },
        data: {
          content,
          coverUrl,
          isPublic,
        },
      })

      return reply.status(200).send({ memory })
    } catch (error) {
      console.log(error)

      if (error instanceof z.ZodError) {
        const { issues } = error
        return reply.status(400).send({ issues })
      }

      return reply.status(500).send({ error })
    }
  })

  app.delete('/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    try {
      const { id } = paramsSchema.parse(request.params)

      const memory = await prisma.memory.findUniqueOrThrow({
        where: {
          id,
        },
      })

      if (memory.userId !== request.user.sub) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      await prisma.memory.delete({
        where: {
          id,
        },
      })

      return reply.status(204).send()
    } catch (error) {
      console.log(error)
      if (error instanceof z.ZodError) {
        const { issues } = error
        return reply.status(400).send({ issues })
      }

      return reply.status(500).send({ error })
    }
  })
}
