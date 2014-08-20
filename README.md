
LaPolla is a game to predict the scores of the FIFA world cup built with Node.js, Express and MongoDB.

# Installation

```bash
$ git clone https://github.com/rubenesc/lapolla.git
$ cd lapolla
$ npm install
$ cp config/config.js.example config/config.js
$ cp config/seed/initialize.js.example config/seed/initialize.js
```

Edit config/config.js with your preferences and configuration.

Edit config/seed/initialize.js with the desired info of your admin
user. The admin user will be able to enter the final match scores of every game.

# Startup

To start the web server:

```bash
$ ./bin/devserver
```

# Initialize

The first time the server started it needs initialize
the data necessary to run the app. This a one time process.

```
 http://localhost:3000/setup
```

Once this is done, you can login with your admin user specified in config/seed/initialize.js
