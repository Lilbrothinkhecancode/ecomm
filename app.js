import express from "express"
import userRouter from "./src/controllers/users.controllers.js"
import authRouter from "./src/controllers/auth.controllers.js"
import bodyParser from "body-parser"
import cors from 'cors'
const app = express()


app.use(cors());
app.use(bodyParser.json());
app.use(express.json())

app.use('/users', userRouter)
app.use('/sign-in', authRouter)

export default app