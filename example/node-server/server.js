var express         = require('express'),
    app             = express(),
    fileSystem      = require('fs'),
    server          = require('http').createServer(app).listen(8888),
    promisedIo      = require('promised-io/promise'),
    Deferred        = promisedIo.Deferred;

// Configuration.
app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
});

app.all('*', function(request, response, next) {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-File-Type, X-File-Name, X-File-Size');
    response.header('Access-Control-Allow-Methods', 'POST');
    next();
});

// Responsible for the call to OPTIONS.
app.options('/upload', function(request, response) {
    response.send(200);
});

// Responsible for handling the file upload.
app.post('/upload', function(request, response) {

    var files       = request.files,
        numFiles    = files.length,
        promises    = [];

    var uploadFile = function(file) {

        var deferred = new Deferred();

        fileSystem.readFile(file.path, function (error, data) {
            var filePath = __dirname + '/uploaded-files/' + file.name;
            fileSystem.writeFile(filePath, data, function() {});
            deferred.resolve(file.name);
        });

        return deferred.promise;

    };

    for (var index in request.files) if (request.files.hasOwnProperty(index)) {
        var file = request.files[index];
        var promise = uploadFile(file);
        promises.push(promise);
    }

    promisedIo.all(promises).then(function(files) {
        response.send({ files: files, success: true });
        response.end();
    });

});