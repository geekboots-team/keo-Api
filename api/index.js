const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const fs = require("fs");
const multer = require('multer');
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const app = express();
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use('/uploads', express.static('./uploads'));
// app.use('/uploads/resume', express.static('./uploads/resume'));
app.listen(8000, () => console.log("Server is running in 8000"));
app.use(fileUpload());



var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "0c81afbfe29c3fd8b41426b8b8d8d58110fb58ed02049f45",
    // password: "",
    database: "db_keo",
  });

  
  
  connection.connect(function (err) {
    if (err) throw err;
    console.log("DB connected");
  });
  module.exports = connection;


  
// app.use(expressCspHeader({
//   directives: {
//       'default-src': [SELF],
//       'script-src': [SELF, INLINE, 'somehost.com'],
//       'style-src': [SELF, 'mystyles.net'],
//       'img-src': ['data:', 'images.com'],
//       'worker-src': [NONE],
//       'block-all-mixed-content': true
//   }
// }));

// 2020-07-27 24:07:88
function getDate(){
  var today = new Date();
    var m_today = moment(today);
    var indian_time = m_today.tz('Asia/kolkata').format('YYYY/MM/DD HH:MM:ss');
    return indian_time;
}



// API TO UPLOAD IMAGE

    app.post("/gallery", (req, res, next) => {
            var post  = req.body;
            var img_tag = post.img_tag;
            // var file = post.image;
           if (!req.files){
                res.status(400).send('No files were uploaded.');
                return;
           }
             var file = req.files.uploaded_image;
             var img_name= Date.now()+file.name;
      
                if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" ){
                                      
                   file.mv('uploads/'+Date.now()+file.name, function(err) {
                                  
                       if (err)
      
                         return res.status(500).send(err);
                               var sql = "INSERT INTO `gallery`(`tag`,`image`) VALUES ('" + img_tag + "','" + img_name + "')";
      
                                 var query = connection.query(sql, function(err, result) {
                                      // res.redirect('profile/'+result.insertId);
                                      console.log("file uploaded");
                                     
                                 });
                            });
                                res.send({message:'file uploaded'});
               } else {
                 message = "ERROR FILE";
                 res.send({message: message});
               }
      });
    
 // show gallery
      app.get("/showGallery", (req, res) => {
        connection.query("SELECT * FROM gallery ORDER BY 1 DESC", (err, rows, fields) => {
          if (!err) res.send(rows);
          else console.log(err);
        });
      });


// contact us
app.post("/contactUs", (req, res, next) => {
  var post  = req.body;
  var name = post.name;
  var email = post.email;
  var phone = post.phone;
  var subject = post.subject;
  var message = post.message;
  

 if (req.body){
  var sql = "INSERT INTO `contact_us`(`name`,`email`,`phone`,`subject`,`message`) VALUES (?,?,?,?,?)";

  var query = connection.query(sql, [name, email, phone, subject, message], (err, result) => {
       // res.redirect('profile/'+result.insertId);
       console.log("data inserted");
  });
      
      res.send({message:'data uploaded'});
      return;
 }
 else{
  res.status(400).send('No body found.');
  return;
 }
}); 

      
// show contact
app.get("/showContact", (req, res) => {
  connection.query("SELECT * FROM contact_us ORDER BY 1 DESC", (err, rows, fields) => {
    if (!err) res.send(rows);
    else console.log(err);
  });
});



//delete gallery images
app.delete('/deleteImages/:id', (req, res) => {
  connection.query("SELECT image FROM gallery WHERE id = ?",[req.params.id], (err, result) => 

  {
    console.log(JSON.parse(JSON.stringify(result[0])).image);
    const img = JSON.parse(JSON.stringify(result[0])).image;

    fs.unlink('uploads/'+img, function(err) {
                                  
      if (err)

        return res.status(500).send(err);
        connection.query("DELETE FROM gallery WHERE id = ?",[req.params.id], (err, rows, fields) => {
          if (!err) res.send({message:'deleted successfully'});
          else console.log(err);
      })
           });

})
  }

);

