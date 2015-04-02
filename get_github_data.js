var request = require('request');
var Promise = require("bluebird");
var db = require('./lib/db');
var logerror = require('debug')('rdb:error');

var j = request.jar();

var cookie = request.cookie('user_session='+process.env.GITHUB_SESSION+';')
var baseUrl = 'http://github.com/';

j.setCookie(cookie, baseUrl);

var repos = ['pusher/pusher-js', 'pusher/pusher-http-java','pusher/pusher-http-go','pusher/pusher-http-php','pusher/pusher-http-ruby','pusher/pusher-http-python','pusher/pusher-http-node','pusher/pusher-websocket-ruby','pusher/pusher-python-rest','pusher/pusher-websocket-java','pusher/pusher-http-dotnet','pusher/pusher-swift-ws','pusher/pusher-angular','pusher/pusher-websocket-dotnet'];

for (var i = repos.length - 1; i >= 0; i--) {
  var repoPath = repos[i];
  getVisitorsStats(repoPath);
  getClonesStats(repoPath);
  
};


function getVisitorsStats (repoPath) {
  var completeUrl = baseUrl+repoPath+'/graphs/traffic-data';
  request({url: completeUrl, jar:j}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body).counts;
      
      cleanUpData(data, repoPath)
      .then(function(data) {
        var visitorsStats = data
        db.saveVisitorsStats(visitorsStats, function(err, saved) {
          if (err) logerror('[ERROR][%s][saveVisitorsStats] %s', err);
        });
      });
    }
  });
}

function getClonesStats (repoPath) {
  var completeUrl = baseUrl+repoPath+'/graphs/clone-activity-data';
  request({url: completeUrl, jar:j}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body).counts;
      
      cleanUpData(data, repoPath)
      .then(function(data) {
        var cloneStats = data
        db.saveCloneStats(cloneStats, function(err, saved) {
          if (err) logerror('[ERROR][%s][SaveCloneStats] %s', err);
        });
      });

    }
  });
}

function cleanUpData (data, repoPath) {
  return new Promise(function(resolve, reject) {
    
    for (var i = data.length - 1; i >= 0; i--) {
      var dataPoint = data[i];
      dataPoint['date'] = new Date(dataPoint['bucket']*1000);
      delete dataPoint['bucket'];
      dataPoint['repo_name'] = repoPath.split('/')[1];
      
    }
    resolve(data);
  });
}
