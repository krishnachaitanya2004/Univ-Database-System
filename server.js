const express = require('express');
const bodyParser = require('body-parser');
const postgres = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt'); 
const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

const pool = new postgres.Pool({
    host: 'localhost',
    user: 'postgres',
    database: 'students',
    password: 'password',
    port: 5432
});




app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});

app.post('/register', async (req, res) => {
    const { studentid, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); 
    const query = 'INSERT INTO loginuser(stud_id, password_hash) VALUES($1, $2)';
    pool.query(query, [studentid, hashedPassword], (error) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send('Please Confirm Your Student ID');
        } else {
            res.send(
                `<html>
                    <body>
                        <script>
                            alert('Registration Successful!');
                            setTimeout(function() {
                                window.location.href = '/login';
                            }, 2000); 
                        </script>
                    </body>
                </html>`
            );
        }
    });
});

app.post('/logincheck', (req, res) => {
    const { studentid, password } = req.body;

    const query = 'SELECT (password_hash = crypt($1,password_hash)) AS pswmatch FROM loginuser WHERE stud_id = $2';
    pool.query(query, [password,studentid], async (error, results) => {
        if (error) {
            console.error('Database error:', error);
            res.status(500).send('Internal Server Error');
        } 
        else if (results.rows.length > 0) {
                const token = jwt.sign({ id: studentid }, "secretkey",);
                const refresh = '<meta http-equiv="refresh" content="3; url=/home"/>';
                return res.cookie("token", token, { httpOnly: true }).status(200).send(refresh);
         }
        else {
                res.status(401).send('Invalid Student ID or Password');
        }
    });
});

app.get('/home', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send('Unauthorized');
    }

    const decoded = jwt.verify(token, 'secretkey');
    const studentid = decoded.id;

    const completed_courses_query = `SELECT course_id,grade,year,semester FROM takes WHERE id = $1 AND grade <> 'F'`;

    pool.query(completed_courses_query, [studentid], (error, completedResults) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send('Internal Server Error');
        }

        const completedRows = completedResults.rows;
        const completedTable = `
        <h1>Completed Courses</h1>
        <style>
        table {
          border-spacing: 12px;
          border: 2px solid black;
          font-size: 17px;
        }
        </style>
        <table>
        <tr>
        <th>Course ID</th>
        <th>Grade</th>
        <th>Year</th>
        <th>Semester</th>
        </tr>
        ${completedRows.map(
            row => `
            <tr>
            <td>
            ${row.course_id}
            </td>
            <td>
            ${row.grade}
            </td>
            <td>
            ${row.year}
            </td>
            <td>
            ${row.semester}
            </td>
            </tr>`).join('')}
        </table>
    `;
    
        // Second query for all courses and registration status
        const query = `SELECT DISTINCT ON (s.course_id, s.sec_id) s.course_id, s.sec_id, 
            CASE WHEN t.ID = $1 THEN 'Registered' ELSE 'Not Registered' END AS reg
            FROM section s
            LEFT JOIN takes t ON s.course_id = t.course_id 
                AND s.sec_id = t.sec_id 
                AND s.semester = t.semester 
                AND s.year = t.year
            WHERE s.semester = 'Spring' AND s.year = 2024;`;

        pool.query(query, [studentid], (err, result) => {
            if (err) {
                console.error('Error executing the query', err);
                return res.status(500).send('Internal Server Error');
            }

            const rows = result.rows;

            const courseTable = `
                <h1>Course Table</h1>
                <style>
                table {
                  border-spacing: 12px;
                  border: 2px solid black;
                  font-size: 17px;
                }
                .registered {
                  color: green;
                }
                .not-registered {
                  color: gray;
                }
                </style>
                <table>
                <tr>
                <th>Course ID</th>
                <th>Sec ID</th>
                <th>Registration Status</th>
                </tr>
                ${rows.map(row => `
                    <tr>
                    <td>${row.course_id}</td>
                    <td>${row.sec_id}</td>
                    <td class="${row.reg === 'Registered' ? 'registered' : 'not-registered'}">${row.reg}</td>
                    </tr>
                `).join('')}
                </table>
            `;

            const form = `
                <h1>Registration Form</h1>
                <style>
                form {
                    display: flex;
                    flex-direction: column;
                    width: 300px;
                    gap: 10px;
                    margin-top: 20px;
                    margin-bottom: 20px;
                }
                input {
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }
                button {
                    padding: 10px;
                    border: none;
                    border-radius: 5px;
                    background-color: #007bff;
                    color: #fff;
                    cursor: pointer;
                }
                </style>
                <form action="/registerCourse" method="post">
                    <label for="courseid">Course ID:</label>
                    <input type="text" name="courseid" id="courseid" placeholder="Course ID" required>
                    <label for="secid">Section ID:</label>
                    <input type="text" name="secid" id="secid" placeholder="Section ID" required>
                    <button type="submit" id="register">Register</button>
                </form>
            `;

            const userString = `
                <h3 style="color: red; font-size: 20px;">User ID: <span style="color: black;">${studentid}</span></h3>
                <h3 style="color: red; font-size: 20px;">Role: <span style="color: black;">Student</span></h3>
            `;

            return res.send(
                userString + "<br>" + completedTable + "<br>" + courseTable + "<br>" + form
            );
        });
    });
});

  app.post("/registerCourse",  (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
      return res.send("User not logged in");
    }
    try {
      const decoded = jwt.verify(token, "jwt");
      const id = decoded.id;
      const {courseid,secid} = req.body;
  
      const sec_query = `SELECT EXISTS (
        SELECT * FROM section
        WHERE semester = 'Spring' AND year = 2024 AND course_id = $1 AND sec_id = $2
      );`;
      pool.query(sec_query,[courseid,secid], (err, result) => {
        if (err) {
          return res.send("Error executing the query");
        }
        if (result.rows[0].exists === false) {
          return res.send("Registration failed - no such course and section");
        }
      
        const reg_query = `
          SELECT EXISTS (
            SELECT * FROM takes
            WHERE id = $2 AND course_id = $1 AND grade <> 'F'
          );
        `;
        pool.query(reg_query,[courseid,id], (err, result) => {
          if (err) {
            return res.send("Error executing the query");
          }
      
          if (result.rows[0].exists === true) {
            return res.send("Registration failed - already registered");
          }
      

          const prereq_query = `
            SELECT prereq_id FROM prereq 
            WHERE course_id = $1 EXCEPT (SELECT course_id FROM takes
              WHERE id = 's00000' AND grade <> 'F'
            );
          `;
          pool.query(prereq_query,[courseid], (err, result) => {
            if (err) {
              return res.send("Error executing the query");
            }
      
            const data = result.rows;
            const str_data = `${data.map((row)=>row.prereq_id)}`
            if (data.length > 0) {
              return res.send("Registration failed - prereq incomplete : " + str_data);
            }
      
            const insert_query = `
              INSERT INTO takes(ID, course_id, sec_id, semester, year) VALUES('s00000',$1,$2,'Spring',2024);
            `;
            pool.query(insert_query,[courseid,secid], (err, result) => {
              if (err) {
                return res.send("Error executing the query");
              }
      
              return res.send("Course registration successful");
            });
          });
        });
      });
      
  }

  catch (error) {
    res.send("User not logged in");
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
