import express from "express"
import prisma from "./src/utils/prisma.js"
import { Prisma, PrismaClient } from '@prisma/client'

const app = express()
const port = process.env.PORT || 8080

function filter(obj, ...keys) {
  return keys.reduce((a, c) => ({ ...a, [c]: obj[c]}), {})
}

app.use(express.json())
app.get('/', async (req, res) => {
  const allUsers = await prisma.user.findMany()
  res.json(allUsers)
})

app.get('/user/:id', async (req, res) => {
  const { id } = req.params
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
  })
  res.json(user)
})

app.post('/', async (req, res) => {
  const { name, email, password } = req.body
  try {
      const newUser = await prisma.user.create({
          data: { name, email, password },
      })

      console.log(newUser)

      const filteredUser = filter(newUser, 'id', 'name', 'email')
      res.json(filteredUser)
  } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          const formattedError = {}
          formattedError[`${err.meta.target[0]}`] = 'already taken'
          return res.status(500).send({
              error: formattedError
          }); 
      }
      throw err
  }
})

  app.put('/user/:id', async (req, res) => {
    const { id } = req.params
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: req.body,
    })
    
    res.json(user)
  })

app.listen(port, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT ${port}");
});