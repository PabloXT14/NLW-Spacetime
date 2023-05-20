import 'dotenv/config'
import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'

const app = fastify()
const PORT = 3333

app.register(cors, {
  origin: '*',
})
app.register(jwt, {
  secret: 'nlwspacetime',
})

app.register(memoriesRoutes, {
  prefix: '/memories',
})
app.register(authRoutes)

app
  .listen({
    port: PORT,
    host: '0.0.0.0',
  })
  .then(() => console.log(`Server listening on port ${PORT}`))
