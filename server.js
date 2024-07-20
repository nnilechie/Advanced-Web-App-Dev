/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Nicholas Nwanua Ilechie Student ID: 153461223 Date: Jul 20 2024
*
*  Online (Vercel) Link: 
*
********************************************************************************/ 




const HTTP_PORT = process.env.PORT || 8080; // Defining 8080 as our port to listen
const express = require("express"); // Import the express module
const path = require('path'); // Import the path module
const collegeData = require('./modules/collegeData'); // Import the collegeData module
const exphbs = require('express-handlebars'); // imports express-handlebars

const app = express(); 

// Custom Handlebars helpers
const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts/',
  helpers: {
    navLink: function(url, options) {
      return '<li' + 
        ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
        '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    
    equal: function(lvalue, rvalue, options) {
      if (arguments.length < 3) {
        throw new Error("Handlebars Helper equal needs 2 parameters");
      }
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }
  }
});


app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));

//Middleware for Nav
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  next();
});

// Adding body-parser
app.use(express.urlencoded({ extended: true }));

// // Defining our route to get all students and/or students by course
// app.get('/students', (req, res) => {
//   const course = req.query.course; // Get the course query parameter
//   if (course) {  // If given course query parameter then get students by course id
//     collegeData.getStudentsByCourse(course)
//       .then(students => res.json(students)) // Send the students data as JSON
//       .catch(err => res.status(404).send(err)); // Send an error message if there's an issue
//   } else {
//     // If no course query parameter is provided, get all students
//     collegeData.getAllStudents()
//       .then(students => res.json(students)) // Return the JSON string of student
//       .catch(err => res.status(404).send(err)); // catch the error if an issue
//   }
// });

//Updated Student Route
app.get('/students', (req, res) => {
  const course = req.query.course;
  if (course) {
    collegeData.getStudentsByCourse(course)
      .then(students => res.render("students", {students: students}))
      .catch(err => res.render("students", {message: "no results"}));
  } else {
    collegeData.getAllStudents()
      .then(students => res.render("students", {students: students}))
      .catch(err => res.render("students", {message: "no results"}));
  }
});

//  Defining our route to get all TAs
app.get('/tas', (req, res) => {
  collegeData.getTAs()
    .then(tas => res.json(tas)) // Return the JSON string of Managers from TA call
    .catch(err => res.status(404).send(err)); // catch the error if an issue
});

// // Defining our route to get all courses
// app.get('/courses', (req, res) => {
//   collegeData.getCourses()
//     .then(courses => res.json(courses)) // Return all courses
//     .catch(err => res.status(404).send(err)); // catch the error if an issue
// });

// Updated Course Route
app.get('/courses', (req, res) => {
  collegeData.getCourses()
    .then(courses => res.render("courses", {courses: courses}))
    .catch(err => res.render("courses", {message: "no results"}));
});

// // Defining our route to get a specific student by their student number
// app.get('/student/:num', (req, res) => {
//   const num = req.params.num; // Get the student number from the route parameters
//   collegeData.getStudentByNum(num)
//     .then(student => res.json(student)) // Return the student data as JSON
//     .catch(err => res.status(404).send(err)); // catch the error if issues found
// });

//Updated individual Student route
// app.get('/student/:num', (req, res) => {
//   const num = req.params.num; // Get the student number from the route parameters
//   collegeData.getStudentByNum(num)
//       .then(student => res.render("student", { student: student })) // Render the student view with the student data
//       .catch(err => res.render("student", { message: "no results" })); // Render the student view with a message if no results found
// });

app.get("/student/:studentNum", (req, res) => {
  let viewData = {};

  collegeData.getStudentByNum(req.params.studentNum).then((data) => {
      if (data) {
          viewData.student = data;
      } else {
          viewData.student = null;
      }
  }).catch(() => {
      viewData.student = null;
  }).then(collegeData.getCourses)
  .then((data) => {
      viewData.courses = data;

      for (let i = 0; i < viewData.courses.length; i++) {
          if (viewData.courses[i].courseId == viewData.student.course) {
              viewData.courses[i].selected = true;
          }
      }

  }).catch(() => {
      viewData.courses = [];
  }).then(() => {
      if (viewData.student == null) {
          res.status(404).send("Student Not Found");
      } else {
          res.render("student", { viewData: viewData });
      }
  });
});


// New route to get course by ID
app.get('/course/:id', (req, res) => {
  collegeData.getCourseById(req.params.id)
      .then(course => res.render("course", { course: course }))
      .catch(err => res.render("course", { message: "no results" }));
});

// // This route simply returns the html code from the home.html - Home Route
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/home.html')); // Send the home.html file
// });

// Updated  Home Route
app.get('/', (req, res) => {
  res.render('home');
});

// // Route to return the HTML code from about.html
// app.get('/about', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/about.html')); // Send the about.html file
// });

// Updated  About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// // Route to return the HTML code from htmlDemo.html
// app.get('/htmlDemo', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/htmlDemo.html')); // Send the htmlDemo.html file
// });

// Updated  htmlDemo Route
app.get('/htmlDemo', (req, res) => {
  res.render('htmlDemo');
});

// // Route to adding students 
// app.get("/students/add", (req, res) => {
//   res.sendFile(path.join(__dirname, "/views/addStudent.html"));
// });

// Updated Route to adding students 
app.get('/students/add', (req, res) => {
  res.render('addStudent');
});


// Post route for adding students
app.post("/students/add", (req, res) => {
  collegeData.addStudent(req.body)
      .then(() => {
          res.redirect("/students");
      })
      .catch((error) => {
          console.error(error);
          res.status(500).send("Error adding student");
      });
});

// New Post for updating student
app.post("/student/update", (req, res) => {
  collegeData.updateStudent(req.body)
      .then(() => {
          res.redirect("/students");
      })
      .catch((error) => {
          console.error(error);
          res.status(500).send("Error updating student");
      });
});


// Handling invalid and/or no matching routes "Page Not Found" with HTTP status 404
app.use((req, res) => {
  res.status(404).send("Page Not Found"); // Send a 404 error message for undefined routes
});

// Initialize data and start server
collegeData.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => { // Start the server only after data initialization is successful
      console.log(`Server is listening on port ${HTTP_PORT}`); // Log in console the server start message
    });
  })
  .catch(err => {
    console.error(`Failed to initialize data: ${err}`); // Log error message if initialization does not work
  });




  module.exports = app;