var r = require('rethinkdb');
var logdebug = require('debug')('rdb:debug');
var logerror = require('debug')('rdb:error');

var dbConfig = {
  host: process.env.RDB_HOST || 'localhost',
  port: parseInt(process.env.RDB_PORT) || 28015,
  db  : 'github_stats',
  tables: ['clones', 'visitors']
};


module.exports.setup = function() {
  r.connect({host: dbConfig.host, port: dbConfig.port }, function (err, connection) {
    if (err) throw new Error(err);
    r.dbCreate(dbConfig.db).run(connection, function(err, result) {
      if(err) {
        logdebug("[DEBUG] RethinkDB database '%s' already exists (%s:%s)\n%s", dbConfig.db, err.name, err.msg, err.message);
      }
      else {
        logdebug("[INFO ] RethinkDB database '%s' created", dbConfig.db);
      }

      for(var tbl in dbConfig.tables) {
        (function (tableIndex) {
          var tableName = dbConfig.tables[tableIndex];
          r.db(dbConfig.db).tableCreate(tableName).run(connection, function(err, result) {
            if(err) {
              logdebug("[DEBUG] RethinkDB table '%s' already exists (%s:%s)\n%s", tableName, err.name, err.msg, err.message);
            }
            else {
              r.db(dbConfig.db).table(tableName).indexCreate('date').run(conn, function(results) {
                logdebug("[INFO ] RethinkDB table '%s' created", tableName);
              });
            }
          });
        })(tbl);
      }
    });
  });
};


module.exports.saveCloneStats = function (cloneStats, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig.db).table('clones').insert(cloneStats, {conflict: 'replace'}).run(connection, function(err, result) {
      if(err) {
        logerror("[ERROR][%s][SaveCloneStats] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        callback(null, true);
      }
      connection.close();
    });
  });
}

module.exports.saveVisitorsStats = function (visitorsStats, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig.db).table('visitors').insert(visitorsStats, {conflict: 'replace'}).run(connection, function(err, result) {
      if(err) {
        logerror("[ERROR][%s][SaveVisitorsStats] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        callback(null, true);
      }
      connection.close();
    });
  });
}

module.exports.getVisitorsStats = function(callback) {
  onConnect(function(err, connection) {
    r.db(dbConfig.db).table("visitors").orderBy({index: r.desc('date')}).group('date').map(function(event) {
  return r.object(event('repo_name'), event('unique'));
}).reduce(function(a, b) {
  return a.merge(b.keys().map(function(key) {
    return [key, a(key).default(0).add(b(key))];}).coerceTo('object'));
}).ungroup().map(function(row){
  return r.expr({date: row('group')}).merge(row('reduction'));
})
    .run(connection, function(err, result) {
      if (err) {
        logerror("[ERROR][%s][getVisitorsStats] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        callback(err, result);
      }
      connection.close();
    });
  });
};


module.exports.getClonesStats = function(callback) {
  onConnect(function(err, connection) {
    r.db(dbConfig.db).table("clones").orderBy({index: r.desc('date')}).group('date').map(function(event) {
  return r.object(event('repo_name'), event('unique'));
}).reduce(function(a, b) {
  return a.merge(b.keys().map(function(key) {
    return [key, a(key).default(0).add(b(key))];}).coerceTo('object'));
}).ungroup().map(function(row){
  return r.expr({date: row('group')}).merge(row('reduction'));
})
    .run(connection, function(err, result) {
      if (err) {
        logerror("[ERROR][%s][getClonesStats] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        callback(err, result);
      }
      connection.close();
    });
  });
};



function onConnect(callback) {
  r.connect({host: dbConfig.host, port: dbConfig.port }, function(err, connection) {
    if (err) throw new Error(err);
    connection['_id'] = Math.floor(Math.random()*10001);
    callback(err, connection);
  });
}

