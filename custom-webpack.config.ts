import { EnvironmentPlugin } from 'webpack';
import { config } from 'dotenv';

config();

module.exports = {
  plugins: [
    new EnvironmentPlugin(['FIREBASE_API_DEV', 'FIREBASE_API_PROD'])
  ]
}
