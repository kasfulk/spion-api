import express from 'express';
import cors from 'cors';
import appRoute from './src/routes/index.js';
import noAuthRoute from './src/routes/route-no-auth.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
const app = express();

app.use(cors());
app.use(express.json());

app.use('/no-auth', noAuthRoute);
app.use('/', appRoute);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('Server Berjalan pada port : ' + port);
});
