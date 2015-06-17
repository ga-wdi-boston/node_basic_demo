"use strict";

var http = require('http');
var url = require('url');
var util = require('util');
var Movie = require('./lib/movie');

// GET /movies
// curl -i -H "Accept: application/json" http://localhost:4000/movies
// curl -i -H "Accept: text/html" http://localhost:4000/movies


// GET /movies/3
// curl -i -H "Accept: application/json" http://localhost:4000/movies/3
// curl -i -H "Accept: text/html" http://localhost:4000/movies/3

// POST /movies
// curl -i -H "Accept: application/json" -X POST -d '{"title":"Jurassic Park","rating": "PG-13", "year": 1998, "length": 152}' http://localhost:4000/movies
// TODO: Accept application/x-www-form-urlencoded for form submissions

// List of movies, Movie is the resource
var server = http.createServer(requestHandler);

function requestHandler(request, response){
  // Lot's of info in the request object!
  // console.log("request: is \n",util.inspect(request));
  //process.exit(1);

  var pathname = url.parse(request.url, true).pathname,
      contentType = request.headers.accept,
      format,
      buffer = '',
      jsonBody,
      body,
      movieID,
      movie;

  // Ouput data should be returned as strings.
  request.setEncoding('utf8');

  // Get the HTTP Request format, (JSON, HTML,...)
  format = getFormat(request);

  console.log('pathname is ', pathname);
  console.log('request.method is ', request.method);
  console.log('format is ', format);


  if(pathname === '/movies' && request.method === 'GET'){
    // GET all the movies
    console.log("GET /movies");

    body = Movie.render(format);
    sendResponse(response, 200, body, contentType);

  }else if(pathname.match(/\/movies\/\d+/) && request.method === 'GET'){
    // GET a specific movie
    console.log("GET /movies/:id");

    movieID = getID(pathname);
    movie =  Movie.find(movieID);

    if(movie){
      // found a movie with the ID
      body = movie.render(format);
      sendResponse(response, 200, body, contentType);
    }else{
      // No movie with for this ID.
      body = 'Movie with an id = ' + movieID + " not found";
      sendResponse(response, 404, body, contentType);
    }
  }else if(pathname === '/movies' && request.method === 'POST'){
    console.log("POST /movies");

    // Accumulate the body of the the HTTP Request into the buffer.
    // Until the stream sends and 'end' event.
    request.on('data', function(movieData){
      buffer += movieData;
    });

    // Stream has send the 'end' event.
    request.on('end', function(){
      // process the body of the POST to create a movie.

      if(format === 'json'){
        // If HTTP POST was JSON formatted data.
        jsonBody = JSON.parse(buffer);

        // Create a Movie
        Movie.create(jsonBody.title, jsonBody.rating, jsonBody.year, jsonBody.length);

        // Create the response body
        body = JSON.stringify({result: "Created Movie '" + jsonBody.title + "' "});
        sendResponse(response, 201, body, contentType);
      } else if(format === 'form'){
        // TODO: Accept application/x-www-form-urlencoded for forms

      }else{
        body = JSON.stringify({errMsg: "Failed to create movie",
                               sentData: buffer,
                               format: format
                              });
        sendResponse(response, 400, body, contentType);
      }
    });
  } else {
    // Unknown Route
    body = "Unknown Route";
    sendResponse(response, 404, body, contentType);
  }

};

// Send the HTTP Response
function sendResponse(response, status, body, contentType){
  console.log("Status =", status);
  console.log("Body = ", body);

  response.writeHead(status, {'Content-Type': contentType});
  response.end(body);
};

// Get the format of the HTTP Request, (JSON, HTML,...)
// default will be HTML
function getFormat(request){
  var formatArray = request.headers.accept.split('/'),
      format = formatArray[formatArray.length - 1];

  console.log("Accept:", request.headers.accept);

  if(format === 'json'){
    // Default format is html
    format = 'json';
  }else if (format === 'x-www-form-urlencoded'){
    format = 'form';
  }else{
    format = 'html';
  }
  return format;
};

// Get the ID from the pathname
// /movies/3
function getID(pathName){
  var pathArray = pathName.split('/');
  return Number(pathArray[pathArray.length - 1]);
};

var PORT = 4000;

// Start a server on port 4000
server.listen(PORT, function() {
  console.log("Movie Server is up and listening on port:", PORT);
});
