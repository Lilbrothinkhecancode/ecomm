import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.development' })
import express from 'express'
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import prisma from "../utils/prisma.js"
import { validateUser } from "../validators/users.js"
import { filter } from "../utils/common.js"
import cors from 'cors'
import bodyParser from 'body-parser';

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const router = express.Router()

const app = express();

app.use(cors());
app.use(bodyParser.json());

router.post('/', async (req, res) => {
  const { passwordConfirm, ...data } = req.body

  const validationErrors = validateUser(data)

  if (Object.keys(validationErrors).length != 0) return res.status(400).send({
    error: validationErrors
  })


  if (data.password !== passwordConfirm) {

  }

  data.password = bcrypt.hashSync(data.password, 8);

  prisma.user.create({
    data
  }).then(user => {
    const msg = {
      to: user.email,
      from: 'ulyger23almaty@gmail.com',
      subject: 'Welcome to our platform',
      text: 'Thank you for signing up!',
      html: '<strong>Thank you for signing up!</strong>',
    }

    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })

    return res.json(filter(user, 'id', 'name', 'email'))

  }).catch(err => {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const formattedError = {}
      formattedError[`${err.meta.target[0]}`] = 'already taken'

      return res.status(500).send({
        error: formattedError
      })
    }
    throw err
  })
})
  
  export default router