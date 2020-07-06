const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
// const cors = require('cors');
const mongoose  = require('mongoose');
const SHA512 = require("crypto-js/sha512");
const Schema  = mongoose.Schema;
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

process.env.NODE_TLS_REJECT_UNAUTHORIZED='0';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  type: "SMTP",
  host: "smtp.gmail.com",
  secure: true,
  auth: {
      user: 'vrsec2020@gmail.com',
      pass: 'timeandspace'
  }
});

const visitSchema = new Schema({
  inde : Number,
  totalVisits : Number,
  lastVisit : Date
});

const authSchema = new Schema({
  inde : Number,
  key : String
});

const studentSchema = new Schema({
  personId : Number,
  category : String,
  rno : String,
  name : String,
  pno : String,
  email : String,
  address : String,
  approval : Boolean,
  otp : Number
});

const staffSchema = new Schema({
  personId : Number,
  category : String,
  name : String,
  email : String
});

const imgSchema = new Schema({
  personId : Number,
  img: Buffer
});

const imgSchemaStudent = new Schema({
  personId : Number,
  rno : String,
  img: Buffer
});

const port = process.env.PORT || 5100;

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true, parameterLimit: 100000 }));
app.use(fileUpload());

if(process.env.NODE_ENV === 'production'){
  app.use(express.static( 'client/build' ));

  app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html')); // relative path
  });
}

// var searchTermDoc = mongoose.model('searchTermDoc', searchTermsSchema, 'searchTerms');
var visitDoc = mongoose.model('visitDoc', visitSchema, 'visit');
var authDoc = mongoose.model('authDoc', authSchema, 'auth');
var studentDoc = mongoose.model('studentDoc', studentSchema, 'personData');
var staffDoc = mongoose.model('staffDoc', staffSchema, 'personData');
var mainImageDoc = mongoose.model('mainImageDoc', imgSchema, 'mainImageData');
var thumbImageDoc = mongoose.model('thumbImageDoc', imgSchema, 'thumbImageData');
var mainImageStudentDoc = mongoose.model('mainImageStudentDoc', imgSchemaStudent, 'mainImageData');
var thumbImageStudentDoc = mongoose.model('thumbImageStudentDoc', imgSchemaStudent, 'thumbImageData');


