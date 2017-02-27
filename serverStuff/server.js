var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var INSTRUCTOR_COLLECTION = "instructors";

// Parse x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Parse json
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect('mongodb://ggcrmp:ggcrmpdb2017@ds163679.mlab.com:63679/ggcrmp', function (err, database) 
{
  if (err) 
  {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// Generic error handler
function handleError(res, reason, message, code) 
{
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

app.post("/", function(req, res) 
{
  var newInstructor = req.body;
  if (!req.body) 
  {
    handleError(res, "NO DATA", "NO DATA", 400);
  }
  else
  {
    db.collection(INSTRUCTOR_COLLECTION).find({}).toArray(function(err, docs) 
    {
      if (err) 
      {
        handleError(res, err.message, "Failed to get contacts.");
      }
      else
      {
        docs.forEach(function (doc) 
        {
          console.log("ENTRY FOUND");
        });
        console.log("READY");
      }
    });
    
    res.setHeader('Content-Type', 'text/plain');
    res.write('Message contents:\n');
    res.end(JSON.stringify(req.body));
  }
});