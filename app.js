import express from 'express';
import cors from 'cors';
import appRoute from './src/routes/routes-index.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
const app = express();

app.use(cors());
app.use(express.json());

app.use('/', appRoute);

app.listen(3000, () => {
  console.log('Server Berjalan pada port : 3000');
});
