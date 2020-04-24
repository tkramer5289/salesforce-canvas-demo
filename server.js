var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    qrcode = require('qrcode-npm'),
    decode = require('salesforce-signed-request'),
    consumerSecret = process.env.CONSUMER_SECRET,
    app = express(),
    signedRequest;

app.set('view engine', 'ejs');
app.use(bodyParser()); // pull information from html in POST
app.use(express.static(__dirname + '/public'));

app.post('/signedrequest', function(req, res) {

    var comments = "";

    // You could save this information in the user session if needed
    if (signedRequest==null){
        signedRequest = decode(req.body.signed_request, consumerSecret);
    }
    else{
        comments = req.body.yourComments;
    }
    
    var context = signedRequest.context,
        oauthToken = signedRequest.client.oauthToken,
        instanceUrl = signedRequest.client.instanceUrl,

        query = "SELECT Id, FirstName, LastName, Phone, Email, Comments__c FROM Contact WHERE Id = '" + context.environment.record.Id + "'",
        
        //query = "SELECT Id, FirstName, LastName, Phone, Email, Comments__c FROM Contact WHERE Id = '" + "0036g00000AvO9tAAF" + "'",

        contactRequest = {
            url: instanceUrl + '/services/data/v43.0/query?q=' + query,
            headers: {
                'Authorization': 'OAuth ' + oauthToken
            }
        },
        updateRequest = {
            url: instanceUrl + '/services/data/v43.0/sobjects/Contact/' + context.environment.record.Id,
            headers: {
                'Authorization': 'OAuth ' + oauthToken
            },
            body: '{"Comments__c" : "' + comments + '"}'
        };

    request(updateRequest, function(err, response, body) {
        console.log("DEBUG Update Request: "+updateRequest.instanceUrl);
        console.log("DEBUG Update Request: "+updateRequest.headers);
        console.log("DEBUG Update Request: "+updateRequest.body);
        console.log("DEBUG Update Request: "+contactRequest.instanceUrl);
        console.log("DEBUG Update Request: "+contactRequest.headers);
        console.log("DEBUG Update Request: "+contactRequest.body);
    });

    request(contactRequest, function(err, response, body) {
        //var qr = qrcode.qrcode(4, 'L'),
        var contact = JSON.parse(body).records[0], 
        //    text = 'MECARD:N:' + contact.LastName + ',' + contact.FirstName + ';TEL:' + contact.Phone + ';EMAIL:' + contact.Email + ';;';
        text0=contact.FirstName, 
        text1=contact.LastName;
        //qr.addData(text);
        //qr.make();
        //var imgTag = qr.createImgTag(4);
        //res.render('index', {context: context, imgTag: imgTag, text1: text1, text0: text0});
        res.render('index', {context: context, text1: text1, text0: text0, comments: comments});
    });

});


app.get('/',function(req,res){
  res.sendFile('index.html');
  //It will find and locate index.html from  Public
});

app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

//app.post('/postToChatter', function(req, res) {

    // Added for Chatter post example
    //sr = decode(req.body.signed_request, consumerSecret);
    //alert("Context: "+sr.context);

    // Reference the Chatter user's URL from Context.Links object.
    /*url = sr.context.links.chatterFeedsUrl+"/news/"+sr.context.user.userId+"/feed-items";
    body = {body : {messageSegments : [{type: "Text", text: "Some Chatter Post"}]}};

    Sfdc.canvas.client.ajax(url,{
        client : sr.client,
            method: 'POST',
            contentType: "application/json",
            data: JSON.stringify(body),
            success : function(data) {
            if (201 === data.status) {
                alert("Success");
                }
            }
    });*/
//});
