/**
 * googleAuth.js
 *
 * Generates an OAuthClient to be used by an API service
 * Requires path to file that contains clientId/clientSecret and scopes
 */

const {google} = require('googleapis');
const fs = require('fs');

const inquirer = require('inquirer')

const debug = require('debug')('gcal:googleAuth')

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Generates an authorized OAuth2 client.
 * @param {object} keysObj Object with client_id, project_id, client_secret...
 * @param {array<string>} scopes The scopes for your oAuthClient
*/
async function generateOAuthClient(keysObj, scopes){
  let oAuth2Client

  try{
    //const {client_secret, client_id, redirect_uris} = keysObj.installed
    const {client_id, client_secret, javascript_origins} = keysObj.web
    debug('Secrets read!')
    // create oAuthClient using clientId and Secret
    oAuth2Client = new google.auth.OAuth2(client_id, client_secret, javascript_origins[0])
    google.options({auth: oAuth2Client});

    console.log("oAuth2Client_", oAuth2Client)

    // check if we have a valid token
    const tokenFile = fs.readFileSync(TOKEN_PATH)
    if(tokenFile !== undefined && tokenFile !== {}){
      debug('Token already exists and is not empty %s', tokenFile)

      oAuth2Client.setCredentials(JSON.parse(tokenFile))
    }else{
      debug('🤬🤬🤬 Token is empty!')
      throw new Error('Empty token')
    }
    return Promise.resolve(oAuth2Client)
  }catch(err){
    console.log('Token not found or empty, generating a new one 🤨')
    // get new token and set it to the oAuthClient.credentials
    console.log("oAuth2Client", oAuth2Client)
    oAuth2Client = await getAccessToken(oAuth2Client, scopes)

    return Promise.resolve(oAuth2Client)
  }

}

/**
 * Get and store access_token after prompting for user authorization
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {array<string>} scopes The scopes for your oAuthClient
*/
async function getAccessToken(oAuth2Client, scopes) {

  console.log("oAuth2Client", oAuth2Client)


  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  console.log('⚠️ Authorize this app by visiting this url:', authUrl);
  let question = [
    {
      type: 'input',
      name: 'code',
      message: 'Enter the code from that page here:'
    }
  ]
  const answer = await inquirer.prompt(question)
  console.log(`🤝 Ok, your access_code is ${answer['code']}`)
  // get new token in exchange of the auth code
  const response = await oAuth2Client.getToken(answer['code'])
  debug('Token received from Google %j', response.tokens)
  // save token in oAuth2Client
  oAuth2Client.setCredentials(response.tokens)
  // save token in disk
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(response.tokens))

  return Promise.resolve(oAuth2Client)

}

module.exports = {generateOAuthClient}



//
//
//
//
//
// // If modifying these scopes, delete token.json.
// //const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// const SCOPES = ['https://www.googleapis.com/auth/calendar']
// // The file token.json stores the user's access and refresh tokens, and is
// // created automatically when the authorization flow completes for the first
// // time.
// const TOKEN_PATH = 'token.json';
//
//
//
// /**
//  * Create an OAuth2 client with the given credentials, and then execute the
//  * given callback function.
//  * @param {Object} credentials The authorization client credentials.
//  * @param {function} callback The callback to call with the authorized client.
//  */
// function authorize(credentials, callback, res) {
//   const {client_secret, client_id, javascript_origins} = credentials.web;
//   const oAuth2Client = new google.auth.OAuth2(
//       client_id, client_secret, javascript_origins[0]);
//
//   // Check if we have previously stored a token.
//   fs.readFile(TOKEN_PATH, (err, token) => {
//     if (err) return getAccessToken(oAuth2Client, callback);
//     oAuth2Client.setCredentials(JSON.parse(token));
//     callback(oAuth2Client, res);
//   });
// }
//
// /**
//  * Get and store new token after prompting for user authorization, and then
//  * execute the given callback with the authorized OAuth2 client.
//  * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
//  * @param {getEventsCallback} callback The callback for the authorized client.
//  */
// function getAccessToken(oAuth2Client, callback) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
//   console.log('Authorize this app by visiting this url:', authUrl);
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question('Enter the code from that page here: ', (code) => {
//     rl.close();
//     oAuth2Client.getToken(code, (err, token) => {
//       if (err) return console.error('Error retrieving access token', err);
//       oAuth2Client.setCredentials(token);
//       // Store the token to disk for later program executions
//       fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//         if (err) return console.error(err);
//         console.log('Token stored to', TOKEN_PATH);
//       });
//       callback(oAuth2Client);
//     });
//   });
// }
