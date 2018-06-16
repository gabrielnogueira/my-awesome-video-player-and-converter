# My Awesome Video Player and Converter!

This is a practical activity proposed by [SambaTech](https://www.sambatech.com.br) as a challenge in they selection process.

The challenge is create an app that is possible upload a video it's not compatible with web standards, and the app should convert this video to web standard, put this video in a playlist with the status of conversion, and when the user clicks on the video, the app should play this video.

The tech stack premisses of this challenge are:

  * NodeJS, Java or Python as Backend;
  * ReactJS or Vue.JS as FrontEnd;

Any framework/libs of this techs are permitted.

I choose:

  * NodeJS with Loopback as Backend;
  * ReactJS as FrontEnd;

## How this works?
### App usage
1. User upload a video that is not compatible with the web standards;
2. User awaits conversion process. User can see a status of the videos uploaded in a list;
3. User can play videos that already converted;

### Simplified technical pipeline flow
1. App exposes a Restful api to maintain the videos;
2. When user submit a video upload, app save this video on a storage; //video status: ENVIANDO
3. When the video has uploaded, App send it to a conversion service; //video status: ENCODANDO
4. When the conversion process has completed, video can be played; //video status: FINALIZADO

## TODO list
### Backend
  [x] Create the server project;
  [ ] Create the Rest services;
  [ ] Create upload process;
  [ ] Create storage process;
  [ ] Create conversion process;
  [ ] Create the Automated Tests;

### Frontend
  [x] Create the client project;
  [ ] Create the Responsive UI;
  [ ] Create the Routing;
  [ ] Integrate with Backend;
  [ ] Create the Automated Tests;

## Getting Started with this project
  Just clone this repo, install global dependencies if you don't have them and then start the server:

```bash
$ git clone https://github.com/gabrielnogueira/my-awesome-video-player-and-converter.git
$ npm install -g nodemon
$ cd my-awesome-video-player-and-converter
$ yarn install
$ yarn run start-dev
```

## How i can generate this project from scratch?

In case you wanna do it yourself, here's how:

```bash
$ npm install -g loopback-cli
$ npm install -g create-react-app
$ npm install -g nodemon
```

Once you've installed the CLI, let's generate the app:

```
$ lb my-awesome-video-player-and-converter
? What's the name of your application? my-awesome-video-player-and-converter
? Enter name of the directory to contain the project: my-awesome-video-player-and-converter
? Which version of LoopBack would you like to use? 3.x (current)
? What kind of application do you have in mind? empty-server (An empty Loopback API, without any configured models or datasources)
```

After you've answered all of the questions, you just have to simply change directories into the project to create a loopback model.

The CLI we've install will help with that, just answer the questions how I did below:

```
$ cd my-awesome-video-player-and-converter
$ lb model Video
? Enter the model name: Video
? Select model's base class: Model
? Expose note via the REST API? Yes
? Custom plural form (used to build REST URL): Videos
? Common model or server only? server
Let's add some note properties now.

Enter an empty property name when done.
? Property name: name
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]:

Let's add another note property.
Enter an empty property name when done.
? Property name: status
   invoke   loopback:property
? Property type: string
? Required? Yes
? Default value[leave blank for none]: ENVIANDO

Let's add another note property.
Enter an empty property name when done.
? Property name:
```

Now, lets make SPA supporting mods to our Loopback instance.

Open the server/config.json file and add indexFile key to the root of the config like so:

```bash
{
  ...
  "indexFile": "client/build/index.html",
  ...
}
```

Next, edit the server/server.js file:

Include after line 4:

```bash
  var path = require('path');
```

Include at the first line of the app.start function:

```bash
  var staticFolder = path.dirname(
    path.resolve(__dirname, '..', app.get('indexFile'))
  );
  app.use(loopback.static(staticFolder));
```

Next, edit the server/boot/root.js file:

Include after line 1:

```bash
  var path = require('path');
```

Change the content of module.exports function to:

```bash
  var router = server.loopback.Router();
  // Install a `/status` route that returns server status
  router.get('/status', server.loopback.status());
 
  router.get('/', function(req, res) {
    var indexFile = path.resolve(__dirname, '../..', server.get('indexFile'));
    res.sendFile(indexFile);
  });
  server.use(router);
```

Next, to run backend and frontend in parallel:

```bash
  $ yarn add concurrently
```

Edit package.json, and change the "scripts" to:

```bash
  "scripts": {
    "lint": "eslint .",
    "prestart": "npm run --prefix client build",
    "start": "node .",
    "start-dev": "concurrently \"nodemon .\" \"npm start --prefix client\"",
    "postinstall": "yarn --cwd client install",
    "posttest": "npm run lint && nsp check"
  },
```

Explaining the key scripts:

  * **prestart**: make sure we have a client folder to serve as static.
  * **start-dev**: runs both our back-end and frontend dev servers at the same time
  * **postinstall**: run the install script on frontend after install the backend

And now the backend is set!

Now lets create the frontend:

```bash
$ rm client/README.md
$ create-react-app client/
```

After created, we have to change the default port to avoid conflict with the backend.

To do so, we need to add a client/.env file with this content:


    PORT=3001


And its it!

Run

```bash
  $ yarn run start-dev
```

and enjoy!

## Extra tasks to do in Future (that are not included in the challenge, but it's cool to do ;D )

  [ ] Include first time user guide;
  [ ] Dockerize this;
