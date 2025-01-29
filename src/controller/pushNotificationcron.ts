import cron from 'node-cron';

export const startCronJob = () => {
    console.log("Menyiapkan cron job...");

    // Contoh cron job yang berjalan setiap menit
    cron.schedule('* * * * *', () => {
        console.log('Cron job berjalan setiap menit: push notif!');
    });

    console.log("Cron job di-schedule");
};