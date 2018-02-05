'use strict';

const express = require('express');
const app = express();
var os = require('os');
var ifaces = os.networkInterfaces();

var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 

app.get('/ping', (req, res) => {
    var ip = getIp();
    res.send('ping from ' + ip)
});

app.get('/pongs', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("pongs").find({}).toArray(function(err, result) {
          if (err) throw err;
          var ip = getIp();
          var response = {
              location: 'ping from ' + ip,
              pongs: result
          };
          res.send(response);
          db.close();
        });
    });
});

app.post('/pongs', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        var pong = { first_name: req.body.first_name, family_name: req.body.family_name };
        dbo.collection("pongs").insertOne(pong, function(err, res) {
          if (err) throw err;
          db.close();
          res.sendStatus(200);
        });
      });
});

app.listen(3000, () => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.createCollection("pongs", function(err, res) {
          if (err) throw err;
          db.close();
        });
    });
});

var getIp = () => { 
    var ip = "127.0.0.1";
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                return;
            }
            if (alias == 0) {
                ip = iface.address;
            }
            ++alias;
        });
    });
    return ip;
}