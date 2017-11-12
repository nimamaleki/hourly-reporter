var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
const nodemailer = require('nodemailer');

setInterval(function(){ 
//global vars
var pageLink, metadata = Array(), fullNews;
var title, importance, postID, shortVersion;
var sentPostIDs, articleToRead;
var responsibleEmail = "nima.maleki@vodafone.com";
var authorEmail = "nima.maleki92@gmail.com";

//Scrape!
//app.get('/scrape', function(req, res){
    
    console.log("app.get triggered");
    
    //read the control file
    fs.readFile('lastPost.txt', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
        sentPostIDs = data.toString();

    });    
    
    //load the homepage
    url = 'https://www.mondomobileweb.it/';
    
    request(url, function(error, response, html){
        if(!error){
            
            var $ = cheerio.load(html);
            
            for( articleToRead = 1; articleToRead<=25; articleToRead++){
            
            toScrape = 'article:nth-child('+articleToRead+')';

            $(toScrape).filter(function(){

                var data = $(this);
                
                title = data.children().children().first().text().trim();
                postID = data.attr('id').substr(5);
                pageLink = data.children().children().children().first().attr('href');
                
                if(title.startsWith("Tim") || title.startsWith("Tre") || title.startsWith("Wind")){ importance = "High"; }
                else if(title.includes("Tim") || title.includes("Tre") || title.includes("Wind")){ importance = "Medium"; }
                else if(title.includes("Vodafone")){ importance = "Info"; }
                else{ importance = "Low";}
                
                shortVersion = data.children().eq(1).children().eq(1).text();
                shortVersionLength = shortVersion.length;
                shortVersion = shortVersion.substr(0,shortVersionLength-15);
                
                metadata[articleToRead] = {"title": title.trim(), "post ID": postID, "importance": importance, "news page URL": pageLink, "short": shortVersion};
                
            })
            
  
        }
             penetrate();
            
        }
    })
    
    function penetrate(){
        
        
        for (let i = 1; i<=24; i++){

            if(!sentPostIDs.includes(metadata[i]["post ID"].toString())){
                //send an email
                console.log(metadata[i]["post ID"],"gonna be sent");
                //here we define the sender of the email and provide its password.    
                var transporter = nodemailer.createTransport({
                  service: 'outlook',
                  auth: {
                    user: 'hourly.reporter@hotmail.com',
                    pass: 'DontMakeMeDoThis'
                  }
                });

            //building an html email:
                var mailList = authorEmail;

                var mailOptions = {
                  from: 'hourly.reporter@hotmail.com',
                  to: mailList,
                  subject: "[Importance: "+metadata[i]["importance"]+'] MondoMobileWeb.it',
                  html: "<h4>Ciao!</h4><p>C’è un nuovo post su MondoMobile da vedere:</p><br><h3>"+metadata[i]["title"]+"</h3><br><p>"+metadata[i]["short"]+" ...</p><br><h4>Per leggere il resto vai su questo <a href="+metadata[i]["news page URL"]+">link.</a></h4 style='color:blue'><br><h4>External Reports by NM</h4><h4><a href='mailto:nima.maleki@vodafone.com'>Nima.Maleki@Vodafone.com</a></h4>"
                };
                
            //The email is sent to the responsible predefined in variable "responsibleEmail".
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }else{  
                        
                    console.log('Message sent: %s', info.messageId);
                    updateControlFile();

                    }
                });
                
            function updateControlFile(){              
                    fs.appendFile('lastPost.txt', "\n"+metadata[i]["post ID"], (err) => {
                      if (err) throw err;
                      console.log('Control file updated');
                    });
            }    
                
            }
        }
        
        //res.json(metadata);  
        
    }
    
//})

}, 30000);

var port = process.env.PORT || 8000;
app.listen(port, function() {
    console.log("App is running on port " + port);
});
exports = module.exports = app;
