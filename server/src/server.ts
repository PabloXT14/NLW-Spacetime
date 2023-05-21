import 'dotenv/config'
import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { resolve } from 'node:path'

import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'
import { UploadRoutes } from './routes/upload'

const app = fastify()
const PORT = 3333

app.register(cors, {
  origin: '*',
})
app.register(jwt, {
  secret: 'nlwspacetime',
})
app.register(multipart)
app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
})

app.register(memoriesRoutes, {
  prefix: '/memories',
})
app.register(authRoutes)
app.register(UploadRoutes)

app
  .listen({
    port: PORT,
    host: '0.0.0.0',
  })
  .then(() => console.log(`Server listening on port ${PORT}`))
