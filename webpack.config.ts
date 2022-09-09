import { EnvironmentPlugin } from 'webpack';
import { config } from 'dotenv';
import { resolve } from 'path';


config();

module.exports = {
  plugins: [
    new EnvironmentPlugin(['FIREBASE_API_DEV', 'FIREBASE_API_PROD'])
  ]
}