//delete contact
app.delete('/deleteContact/:id', (req, res) => {
  connection.query("DELETE FROM contact_us WHERE id = ?",[req.params.id], (err, rows, fields) => {
    if (!err) res.send({message:'deleted successfully'});
    else console.log(err);
})});


app.post('/addJobs', (req, res) => {
  let job = req.body;
  var sql = "UPDATE career_posts SET job_role = ?, job_desc = ?, salary = ?, vacancies = ?, location = ? WHERE department = ?";
  connection.query(sql, [job.job_role, job.job_desc, job.salary, job.vacancies, job.location, job.department], (err, rows, feilds) => {
    if(!err) res.send({message: "Job updated"});
    else res.send(err);
  })
});


app.get('/getJobByDept/:dept', (req, res) => {
  let jobs = req.body;
  var sql = "SELECT * FROM career_posts WHERE department = ?";
  connection.query(sql, [req.params.dept], (err, rows, feilds) => {
    if(!err) res.send(rows);
    else res.send(err);
  })
});


app.post('/getJobs', (req, res) => {
  let jobs = req.body;
  var sql = "SELECT * FROM career_posts WHERE department = ?";
  connection.query(sql, [jobs.dept], (err, rows, feilds) => {
    if(!err){
      const d = JSON.parse(JSON.stringify(rows));
      res.send(d);
    } 
    else res.send(err);
  })
});


// apply for jobs by visitor
app.post("/applyJobs", (req, res, next) => {
  var post  = req.body;
  var department = post.department;
  var name = post.name;
  var email = post.email;
  var phone = post.phone;
  var current_ctc = post.current_ctc;
  var expected_ctc = post.expected_ctc;
 if (!req.files){
      res.status(400).send({message:"Please upload your CV"});
      return;
 }
   var cv = req.files.resume;
   console.log(cv);
   var file_name= Date.now()+cv.name;
  //  if(cv.mimetype !== "image/jpg"){
   if(cv.mimetype == "application/rtf" || cv.mimetype == "application/pdf" || cv.mimetype == "application/msword" || cv.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
                            
         cv.mv('uploads/resume/'+Date.now()+cv.name, function(err) {
                        
             if (err) return res.status(500).send(err);
            
                     var mysql = "INSERT INTO `apply_jobs`(`department`,`name`,`email`,`phone`,`current_ctc`,`expected_ctc`,`resume`) VALUES (?,?,?,?,?,?,?)";

                       var query = connection.query(mysql, [department, name, email, phone, current_ctc, expected_ctc, file_name], (err, result) => {
                        if(err){
                          
                          console.log(err,"api err")
                          return res.send({message:err});
                        }
                            console.log("Job applied");
                            return res.send({message:"job applied"});
                           
                       });
                  });
                      
     } else {
       message = "This format is not allowed, please upload resume with '.docx', '.doc', '.pdf' or '.rtf'";
       res.send({message: message});
     }
});


// show careers
app.get("/showCareers", (req, res) => {
  connection.query("SELECT * FROM apply_jobs ORDER BY 1 DESC", (err, rows, fields) => {
    if (!err) res.send(rows);
    else console.log(err);
  });
});



//delete gallery images
app.delete('/deletePeers/:id', (req, res) => {
  connection.query("SELECT resume FROM apply_jobs WHERE id = ?",[req.params.id], (err, result) => 

  {
    console.log(JSON.parse(JSON.stringify(result[0])).resume);
    const resume = JSON.parse(JSON.stringify(result[0])).resume;

    fs.unlink('uploads/resume/'+resume, function(err) {
                                  
      if (err)

        return res.status(500).send(err);
        connection.query("DELETE FROM apply_jobs WHERE id = ?",[req.params.id], (err, rows, fields) => {
          if (!err) res.send({message:'deleted successfully'});
          else console.log(err);
      })
           });

})
  }

);


app.post('/slider/:id', (req, res) => {
  connection.query("SELECT * FROM gallery WHERE id = ?",[req.params.id], (err, rows, fields) => 
  {
    res.send(rows);
});}

);




app.post('/login', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	if (username && password) {
		connection.query('SELECT * FROM login WHERE user = ? AND pass = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				res.send({message:'login', data: results});
			} else {
				res.send({message: 3});
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');

	}
});




