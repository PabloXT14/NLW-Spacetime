import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const memories = await prisma.memory.findMany({
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
    const getMemoryParamsSchema = z.object({
      id: z.string().uuid(),
    })

    try {
      const { id } = getMemoryParamsSchema.parse(request.params)

      const memory = await prisma.memory.findUniqueOrThrow({
        where: {
          id,
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

  app.post('/', async (request, reply) => {
    const createMemoryBodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const userIdExample = 'df0f5a5f-3640-4915-b10e-29561ee7ce49'

    try {
      const { content, coverUrl, isPublic } = createMemoryBodySchema.parse(
        request.body,
      )

      const memory = await prisma.memory.create({
        data: {
          content,
          coverUrl,
          isPublic,
          userId: userIdExample,
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
    const updateMemoryParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const updateMemoryBodySchema = z.object({
      content: z.string().optional(),
      coverUrl: z.string().optional(),
      isPublic: z.coerce.boolean().default(false),
    })

    try {
      const { id } = updateMemoryParamsSchema.parse(request.params)
      const { content, coverUrl, isPublic } = updateMemoryBodySchema.parse(
        request.body,
      )

      const memory = await prisma.memory.update({
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
    const getMemoryParamsSchema = z.object({
      id: z.string().uuid(),
    })

    try {
      const { id } = getMemoryParamsSchema.parse(request.params)

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
