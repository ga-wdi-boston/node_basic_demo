'use strict';

var util = require('util');

var movieCount = 0;

var Movie = function(title, rating, year, length) {
  this.title = title;
  this.rating = rating;
  this.year = year;
  this.length = length;
  movieCount += 1;
  this.id = movieCount;
};

Movie.render = function(format) {
  var body = '';
  allMovies.forEach(function(movie) {
    body += movie.render(format);
  });
  return body;
};

Movie.prototype.render = function(format) {
  var body;
  if (format === 'html') {
    body = '<div class="movie" data-id="' + this.id + '"><dl>';
    body += '<dt>Title</dt><dd>' + this.title + '</dd>';
    body += '<dt>Rating</dt><dd>' + this.rating + '</dd>';
    body += '<dt>Year</dt><dd>' + this.year + '</dd>';
    body += '<dt>Length</dt><dd>' + this.length + '</dd>';
    body += '</dl></div>';
  }else if (format === 'json') {
    body = JSON.stringify(this);
  }

  return body;
};

// default set of movies
var allMovies = [
  new Movie('StarWars', 'G', 1977, 134),
  new Movie('Mad Max', 'PG-13', 2015, 127),
  new Movie('BridesMaids', 'R', 2011, 115),
  new Movie('Thor', 'PG-13', 2011, 145)
];

Movie.all = function() {
  return allMovies;
};

Movie.find = function(id) {
  var foundMovies = Movie.all().filter(function(value, index, array) {
    return value.id === Number(id);
  });
  return foundMovies[0];
};

Movie.create = function(title, rating, year, length) {
  var newMovie = new Movie(title, rating, year, length);
  allMovies.push(newMovie);
};

module.exports = Movie;
