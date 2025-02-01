import express from "express"
import cors from "cors"
import * as bodyParser from "body-parser"
import { AppDataSource } from "./data-source"
import router from "./routes/index"
import path = require("path")
import cron from 'node-cron';
import { startCronJob } from "./controller/pushNotificationcron"


AppDataSource.initialize().then(async () => {

    const app = express()
    app.use(cors({
        credentials: true,
        origin: ['http://localhost:3000', 'http://localhost:3001']
}))
    app.use(bodyParser.json({limit: '1000mb'}))
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/public', express.static(path.join(__dirname, '../public')));
    app.use('/', router)
    app.get("/", (req, res) => { res.send("API Running") })
    
    startCronJob();


    app.listen(process.env.APP_PORT, ()=> {console.log(`Server running at port ${process.env.APP_PORT}`)})

}).catch(error => console.log(error))
