import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

dotenv.config({ path: '.env' });

AWS.config.update({
  accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
  secretAccessKey: process.env.SPACES_ACCESS_KEY,
});

const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT);
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
        const { username } = req.user;
        const extensionFile = file?.originalname.split('.').pop();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!allowedExtensions.includes(extensionFile)) { 
            return cb(new Error('Invalid file extension'), null);
        }
        cb(null, username + "_" + timestamp + "_" + file.originalname);
      },
      metadata: function (req, file, cb) {
        const timestamp = Date.now();
        const date = new Date(timestamp)
              .toISOString()
              .replace(/T/, ' ')
              .replace(/\..+/, '');
        cb(null, Object.assign({
            uploader: req.user.username,
            date: date,
          }, req.query));
      }
  }),
}).single('file');




export default {
    upload,
    s3,
}