const express = require('express');
const bodyParser = require('body-parser');
const restService = express();
restService.set('port', (process.env.PORT || 8000));
var request = require('request');
var xmldom = require('xmldom').DOMParser;
var S = require('string');
var encodeUrl = require('encodeurl');
const jsxml = require("node-jsxml");

//Added for Oauth1 authorization
var OAuth = require('oauth-1.0a');
var crypto = require('crypto');

//For base64 utf-8 Encoding/Decoding
var base64 = require('base-64');
var utf8 = require('utf8'); 

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

restService.post('/echo', function(req, res) {
	
	var speechText="No response from Smart Comms, Please contact your administrator.";
	
	if(req.body.result.parameters.RequestType && req.body.result.parameters.RequestType=="wakeup")
	{
		speechText="Smarty is awake and at your service. How can I help you?";
		return res.json({
        speech: speechText,
        displayText: speechText,
        source: 'webhook-echo-sample'
	
		});
	}
	
	//Setting the Oauth1 authorization parameters
	var oauth = new OAuth({
    consumer: {
      key: '6e83adcc-09b3-4514-bb4f-442cfa21c019!TradeDocsThunderhead@sapient.com.trial',
      secret: 'ab97a83f-bc76-4784-a559-bac258fb7dde'
    },signature_method: 'HMAC-SHA1',
    hash_function: function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    }
	});

	if(req.body.result.parameters.NewFolderName && req.body.result.parameters.ParentID && req.body.result.parameters.ParentID!="" && req.body.result.parameters.NewFolderName!="" )
	{	
		console.log("inside folder creation");
	
var request_data = {
	url: 'https://na4.smartcommunications.cloud/one/api/cms/v4/folders',
    method: 'POST',
	data: {
      name: req.body.result.parameters.NewFolderName,
	  parentId: req.body.result.parameters.ParentID  
    },
	
};

request({
    url: request_data.url,
    method: request_data.method,
    form: request_data.data,
    headers: oauth.toHeader(oauth.authorize(request_data))
}, function(error, response, body) {
	//var speechText="";
    if (error) console.log(error);
	if(response.statusCode=='201')
	{
		speechText="Folder created";
	}
	else
	{
		if(body){
		var parseString = require('xml2js').parseString;
		parseString(response.body, function (err, result) {
		console.dir(result.errorinfo.msg);
		speechText=result.errorinfo.msg.toString();
		});
	}
	}
	console.log(response.statusCode);
	//console.log(request.body);
	console.log(request_data.url.substr(0,4));
	return res.json({
        speech: speechText,
        displayText: speechText,
        source: 'webhook-echo-sample'
	
	});
	
});
}
else if (req.body.result.parameters.EmailId && req.body.result.parameters.FirstName && req.body.result.parameters.LastName && req.body.result.parameters.UserId && req.body.result.parameters.EmailId!="" && req.body.result.parameters.FirstName!="" && req.body.result.parameters.LastName!="" && req.body.result.parameters.UserId!="")
{
	//var speechText ="Cannot perform operation";
	console.log("inside user creation");
	
	var request_vars =  {	
	url: 'https://na4.smartcommunications.cloud/one/oauth1/userManagement/v4/users',
	method: 'POST',	
};
var userId= req.body.result.parameters.UserId+"@sapient.com.trial";
console.log(userId);
console.log(req.body.result.parameters.EmailId);
console.log(req.body.result.parameters.FirstName);
console.log(req.body.result.parameters.LastName);
var data= {      
		"userId": userId,
		"authType": "AD",
		"emailAddress": req.body.result.parameters.EmailId,
		"forename": req.body.result.parameters.FirstName,
		"surname": req.body.result.parameters.LastName,
		"groupNames": ["Default Group"],
		"roleIds": [1, 6]  	
	};

request({
    url: request_vars.url,
    method: request_vars.method,
    json: data,
    headers: oauth.toHeader(oauth.authorize(request_vars))
}, function(error, response, body) {
	//var speechText="";
    if (error) console.log(error);
	if(response.statusCode=='201')
	{
		speechText="User created: "+req.body.result.parameters.UserId +"@sapient.com.trial";
	}
	else
	{
		if(body){
		var parseString = require('xml2js').parseString;
		parseString(response.body, function (err, result) {
			if(result){
		console.dir(result.errorinfo.msg);
		speechText=result.errorinfo.msg.toString();
			}
		});
	}
	}
	
	console.log(response.body);
	
	return res.json({
        speech: speechText,
        displayText: speechText,
        source: 'webhook-echo-sample'
	
	});
	
});


}
else if(req.body.result.parameters.RequestType && req.body.result.parameters.RequestType!="")
{
//Sample Data value
var amount1="20.56";
var agencyName="ABC Consultants";
var agencyPhoneNo="123-564-232";
var amount2="50.56";

//reset for every new echo
var requestType=req.body.result.parameters.RequestType;
var resourceId="";
var resourceVersionId="";
var transactionType="Policy";
var docNumber="";
var finalText="";
var vehicle1="";
var vehicle2="";
var age="";
	if(requestType.toString()=="showmonthlypremium")
	{
		resourceId="157761703";
		docNumber=req.body.result.parameters.DocNumber;
	}	
	else if(requestType.toString()=="updatebeneficiary")
	{
		resourceId="157762924";
	}
	else if(requestType.toString()=="petinsurance")
	{
		resourceId="157762933";
	}
	else if(requestType.toString()=="premiumfornewdriver" && req.body.result.parameters.Age.amount && req.body.result.parameters.Age.amount!="")
	{
		if(req.body.result.parameters.Age.amount<21)
		{
			resourceId="157762939";
		}
		else
		{
			resourceId="157762977";
		}
		age=req.body.result.parameters.Age.amount.toString()+" year old";
	}
	else if(requestType.toString()=="newpremiumforvehicle")
	{
		if(req.body.result.parameters.ConfirmDetails.toString().toUpperCase()=="Y")
		
		{
			resourceId="157762557";
			vehicle1=req.body.result.parameters.Vehicle1;
			vehicle2=req.body.result.parameters.Vehicle2;
		}
		else
		{
			speechText="Either you did not wish to continue further or we could not find the response for your request. Please try again or contact the support team."
		}
	}
	else
	{
		speechText="Either you did not wish to continue further or we could not find the response for your request. Please try again or contact the support team."
	}

if((requestType.toString()!="newpremiumforvehicle")|| (requestType.toString()=="newpremiumforvehicle" && req.body.result.parameters.ConfirmDetails.toString().toUpperCase()=="Y"))
{
//Code to retrieve latest resource version id -- starts
console.log("retrieve latest resource version id");
var request_vars =  {
		
	url: "https://na4.smartcommunications.cloud/one/api/cms/v4/resources/"+resourceId+"/latestversion?scope=-1",
	method: 'GET',	
};
console.log("Url to retrieve: "+request_vars.url);
request({
    url: request_vars.url,
    method: request_vars.method,
    headers: oauth.toHeader(oauth.authorize(request_vars))
}, function(error, response, body) {
    if (error) console.log(error);
	if(body)
	{
		console.log(body);
		var doc = new xmldom().parseFromString(body);
		if(doc)
		{
		var resourceVersionIdFromXML = doc.getElementsByTagName('resVerId');
		console.log("resourceVersionId fetched: "+resourceVersionIdFromXML[0].textContent);
		resourceVersionId=resourceVersionIdFromXML[0].textContent;
		console.log("resourceVersionId fetched inside: "+resourceVersionId);
		}
		else
		{
			speechText="There is some issue in retrieving the content data. Please check with the admin."
		}
	}
console.log("resourceVersionId fetched req: "+resourceVersionId);
//Code to getContent for resourceVersionId -- starts
console.log("getContent for resourceVersionId");
var request_vars2 =  {
		
	url: "https://na4.smartcommunications.cloud/one/api/cms/v4/versions/"+resourceVersionId+"/content",
	method: 'GET',	
};
console.log(request_vars2.url);
request({
    url: request_vars2.url,
    method: request_vars2.method,
    headers: oauth.toHeader(oauth.authorize(request_vars2))
}, function(error, response, body) {
    if (error) console.log(error);
	if(body)
	{
		console.log(body);
		var doc = new xmldom().parseFromString(body);
		if(doc)
		{
		var fetchAllParaText = doc.getElementsByTagName('p');
		for(var i in fetchAllParaText)
	{
		if(fetchAllParaText[i].textContent || fetchAllParaText[i].textContent=="")
		{
			if(fetchAllParaText[i].textContent=="")
			{
				finalText=finalText+"\n\n";
			}
			else{
			finalText=finalText+fetchAllParaText[i].textContent;
			}
		//console.log(fetchAllParaText[i].textContent);
		}
	}
	
	speechText=finalText;
	speechText=S(speechText).replaceAll("<TransactionType>", transactionType).toString();
	speechText=S(speechText).replaceAll("<PolicyNumber>", docNumber).toString();
	speechText=S(speechText).replaceAll("<Amount1>", amount1).toString();
	speechText=S(speechText).replaceAll("<Amount2>", amount2).toString();
	speechText=S(speechText).replaceAll("<AgencyName>", agencyName).toString();
	speechText=S(speechText).replaceAll("<AgencyPhoneNo>", agencyPhoneNo).toString();
	speechText=S(speechText).replaceAll("<Vehicle1>", vehicle1).toString();
	speechText=S(speechText).replaceAll("<Vehicle2>", vehicle2).toString();
	speechText=S(speechText).replaceAll("<Age>", age).toString();
	console.log(speechText);
	
		return res.json({
        speech: speechText,
        displayText: speechText,
        source: 'webhook-echo-sample'
	
	});
	
		}
		else
		{
			speechText="Faced some internal issue. Please check with your admin.";
			return res.json({
			speech: speechText,
			displayText: speechText,
			source: 'webhook-echo-sample'
		});
	}
	}
	else
	{
			return res.json({
			speech: speechText,
			displayText: speechText,
			source: 'webhook-echo-sample'
		});
	}
});

//Code to getContent for resourceVersionId -- ends
});
//Code to retrieve latest resource version id -- ends

}
else
{
			//speechText="Faced some internal issue. Please check with your admin.";
			return res.json({
			speech: speechText,
			displayText: speechText,
			source: 'webhook-echo-sample'
		});
}


}
else if(req.body.result.parameters.GroupName && req.body.result.parameters.GroupName!="")
{
var finalText="The users who are part of the " + req.body.result.parameters.GroupName +" are";
var groupName=req.body.result.parameters.GroupName;
var url = "https://na4.smartcommunications.cloud/one/oauth1/userManagement/v4/groups/"+groupName+"?withUserIds=true";
var encodedURL = encodeUrl(url);
console.log(encodedURL);
var request_vars =  {
		
	url: encodedURL,
	method: 'GET'
};

request({
    url: request_vars.url,
    method: request_vars.method,
    headers: oauth.toHeader(oauth.authorize(request_vars))
}, function(error, response, body) {
    if (error) console.log(error);
	//console.log(response);
	if(response.statusCode=='200')
	{
	if(body)
	{
		var doc = new xmldom().parseFromString(body);
		if(doc)
		{
		var fetchAllUserIds = doc.getElementsByTagName('userId');
		console.log("length: "+fetchAllUserIds.length);
		for(var i in fetchAllUserIds)
	{
		if(fetchAllUserIds[i].textContent)
		{
			
			finalText=finalText+"\n"+fetchAllUserIds[i].textContent;
		}
	}
	
	speechText=finalText;
	
	
		return res.json({
        speech: speechText,
        displayText: speechText,
        source: 'webhook-echo-sample'
	
	});
	
		}
		else
		{
			speechText="Faced some internal issue. Please check with your admin.";
			
			return res.json({
			speech: speechText,
			displayText: speechText,
			source: 'webhook-echo-sample'
		});
		
	}
	}
	}
	else
	{
		if(body){
		var parseString = require('xml2js').parseString;
		parseString(response.body, function (err, result) {
		console.dir(result.errorinfo.msg);
		speechText=result.errorinfo.msg.toString();
		return res.json({
			speech: speechText,
			displayText: speechText,
			source: 'webhook-echo-sample'
		});
		});
	}
	}
	console.log(speechText);
	});
}
else
{
			speechText="Cannot perform any operation, please try again.";
			return res.json({
			speech: speechText,
			displayText: speechText,
			source: 'webhook-echo-sample'
	//final
});
}
});
restService.listen(restService.get('port'), function() {
  console.log('Node app is running on port', restService.get('port'));
});
