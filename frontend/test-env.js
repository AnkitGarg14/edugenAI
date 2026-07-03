import { loadEnv } from 'vite';
const env = loadEnv('', process.cwd(), '');
console.log('FRONTEND_CLIENT_ID_LENGTH:', env.VITE_GOOGLE_CLIENT_ID ? env.VITE_GOOGLE_CLIENT_ID.length : 0);
console.log('FRONTEND_CLIENT_ID_RAW:', JSON.stringify(env.VITE_GOOGLE_CLIENT_ID));
