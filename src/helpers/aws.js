import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

dotenv.config({ path: '.env' });

AWS.config.update({
  accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
  secretAccessKey: process.env.SPACES_ACCESS_KEY,
});

const spacesEndpoint = new AWS.Endpoint('sgp1.digitaloceanspaces.com/spion-img');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'itopkal',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
        const timestamp = Date.now();
        cb(null, timestamp+ "_" +file.originalname);
    },
  }),
}).single('file');


export default {
    upload,
}