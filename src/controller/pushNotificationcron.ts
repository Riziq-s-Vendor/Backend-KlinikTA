import cron from 'node-cron';
import { AppDataSource } from "../data-source"; // Adjust the path as necessary
import { PushNotification } from "../model/pushNotification"; // Replace with your actual entity
import { response } from 'express';
const { successResponse, errorResponse, validationResponse } = require('../utils/response')

const pushNotificationRepository = AppDataSource.getRepository(PushNotification);


export const startCronJob = () => {
    // Schedule the cron job to run every minute
    cron.schedule('* * * * *', async () => {
        try {
            // Create a new instance of your entity
            const newData = new PushNotification();
            newData.property1 = 'value1'; // Set properties as needed
            newData.property2 = 'value2';

            // Save the new data to the database
            await pushNotificationRepository.save(newData)
            console.log(newData)

            console.log('Data pushed to database successfully');

        } catch (error) {
            console.error('Error pushing data to database:', error);
        }
    });
};