var server = app.listen(port,() => console.log(`Listening on port ${port}`));
server.setTimeout(300000);
mongoose.connect('mongodb+srv://chandu:qwerty1000@cluster-5w20o.mongodb.net/cse2020?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }).
  catch(error => {
    console.log('CONNECTION TO MONGODB FAILED !');
  });

mongoose.connection.on('connected', function () {
  console.log('Mongoose CONNECTED! ');
});

mongoose.connection.on('error',function (err) {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose connection disconnected');
});

// mongoose.set('useFindAndModify', false);


// app.post('/upload', (req, res) => {
//   console.log(req);
//   console.log('body : ',req.body);
//   console.log('files : ',req.files);
//     let mainImageSave = new mainImageDoc({ personId : 102, img : req.files.file.data });
//     mainImageSave.save(mainErr => {
//       if(mainErr){
//         res.send('Server error while inserting the main image.');
//       }else{
//         mainImageDoc.find({personId:101}).then(result => {
//           res.send(result);
//         })
//       }});
// });




app.post('/uploadNewData', (req, res) => {
  // console.log('ret itself : ', req.body);
  let data = req.body;
  let images = req.files;
  if(data.updateKey === 'ploi'){

    studentDoc.find({}).sort({personId : -1}).limit(1).then(newPersonId => {
      // console.log(newPersonId);
      if(newPersonId.length  === 0){
        newPersonId = 1;
      }else{
        newPersonId = newPersonId[0].personId+1;
      }
      let personSave;
      let mainImageSave;
      let thumbImageSave;
      if(data.category === 'staff'){
        personSave = new staffDoc({ personId : newPersonId, category : 'staff', name : data.name, email : data.email });
        personSave.save(personErr => {
          if(personErr){
            console.log(personErr);
            res.send('Server error while inserting the person data.');
          }else{
            mainImageSave = new mainImageDoc({ personId : newPersonId, img : images.mainImage.data });
            mainImageSave.save(mainErr => {
              if(mainErr){
                res.send('Server error while inserting the main image.');
              }else{
                thumbImageSave = new thumbImageDoc({ personId : newPersonId, img : images.thumbImage.data });
                thumbImageSave.save(thumbErr => {
                  if(thumbErr){
                    res.send('Server error while inserting the thumbnail image.');
                  }else{
                    res.send('Data Saved');
                  }
                })
              }
            })
          }
        })
      }else{
        let updatedFlag = false;
        let otp = Math.floor(Math.random()*90000) + 10000;
        personSave = { personId : newPersonId, category : data.category, name : data.name, pno : data.pno, email : data.email, address : data.address, approval : false, otp : otp };
        studentDoc.updateOne({ rno : data.rno }, { $set : personSave }, { upsert : true }).then( personRes => {
          if(personRes.nModified === 1){
            updatedFlag = true;
          }
          mainImageSave = { personId : newPersonId, img : images.mainImage.data };
          mainImageStudentDoc.updateOne({ rno : data.rno }, { $set : mainImageSave }, { upsert : true }).then( mainRes => {
            if(mainRes.nModified === 1){
              updatedFlag = true;
            }
            thumbImageSave = { personId : newPersonId, img : images.thumbImage.data };
            thumbImageStudentDoc.updateOne({ rno : data.rno }, { $set : thumbImageSave }, { upsert : true }).then( thumbRes => {
              if(thumbRes.nModified === 1){
                updatedFlag = true;
              }
              if(updatedFlag){
                res.send('Data Updated');
              }else{
                res.send('Data Saved');
              }
            }).catch( thumbErr => {
              console.log(thumbErr);
              res.send('Server error while inserting the thumbnail image.');
            });
          }).catch( mainErr => {
            console.log(mainErr)
            res.send('Server error while inserting the main image.');
          });
        }).catch(personErr => {
          console.log(personErr);
          res.send('Server error while inserting the person data.');
        });
      }
    }).catch(error => {
      console.log(error);
      res.send(' server Error while requesting the new ID');
    })

  }else{
    res.send('update key is wrong ! you\'ve been recorded.');
  }
});

app.post('/updatePhoto', (req, res) => {
  // console.log('ret itself : ', req.body);
  let data = req.body;
  let images = req.files;
  if(data.updateKey === 'ploi'){

      let mainImageSave;
      let thumbImageSave;
      mainImageSave = { img : images.mainImage.data };
      mainImageStudentDoc.updateOne({ rno : data.rno }, { $set : mainImageSave }).then( mainRes => {
        thumbImageSave = { img : images.thumbImage.data };
        thumbImageStudentDoc.updateOne({ rno : data.rno }, { $set : thumbImageSave }).then( thumbRes => {
          // console.log(mainRes);
          if(thumbRes.nModified === 1){
            res.send('Data Updated');
          }else{
            res.send('Roll Number Doesn\'t exist in the database. Picture not updated.');
          }
        }).catch( thumbErr => {
          console.log(thumbErr);
          res.send('Server error while updating the thumbnail image.');
        });
      }).catch( mainErr => {
        console.log(mainErr)
        res.send('Server error while updating the main image.');
      });

  }else{
    res.send('update key is wrong ! you\'ve been recorded.');
  }
});


app.post('/getThumbImage', (req, res) => {

  thumbImageDoc.find({ personId : req.body.personId }).then(resu => {
    res.send([1, resu]);
  }).catch(errr => {
    res.send([0 , 'An error occured at server while retrieving the image with PID : ' + req.body.personId + '. Contact Admin.']);
    console.log(errr);
  });
});





app.post('/initialFireup', (req, res) => {

  date = new Date();

  visitDoc.updateOne({ inde: 1 },{ $inc: { totalVisits: 1 }, $set: { lastVisit: date }},{ upsert: true })
    .then(ress => {
    }).catch(err => {
      console.log(err);
    });

  visitDoc.find({ inde : 1 }).then(resuu => {
    res.send(resuu);
    // console.log(resuu);
  }).catch(errr => {
    res.send('Retrieving...');
    console.log(errr);
  });

});

app.post('/authenticator', (req, res) => {
  let key = req.body.key;
  key = SHA512(key + 'velagapudi').toString();
  key = key.slice(5, );

  authDoc.find({ inde : 1 }).then(resu => {
    // console.log(resu);
    if(resu[0].key  === key){
      studentDoc.find({}).then(result => {
        // console.log(result);
        let resultUpdated = [];
        result.forEach((item, i) => {
          if(item.category === 'staff'){
            resultUpdated.push(item);
          }else{
            let pno = 'Hidden'
            if(item.approval === true){
              pno = item.pno;
            }
            resultUpdated.push({
              personId : item.personId,
              category : item.category,
              rno : item.rno,
              name : item.name,
              pno : pno,
              email : item.email,
              address : item.address
            });
          }
        });
        res.send([1, resultUpdated]);
      }).catch(error => {
        res.send([0 , 'Authentication success but an error occured while retrieving data from server. Contact admin.']);
        console.log(error);
      });
    }else{
      res.send([0 , 'The key is incorrect']);
    }
  }).catch(errr => {
    res.send([0 , 'An error occured at server while authenticating']);
    console.log(errr);
  });
});

app.post('/authenticatorAdmin', (req, res) => {
  let key = req.body.key;
  key = SHA512(key + 'theadmin').toString();
  key = key.slice(5, );

  authDoc.find({ inde : 2 }).then(resu => {
    // console.log(resu);
    if(resu[0].key  === key){
      res.send([1, 'YesYet']);
    }else{
      res.send([0 , 'Admin key is incorrect']);
    }
  }).catch(errr => {
    res.send([0, 'An error occured at server while authenticating']);
    console.log(errr);
  });
});

app.post('/adminPasswordChange', (req, res) => {
  let key = req.body.adminPassword;
  key = SHA512(key + 'theadmin').toString();
  key = key.slice(5, );

  if(req.body.updateKey === 'ploi'){
    authDoc.updateOne({ inde : 2 }, { $set: { key: key }}).then(resu => {
      // console.log(resu);
      res.send('Admin password updated successfully!');
    }).catch(errr => {
      res.send('An error occured at server while changing Admin password.');
      console.log(errr);
    });
  }else{
    res.send('update key is wrong ! you\'ve been recorded.');
  }
});

app.post('/appPasswordChange', (req, res) => {
  let key = req.body.appPassword;
  key = SHA512(key + 'velagapudi').toString();
  key = key.slice(5, );

  if(req.body.updateKey === 'ploi'){
    authDoc.updateOne({ inde : 1 }, { $set: { key: key }}).then(resu => {
      // console.log(resu);
      res.send('App password updated successfully!');
    }).catch(errr => {
      res.send('An error occured at server while changing App password.');
      console.log(errr);
    });
  }else{
    res.send('update key is wrong ! you\'ve been recorded.');
  }
});

app.post('/requestOTP', (req, res) => {
  let email = req.body.email;

  studentDoc.find({ email : email }).then(resu => {
    // console.log(resu);
    if(resu.length === 0){
      res.send([0 , 'Email not found in the database! Please check the email you\'ve given by clicking on your picture in this app.']);
    }else{
      if(resu[0].otp === undefined){
        res.send([0 , 'Staff emails don\'t require verification']);
      }else{
        if(resu[0].approval === true){
          res.send([0 , 'Your email is already approved!']);
        }else{
          let mailData = {
            from: 'vrsec2020@gmail.com',
            to: resu[0].email,
            subject: 'OTP for approval of details - CSE2020',
            html: `<div>Thanks for requesting to display your phone number <strong>${resu[0].pno}</strong> in CSE2020 app.<br/><br/>Your OTP is: <br/><h1>${resu[0].otp}</h1><br/><br/>Thank you,<br/>CSE2020</div>`
          };
          transporter.sendMail(mailData, (err, info) => {
            if(err){
              console.log(err);
              res.send([0 , 'An error occured at the server while sending the mail. Please contact admin.']);
            }
            else{
              // console.log(info);
              res.send([1, 'OTP sent successfully. Check you mail and enter the OTP here. Enter the 5 digits to enable the Submit OTP button']);
            }
          });
        }
      }
    }
  }).catch(errr => {
    res.send([0, 'An error occured at server while requesting OTP. Contact Admin']);
    console.log(errr);
  });
});

app.post('/verifyOTP', (req, res) => {
  let email = req.body.email;
  let otp = req.body.otp;

  studentDoc.find({ email : email }).then(resu => {
    // console.log(resu);
    if(resu.length === 0){
      res.send([0 , 'Email not found in the database! Please check the email you\'ve given by clicking on your picture in this application.']);
    }else{
      if(resu[0].otp === otp){
        studentDoc.updateOne({ email: email },{ $set: { approval: true }})
          .then(ress => {
            res.send([1, 'OTP verification successful. Reload the page to see the changes.']);
          }).catch(err => {
            res.send([0 , 'OTP is correct. But a problem occured at the server, Please contact Admin.']);
            console.log(err);
          });
        let mailData = {
          from: 'vrsec2020@gmail.com',
          to: resu[0].email,
          subject: 'OTP verification Successful - CSE 2020',
          html: `<div>OTP verification successful. Your phone number is now made public within the app.<br/><br/>Thank you,<br/>CSE2020</div>`
        };
        transporter.sendMail(mailData, (err, info) => {
          if(err){
            console.log(err);
          }
          else{
            console.log(info);
          }
        });
      }else{
        res.send([0, 'OTP is incorrect. Please try again.']);
      }
    }
  }).catch(errr => {
    res.send([0, 'An error occured at server while requesting OTP. Contact Admin']);
    console.log(errr);
  });
});




// app.post('/getSearchResults', async(req, res) => {
//
//
//   let result = await searchTermDoc.updateOne(
//   { searchTerm: searchTerm },
//   { $inc: { frequency: 1 } },
//   { upsert: true }
//   );
//
//
//   if(result === 1){
//     console.log('UPDATED');
//   }else{
//     console.log('INSERTED');
//   }
//
// });







process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});
