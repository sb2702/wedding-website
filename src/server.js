/**
 * Created by sam on 9/29/17.
 */



var express = require('express');


var app = express();



app.use(express.static(__dirname + '/public'));



app.listen('3000', function () {

    console.log("Listening on 3000");

});


