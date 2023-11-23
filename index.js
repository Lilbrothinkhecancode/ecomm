import express from "express"
import prisma from "./src/utils/prisma.js"

const app = express()
const port = process.env.PORT || 8080

app.use(express.json())
app.get('/', async ( res) => {
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
    const newUser = await prisma.user.create({
      data: { name, email, password },
    })
  
    console.log(newUser)

    res.json(newUser)
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