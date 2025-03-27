import dotenv from 'dotenv';

dotenv.config();

const privateKey = process.env.PALMPAY_PRIVATE_KEY;

console.log(privateKey);
