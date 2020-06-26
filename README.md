This is the source code for the [Queer Burners Directory](https://queerburnersdirectory.com), an online directory of Burning Man theme camps that are, broadly speaking, LBGTQ+ or allies.

Here are some notes to future developers that want to modify this project.

# Technologies used

The site is "serverless," more or less. Instead of having a web server running code, the site is implemented as a single page React app which pulls data from an API and pictures from AWS S3. The API is implemented using AWS Lambda functions. The data is stored in an AWS DynamoDB database. The React app itself is served by Vercel which treats it as a handful of static files.

Here is a more complete list of technologies, frameworks, and libraries that are used to build Queer Burners Directory, along with links to the documentation.

- All code is written in modern ECMAScript 6 (aka Javascript) and developed with Node and NPM.
- The [AWS Serverless Application Model](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) (SAM)
- The [React](https://reactjs.org/docs/getting-started.html) framework, in particular [Create React App](https://create-react-app.dev/)
- For CSS and styling, [React Bootstrap](https://react-bootstrap.github.io/getting-started/introduction/) based on [Bootstrap 4.5](https://getbootstrap.com/docs/4.5/getting-started/introduction/)
- Back end functions run on [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) -- they are all in node.js.
- Those functions are accessed through a REST API via the [AWS API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html).
- From the front end, we use the [axios](https://github.com/axios/axios) library to access the API.
- The database is stored in [Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html), a simple NoSQL database that stores JSON objects. We access DynamoDB through the JavaScript [DocumentClient](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html) library.
- DNS and web hosting for the static front end files is provided by [Vercel](https://vercel.com/docs/configuration#introduction/configuration-reference). Vercel detects commits to this github project and deploys them automatically.
- All user authentication comes through [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2/web-server).
- User-uploaded images are stored in [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html).
- Because users can upload very high resolution images, we also store a thumbnail that is 960 pixels wide using the [sharp](https://sharp.pixelplumbing.com/) library.
- We send email through [Amazon SES](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/Welcome.html) (Simple Email Service). Rather than talking to their library directory, we use [Nodemailer](https://nodemailer.com/about/) to construct and send the email message via SES.

# Some developer tricks

## Your editor

I use VS Code with the Prettier code formatter by Esben Petersen. I always format on save which means that this project's indention/formatting style is just whatever Prettier does, which is really good. Don't check in code or submit pull requests that are not formatted according to that style.

## The **web** directory

This is where you work on the front end and the react code.

**npm start** will start a local web server for testing. Whenever you edit and save files locally, your browser will refresh automatically with the latest version.

**npm start build** builds a build/ subdirectory which is what you deploy to the server (currently automatically deployed to vercel when you check in the changes).

## The **aws** directory

This is where the server-side code goes.

- **lambdasrc** contains the code for the lambda functions.

- **template.yaml** is the SAM configuration that defines every function and it's API gateway.

- The script ./local-sam.sh launches the API on your local machine, in a docker instance, assuming you've set up your local machine according to [these instructions](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install-mac.html). This allows you to test changes to the API or lambda functions without deploying those changes to AWS. If you are doing this local testing, don't forget to change the API endpoint in **web/definitions.js**

- The script ./deploy-sam.sh deploys any changes you have made to the lamdba functions (locally) up to AWS.

- **lambdalayer** contains definitions describing any shared libraries that you need to use on AWS that need to be available for the code in **lambdasrc**. They are deployed to an AWS Lambda Layer. If you **npm list** in there you can see what libraries are currently a part of the layer on the server.

  - To add another library and make it available on the server, go into this directory, then **npm install** your new library. The next time you run **deploy-sam.sh** it will get deployed as a new version of the lambda library to the server.

  - This will increment the version number of the library on the server. If you are debugging locally with docker and **local-sam.sh** as described earlier, you will still be seeing the old version of the layer which is not helpful, since the version number of the lambda library is hardcoded. So log onto AWS Lambda console and see what the new version number is, and then update that in the **local-sam.sh** script.
