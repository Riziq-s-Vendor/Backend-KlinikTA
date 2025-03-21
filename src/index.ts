import express from "express"
import cors from "cors"
import * as bodyParser from "body-parser"
import { AppDataSource } from "./data-source"
import router from "./routes/index"
import path = require("path")
import { Server } from 'socket.io';
import http from 'http';


const app = express()
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],

        //for staging
        // origin: ['http://localhost:3000', 'http://localhost:3001','https://puskesmas-ngasem-fe.vercel.app/'],
        
        methods: ['GET']
    }
});


AppDataSource.initialize().then(async () => {


    app.use(cors({
        credentials: true,
        origin: ['http://localhost:3000', 'http://localhost:3001']
        //for staging
        // origin: ['http://localhost:3000', 'http://localhost:3001','https://puskesmas-ngasem-fe.vercel.app/','https://api.puskesmas-ngasem.cloud']

}))
    app.use(bodyParser.json({limit: '1000mb'}))
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/public', express.static(path.join(__dirname, '../public')));
    app.use('/', router)
    app.get("/", (req, res) => { res.send("API Running") })

    
    io.on('connection', (socket) => {
        console.log(`⚡ User connected: ${socket.id}`);
    
        // Emit event to the client
        socket.emit('message', 'Welcome to the WebSocket server!');
    
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });

    



    server.listen(process.env.APP_PORT || 5000, () => {
        console.log(`🚀 Server running at port ${process.env.APP_PORT || 5000}`);
    });


}).catch(error => console.log(error))

export {io}




