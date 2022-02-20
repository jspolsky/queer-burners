export const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL
  ? process.env.NEXT_PUBLIC_FRONTEND_URL
  : process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";
export const defaultYear = new Date().getFullYear();
export const api =
  "https://wwe0vuykb9.execute-api.us-east-2.amazonaws.com/Prod";
// "http://localhost:3001"; // for local docker testing ~!
export const s3images =
  "https://s3.us-east-2.amazonaws.com/queerburnersdirectory.com-images";
export const googleClientId =
  "1091094241484-ve5hbpa496m6d1k21m8r5ni16kvrkifi.apps.googleusercontent.com";
export const oauthEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
export const apiKeyTinyMCE = "zdh08645sds1nt23ip19o4wcxn97mqppnuqeid6wfu3kpjz9";
