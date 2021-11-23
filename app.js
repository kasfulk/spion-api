import express from 'express';
import cors from 'cors';
import appRoute from './src/routes/index.js';
import noAuthRoute from './src/routes/route-no-auth.js';
import dotenv from 'dotenv';
import mJwt from 'express-jwt';

dotenv.config({ path: '.env' });
const app = express();
const jwtProtector = mJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
})

app.use(cors());
app.use(express.json());

app.use('/no-auth',noAuthRoute);
app.use('/',jwtProtector,appRoute);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('Server Berjalan pada port : ' + port);
});
