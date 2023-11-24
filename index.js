import express from "express"
import prisma from "./src/utils/prisma.js"
import { Prisma, PrismaClient } from '@prisma/client'
import cors from 'cors'
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 8080

function filter(obj, ...keys) {
  return keys.reduce((a, c) => ({ ...a, [c]: obj[c]}), {})
}

function validateUser(input) {
  const validationErrors = {}

  if (!input || !('name' in input) || !input['name'] || input['name'].length == 0) {
    validationErrors['name'] = 'cannot be blank'
  }

  if (!input?.email || input.email.length === 0) {
    validationErrors.email = 'cannot be blank';
  }
  
  if (!input?.password || input.password.length === 0) {
    validationErrors.password = 'cannot be blank';
  }
  
  if (input?.password && input.password.length < 8) {
    validationErrors.password = 'should be at least 8 characters';
  }
  
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (input?.email && !emailRegex.test(input.email)) {
    validationErrors.email = 'is invalid';
  }

  return validationErrors
}

app.use(cors());
app.use(bodyParser.json());

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
  const validationErrors = validateUser({ name, email, password })
  if (Object.keys(validationErrors).length != 0) return res.status(400).send({
    error: validationErrors
  })
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