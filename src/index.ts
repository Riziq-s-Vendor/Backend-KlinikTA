import express from "express"
import cors from "cors"
import * as bodyParser from "body-parser"
import { AppDataSource } from "./data-source"
import router from "./routes/index"
import path = require("path")
import cron from 'node-cron';
import { startCronJob } from "./controller/pushNotificationcron"
import { Server } from 'socket.io';
import http from 'http';


const app = express()
const server = http.createServer(app);
const io = new Server(server);


AppDataSource.initialize().then(async () => {


    app.use(cors({
        credentials: true,
        origin: ['http://localhost:3000', 'http://localhost:3001']
}))
    app.use(bodyParser.json({limit: '1000mb'}))
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/public', express.static(path.join(__dirname, '../public')));
    app.use('/', router)
    app.get("/", (req, res) => { res.send("API Running") })

    
    io.on('connection', (socket) => {
        console.log('A user connected');
    
        // Emit event to the client
        socket.emit('message', 'Welcome to the WebSocket server!');
    
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    
    
    // startCronJob();


    app.listen(process.env.APP_PORT, ()=> {console.log(`Server running at port ${process.env.APP_PORT}`)})



}).catch(error => console.log(error))

export {io}




