const Sequelize = require('sequelize');
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'o4qptfdThlH6', {
    //host: 'ep-nameless-leaf-a58tw4n6.us-east-2.aws.neon.tech',
    host: 'ep-nameless-leaf-a58tw4n6-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true },
    logging: console.log
});

// Define a "Student" model
var Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING,
    course: Sequelize.INTEGER
});

// Define a "Course" model
var Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

// Define a relationship between Students and Courses
//Course.hasMany(Student, { foreignKey: 'course' });
Course.hasMany(Student, {
    foreignKey: 'course',
    onDelete: 'SET NULL',  // or 'RESTRICT'
  });

Student.belongsTo(Course, {
    foreignKey: 'course',
    onDelete: 'SET NULL',  // or 'RESTRICT'
  });

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(() => {
            resolve();
        }).catch((err) => {
            reject("unable to sync the database");
        });
    });
};

// Get all student data
module.exports.getAllStudents = function () {
    return new Promise(function (resolve, reject) {
        Student.findAll().then((data) => {
            resolve(data);
        }).catch((err) => {
            reject("no results returned");
        });
    });
};

// Get all courses data
module.exports.getCourses = function () {
    return new Promise(function (resolve, reject) {
        Course.findAll().then((data) => {
            resolve(data);
        }).catch((err) => {
            reject("no results returned");
        });
    });
};

// Get course data by CourseID
module.exports.getCourseById = function (id) {
    return new Promise(function (resolve, reject) {
        Course.findAll({
            where: {
                courseId: id
            }
        }).then((data) => {
            resolve(data[0]);
        }).catch((err) => {
            reject("no results returned");
        });
    });
};

// Get all student data by student number
module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: {
                studentNum: num
            }
        }).then((data) => {
            resolve(data[0]);
        }).catch((err) => {
            reject("no results returned");
        });
    });
};

// Get all student data by course number
module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: {
                course: course
            }
        }).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject("no results returned");
        });
    });
};

// Add new student data using form data
module.exports.addStudent = function (studentData) {
    studentData.TA = (studentData.TA) ? true : false;

    for (const prop in studentData) {
        if (studentData[prop] === "") {
            studentData[prop] = null;
        }
    }

    return new Promise(function (resolve, reject) {
        Student.create(studentData).then(() => {
            resolve();
        }).catch((err) => {
            reject("unable to create student");
        });
    });
};


module.exports.updateStudent = function (studentData) {
    studentData.TA = (studentData.TA) ? true : false;

    // Handle empty string values
    for (const prop in studentData) {
        if (studentData[prop] === "") {
            studentData[prop] = null;
        }
    }
    console.log(studentData.enrolledCourse);
    return new Promise(function (resolve, reject) {
        Student.update(
            {
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                email: studentData.email,
                addressStreet: studentData.addressStreet,
                addressCity: studentData.addressCity,
                addressProvince: studentData.addressProvince,
                TA: studentData.TA,
                status: studentData.status,
                //course: studentData.course // Ensure courseId is being updated
                course: studentData.enrolledCourse // Ensure courseId is being updated

            },
            {
                where: { studentNum: studentData.studentNum },
                logging: console.log
            }
        ).then(() => {
            resolve();
        }).catch((err) => {
            reject("unable to update student");
        });
    });
};


// Add new course data using form data
module.exports.addCourse = function (courseData) {
    for (const prop in courseData) {
        if (courseData[prop] === "") {
            courseData[prop] = null;
        }
    }

    return new Promise(function (resolve, reject) {
        Course.create(courseData).then(() => {
            resolve();
        }).catch((err) => {
            reject("unable to create course");
        });
    });
};

// Update course data
module.exports.updateCourse = function (courseData) {
    for (const prop in courseData) {
        if (courseData[prop] === "") {
            courseData[prop] = null;
        }
    }

    return new Promise(function (resolve, reject) {
        Course.update(courseData, {
            where: { courseId: courseData.courseId }
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject("unable to update course");
        });
    });
};

// Delete course by ID
/*module.exports.deleteCourseById = function (id) {
    return new Promise(function (resolve, reject) {
        Course.destroy({
            where: { courseId: id }
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject("unable to delete course");
        });
    });
};*/

module.exports.deleteCourseById = (id) => {
    return new Promise((resolve, reject) => {
      Course.destroy({
        where: { courseId: id }
      })
      .then((rowsDeleted) => {
        if (rowsDeleted > 0) {
          resolve(`Course with ID ${id} was successfully deleted.`);
        } else {
          reject(`No course found with ID ${id}.`);
        }
      })
      .catch((error) => {
        reject(`Failed to delete course with ID ${id}. Error: ${error.message}`);
      });
    });
  };

// New function to delete student by number
module.exports.deleteStudentByNum = function (studentNum) {
    return new Promise(function (resolve, reject) {
        Student.destroy({
            where: { studentNum: studentNum }
        }).then((result) => {
            if (result) {
                resolve(); // Successfully deleted
            } else {
                reject("Student not found"); // No rows were affected
            }
        }).catch((err) => {
            reject("unable to delete student");
        });
    });
};
