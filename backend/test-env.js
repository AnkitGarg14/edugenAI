require('dotenv').config();
console.log('CLIENT_ID_LENGTH:', process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.length : 0);
console.log('CLIENT_ID_RAW:', JSON.stringify(process.env.GOOGLE_CLIENT_ID));
