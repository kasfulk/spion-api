import mJwt from 'express-jwt';

export const tokenCheck = (req, res, next) => {
    mJwt({
        secret: process.env.JWT_SECRET,
        algorithms: ['HS256'],
    })(req, res, next);
}