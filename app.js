import express from "express"
import morgan from "morgan"
import userRouter from "./src/controllers/users.controllers.js"
import authRouter from "./src/controllers/auth.controllers.js"
import bodyParser from "body-parser"
import cors from 'cors'

const app = express();
app.use(morgan('combined'));

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

app.use('/users', userRouter)
app.use('/sign-in', authRouter)

export default app