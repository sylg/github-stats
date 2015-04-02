// Converting to date object because c3 parse seems to choke here
for (var i = 0; i < visitorsStats.length; i++) {
  var data = visitorsStats[i];
  data['date'] = new Date(data['date']).getTime();
};

for (var i = 0; i < clonesStats.length; i++) {
  var data = clonesStats[i];
  data['date'] = new Date(data['date']).getTime();
};

$(document).ready(function () {
  var visitorsChart = c3.generate({
    bindto: '#visitorsChart',
    data: {
      json: visitorsStats,
      keys: {
        x: 'date',
        value: ['pusher-js', 'pusher-http-java','pusher-http-go','pusher-http-php','pusher-http-ruby','pusher-http-python','pusher-http-node','pusher-websocket-ruby','pusher-python-rest','pusher-websocket-java','pusher-http-dotnet','pusher-swift-ws','pusher-angular','pusher-websocket-dotnet']
      }
    },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%m-%d'
        }
      }
    }
  });

  var clonesChart = c3.generate({
    bindto: '#clonesChart',
    data: {
      json: clonesStats,
      keys: {
        x: 'date',
        value: ['pusher-js', 'pusher-http-java','pusher-http-go','pusher-http-php','pusher-http-ruby','pusher-http-python','pusher-http-node','pusher-websocket-ruby','pusher-python-rest','pusher-websocket-java','pusher-http-dotnet','pusher-swift-ws','pusher-angular','pusher-websocket-dotnet']
      }
    },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%m-%d'
        }
      }
    }
    
  });
});