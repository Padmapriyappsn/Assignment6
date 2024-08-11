/******************************************************************************** 
*  WEB700 – Assignment 06 
*
*	I declare that this assignment is my own work in accordance with Seneca's *  Academic Integrity Policy: 
*  
*	https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*	Name: Padmapriya PalaniSwamiNathan Student ID: 140193237 Date: 07-AUG-2024 
* 
*	Published URL:Vercel : https://assignment6-amber-mu.vercel.app/
*   Github: https://github.com/Padmapriyappsn/Assignment6
* 
********************************************************************************/ 

const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const collegeData = require("./modules/collegeData");
const exphbs = require('express-handlebars');


module.exports = app;

// Middleware routes to serve static files
app.use(express.static(path.join(__dirname, 'views'))); // Serve static files from the 'views' folder
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' folder

// Configure body-parser middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// Middleware to set the active route for navigation highlighting
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Set up Handlebars as the templating engine
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        // Helper to create navigation links
        navLink: function(url, options) {
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        // Helper to compare values
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        // Helper to check if context is empty
        empty: function (context) {
            return (context.length === 0 || context === undefined || context === null);
        },
        // Helper to compare values for conditional rendering
        ifEquals: function(a, b, options) {
            if (a === b) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        }
    }
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Setup routes to serve HTML pages
app.get('/', function(req, res) {
    res.render("home"); // Renders home.hbs view
});

app.get('/about', function(req, res) {
    res.render("about"); // Renders about.hbs view
});

app.get('/htmlDemo', function(req, res) {
    res.render("htmlDemo"); // Renders htmlDemo.hbs view
});


// GET route to display the students list
app.get('/students', (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(parseInt(req.query.course)).then((data) => {
            if (data.length > 0) {
                res.render("students", { students: data });
            } else {
                res.render("students", { message: "no results" });
            }
        }).catch((err) => {
            res.render("students", { message: "no results" });
        });
    } else {
        collegeData.getAllStudents().then((data) => {
            if (data.length > 0) {
                res.render("students", { students: data });
            } else {
                res.render("students", { message: "no results" });
            }
        }).catch((err) => {
            res.render("students", { message: "no results" });
        });
    }
});

// GET route to display the list of courses
app.get('/courses', (req, res) => {
    collegeData.getCourses().then((data) => {
        if (data.length > 0) {
            res.render("courses", { courses: data });
        } else {
            res.render("courses", { message: "no results" });
        }
    }).catch((err) => {
        res.render("courses", { message: "no results" });
    });
});

// GET route to display a specific course by ID
app.get('/course/:id', (req, res) => {
    collegeData.getCourseById(req.params.id).then((data) => {
        if (data) {
            res.render("course", { course: data });
        } else {
            res.status(404).send("Course Not Found");
        }
    }).catch((err) => {
        res.render("course", { message: "no results for course" });
    });
});

// GET route to display student details along with courses
app.get("/student/:studentNum", (req, res) => { 
 
    // initialize an empty object to store the values     
    let viewData = {}; 
    collegeData.getStudentByNum(req.params.studentNum).then((data) => {         
        if (data) 
        { 
            viewData.student = data; //store student data in the "viewData" object as "student" 
        } else { 
            viewData.student = null; // set student to null if none were returned 
        } 
    }).catch((err) => { 
        viewData.student = null; // set student to null if there was an error  
    }).then(collegeData.getCourses) 
    .then((data) => { 
        viewData.courses = data; // store course data in the "viewData" object as "courses" 
 
        // loop through viewData.courses and once we have found the courseId that matches 
        // the student's "course" value, add a "selected" property to the matching          // viewData.courses object 
 
        for (let i = 0; i < viewData.courses.length; i++) 
        { 
            if (viewData.courses[i].courseId == viewData.student.course) {                
                 viewData.courses[i].selected = true; 
            } 
        } 
 
    }).catch((err) => { 
        viewData.courses = []; // set courses to empty if there was an error 
    }).then(() => { 
        if (viewData.student == null) { // if no student - return an error             
            res.status(404).send("Student Not Found"); 
        } else { 
            res.render("student", { viewData: viewData }); // render the "student" view 
        } 
    }); 
}); 


// POST route to add a new student
app.post('/students/add', (req, res) => {
    let courseId = parseInt(req.body.enrolledCourse, 10);
    //collegeData.addStudent(req.body, courseId)
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect('/students'); // Redirect to the students page after adding student
        })
        .catch(err => {
            console.error('Error adding student:', err);
            res.status(500).send('Error adding student'); // Handle error
        });
});

// GET /students/add route for Add Student Page
app.get('/students/add', (req, res) => {
    collegeData.getCourses().then((data) => {
        // Render the addStudent view with the courses data
        res.render("addstudent", { courses: data });// Renders addstudent.hbs view
    }).catch((err) => {
        console.error('Error fetching courses:', err);
        // Render the addStudent view with an empty array for courses
        res.render("addstudent", { courses: [] });
    });
});

// POST route to update an existing student
app.post("/student/update", (req, res) => {
    req.body.studentNum = parseInt(req.body.studentNum, 10); // Ensure studentNum is a number
    req.body.TA = req.body.TA === "on"; // Handle checkbox data

    collegeData.updateStudent(req.body)
        .then(() => {
            res.redirect("/students"); // Redirect to students page after updating
        })
        .catch(err => {
            console.error("Error updating student:", err);
            res.status(500).send("Error updating student"); // Handle error
        });
});

// GET route to display the add course page
app.get('/courses/add', (req, res) => {
    res.render("addCourse"); // Renders addCourse.hbs view
});

// POST route to add a new course
app.post('/courses/add', (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => {
            res.redirect('/courses'); // Redirect to courses page after adding
        })
        .catch(err => {
            console.error('Error adding course:', err);
            res.status(500).send('Error adding course'); // Handle error
        });
});

// POST route to update an existing course
app.post("/course/update", (req, res) => {
    req.body.courseId = parseInt(req.body.courseId, 10); // Ensure courseId is a number

    collegeData.updateCourse(req.body)
        .then(() => {
            res.redirect("/courses"); // Redirect to courses page after updating
        })
        .catch(err => {
            console.error("Error updating course:", err);
            res.status(500).send("Error updating course"); // Handle error
        });
});

// GET route to delete a course by ID
app.get('/course/delete/:id', (req, res) => {
    collegeData.deleteCourseById(req.params.id)
        .then(() => {
            res.redirect('/courses'); // Redirect to courses page after deletion
        })
        .catch(err => {
            res.status(500).send("Unable to Remove Course / Course not found"); // Handle error
        });
});

// GET route to delete a student by student number
app.get('/student/delete/:studentNum', (req, res) => {
    const studentNum = parseInt(req.params.studentNum, 10); // Ensure studentNum is a number

    collegeData.deleteStudentByNum(studentNum)
        .then(() => {
            res.redirect('/students'); // Redirect to students page after deletion
        })
        .catch(err => {
            console.error('Error deleting student:', err);
            res.status(500).send('Unable to Remove Student / Student not found'); // Handle error
        });
});

// Handle 404 errors for non-matching routes
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize the data and start the server
collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("Server listening on port: " + HTTP_PORT);
    });
}).catch((err) => {
    console.log("Failed to initialize data: " + err);
});
