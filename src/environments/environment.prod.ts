export const environment = {
  production: true,
  firebase: JSON.parse(process.env.FIREBASE_API_PROD as string)
};
