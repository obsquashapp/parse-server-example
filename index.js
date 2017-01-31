// Example express application adding the parse-server module to expose Parse
// compatible API routes.
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
 verifyUserEmails: true,

  // if `verifyUserEmails` is `true` and
  //     if `emailVerifyTokenValidityDuration` is `undefined` then
  //        email verify token never expires
  //     else
  //        email verify token expires after `emailVerifyTokenValidityDuration`
  //
  // `emailVerifyTokenValidityDuration` defaults to `undefined`
  //
  // email verify token below expires in 2 hours (= 2 * 60 * 60 == 7200 seconds)
  emailVerifyTokenValidityDuration: 2 * 60 * 60, // in seconds (2 hours = 7200 seconds)

  // set preventLoginWithUnverifiedEmail to false to allow user to login without verifying their email
  // set preventLoginWithUnverifiedEmail to true to prevent user from login if their email is not verified
  preventLoginWithUnverifiedEmail: false, // defaults to false

  // The public URL of your app.
  // This will appear in the link that is used to verify email addresses and reset passwords.
  // Set the mount path as it is in serverURL
  publicServerURL: 'https://obsquash.herokuapp.com/parse',
  // Your apps name. This will appear in the subject and body of the emails that are sent.
  appName: 'OB Squash',
  emailAdapter: {
        module: "simple-parse-smtp-adapter",
        options: {
            fromAddress: 'obsquashapp@gmail.com',
            user: 'obsquashapp@gmail.com',
            password: '8terlich4us',
            host: 'smtp.gmail.com',
            isSSL: false, //True or false if you are using ssl 
            port: 587, //SSL port or another port 
            name: 'domain name', //  optional, used for identifying to the server  
            //Somtimes the user email is not in the 'email' field, the email is search first in 
            //email field, then in username field, if you have the user email in another field 
            //You can specify here 
            emailField: 'obsquashapp@gmail.com'
        }
    }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
