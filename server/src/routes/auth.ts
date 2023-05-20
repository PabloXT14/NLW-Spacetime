import axios from 'axios'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const bodySchema = z.object({
      code: z.string(),
    })

    try {
      const { code } = bodySchema.parse(request.body)

      const accessTokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        null, // body
        {
          params: {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
          },
          headers: {
            Accept: 'application/json',
          },
        },
      )

      const { access_token } = accessTokenResponse.data

      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })

      const userSchema = z.object({
        id: z.number(),
        login: z.string(),
        name: z.string(),
        avatar_url: z.string().url(),
      })

      const userInfo = userSchema.parse(userResponse.data)

      let user = await prisma.user.findUnique({
        where: {
          githubId: userInfo.id,
        },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            githubId: userInfo.id,
            name: userInfo.name,
            avatarUrl: userInfo.avatar_url,
            login: userInfo.login,
          },
        })
      }

      const token = app.jwt.sign(
        {
          // informações que desejamos guardar (que serão publicas)
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        {
          // configurando a chave (secreto)
          sub: user.id, // informação única de quem pertencerá o token
          expiresIn: '7 days',
        },
      )

      return reply.status(200).send({
        token,
      })
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
