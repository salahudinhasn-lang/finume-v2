import { google } from 'googleapis';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// Load .env manually if dotenv not working or to be safe
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const SCOPES = ['https://www.googleapis.com/auth/drive'];

async function generateToken() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error('Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env file.');
        return;
    }

    const oAuth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'https://developers.google.com/oauthplayground' // Use this as redirect URI
    );

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent' // Force consent to ensure we get a refresh token
    });

    console.log('\nAuthorize this app by visiting this url:\n');
    console.log(authUrl);
    console.log('\nAfter authorizing, you will be redirected to the OAuth Playground.');
    console.log('Copy the "Authorization code" from the Playground and paste it here.\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', async (code) => {
        rl.close();
        try {
            const { tokens } = await oAuth2Client.getToken(code);
            console.log('\nSuccessfully retrieved tokens!');

            if (tokens.refresh_token) {
                console.log('\nAdd this to your .env file:\n');
                console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
                console.log('\n(Preserve the existing GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)');
            } else {
                console.log('\nNo refresh token returned. Did you use an existing consent?');
                console.log('Try revoking access first or running with prompt: "consent" (already set).');
            }

        } catch (err) {
            console.error('Error retrieving access token:', err);
        }
    });
}

generateToken();
