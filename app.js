import express from "express"
import prisma from "./src/utils/prisma.js"
import { Prisma, PrismaClient } from '@prisma/client'
import cors from 'cors'
import bodyParser from 'body-parser';
import bcrypt from "bcryptjs"
import { signAccessToken } from "./src/utils/jwt.js"

const app = express();


app.use(cors());
app.use(bodyParser.json());
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


app.get('/', async (req, res) => {
  const allUsers = await prisma.user.findMany()
  res.json(allUsers)
})

function validateLogin(input) {
  const validationErrors = {}

  const email = input ? input['email'] : null;
  const password = input ? input['password'] : null;

  if (!email || email.length == 0) {
    validationErrors['email'] = 'cannot be blank';
  }

  if (!password || password.length == 0) {
    validationErrors['password'] = 'cannot be blank';
  }
  
  if (email && !email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    validationErrors['email'] = 'is invalid';
  }

  return validationErrors
}
app.get('/user/:id', async (req, res) => {
  const { id } = req.params
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
  })
  res.json(user)
})

app.post('/authenticate', async (req, res) => {
  const { identity: name, password } = req.body;

  const User = await prisma.User.findUnique({
    where: { name },
  });

  if (!User) {
    return res.status(400).send({ error: 'User not found' });
  }

  const passwordIsValid = bcrypt.compareSync(password, User.password);

  if (!passwordIsValid) {
    return res.status(400).send({ error: 'Password is incorrect' });
  }

  res.send({ success: true });
});

app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
const validationErrors = validateUser({ name, email, password })
  if (Object.keys(validationErrors).length != 0) return res.status(400).send({
    error: validationErrors
  })
  try {
      const newUser = await prisma.user.create({
        data: { name, email, password: hashedPassword },
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

  app.post('/sign-in', async (req, res) => {
    const { email, password } = req.body;
  
    const validationErrors = validateLogin({ email, password })
  
    if (Object.keys(validationErrors).length != 0) return res.status(400).send({
      error: validationErrors
    })
  
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    })
  
    if (!user) return res.status(401).send({
      error: 'Email address or password not valid'
    })
  
    const checkPassword = bcrypt.compareSync(password, user.password)
    if (!checkPassword) return res.status(401).send({
      error: 'Email address or password not valid'
    })
  
    const userFiltered = filter(user, 'id', 'name', 'email')
    const accessToken = await signAccessToken(userFiltered)
    return res.json({ accessToken })
  })

  export default app