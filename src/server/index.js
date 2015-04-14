var express = require('express'),
    path = require('path'),
    app = express();

app.use(express.static(path.join(__dirname, '..', '..', 'public')));

app.listen(8080, function() {
  console.log('server listening on *:8080');
});
