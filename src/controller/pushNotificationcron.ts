import express from 'express';
import cron from 'node-cron';
import dotenv from 'dotenv';

// Memuat variabel lingkungan dari file .env
dotenv.config();

const app = express();
const PORT = process.env.APP_PORT || 3000;

console.log("APP_PORT:", process.env.APP_PORT); // Pastikan ini mencetak 5000

// Contoh cron job yang berjalan setiap menit
cron.schedule('* * * * *', () => {
    console.log('Cron job berjalan setiap menit: Push Notif!');
});

console.log("Cron job di-schedule"); // Tambahkan log di sini

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});