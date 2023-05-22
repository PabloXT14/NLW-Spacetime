import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { extname, resolve } from 'node:path'
import { createWriteStream, unlinkSync } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

const pump = promisify(pipeline)

export async function UploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (request, reply) => {
    const upload = await request.file({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB in bytes
      },
    })

    if (!upload) {
      return reply.status(400).send({ error: 'File not found' })
    }

    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)

    if (!isValidFileFormat) {
      return reply.status(400).send({ error: 'Invalid file format' })
    }

    const fileId = randomUUID()
    const extension = extname(upload.filename)

    const fileName = fileId.concat(extension)

    const writeStream = createWriteStream(
      resolve(__dirname, '../../uploads', fileName),
    )

    await pump(upload.file, writeStream)

    if (upload?.file.truncated) {
      unlinkSync(resolve(__dirname, '../../uploads', fileName))
      reply.status(400).send({ error: 'File too large' })
    }

    const fullUrl = request.protocol.concat('://').concat(request.hostname)
    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()

    return { fileUrl }
  })
}
