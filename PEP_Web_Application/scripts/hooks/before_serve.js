'use strict';

module.exports = function (configObj) {
  return new Promise((resolve, reject) => {
    console.log('Running before_serve hook.');
    
    // Import express and http modules
    const express = require('express');
    const http = require('http');

    // Create express app
    const app = express();

    // Serve static files from 'js' folder
    app.use('/js', express.static('js'));

    // Create server with express app
    const serverOptions = {};
    const server = http.createServer(serverOptions, app);

    // Pass back custom http, express app, and server
    configObj['http'] = http;
    configObj['express'] = app;
    configObj['serverOptions'] = serverOptions;
    configObj['server'] = server;

    resolve(configObj);
  });
};
