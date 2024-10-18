const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); 


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1207', 
    database: 'alama'
});

db.connect((err) => {
    if (err) {
        
    } else {
        
    }
});


const upload = multer({ dest: 'uploads/' });


app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
      return res.status(400).send('No file uploaded');
  }

  const filePath = req.file.path;

  const workbook = xlsx.readFile(filePath);
  const sheet_name_list = workbook.SheetNames;
  const sheet = workbook.Sheets[sheet_name_list[0]];
  const excelData = xlsx.utils.sheet_to_json(sheet);

  try {
      await Promise.all(excelData.map(async (row) => {
          Object.keys(row).forEach((key) => {
              if (typeof row[key] === 'string') {
                  row[key] = row[key].trim();
              }
          });

          const seat = row.seat;

          const checkQuery = 'SELECT * FROM students WHERE seat = ?';
          const [results] = await db.promise().query(checkQuery, [seat]);

          if (results.length > 0) {
              const updateQuery = `
                  UPDATE students SET 
                  name_of_students = ?, centre_name = ?, pro = ?, level = ?, std_cat = ?, batch = ?, row_no = ?, roll_no = ?, marks = ?, position = ?
                  WHERE seat = ?
              `;

              await db.promise().query(updateQuery, [
                  row.name_of_students,
                  row.centre_name,
                  row.pro,
                  row.level,
                  row.std_cat,
                  row.batch,
                  row.row_no,
                  row.roll_no,
                  row.marks,
                  row.position,
                  seat,
              ]);
          } else {
              const insertQuery = 'INSERT INTO students SET ?';
              await db.promise().query(insertQuery, row);
          }
      }));

      res.send('Data inserted/updated successfully');
  } catch (err) {
      res.status(500).send('Error processing data');
  }
});

  app.post('/updatePositions', async (req, res) => {
  
    const { marksData } = req.body;  
  
    try {
      const updateMarksPromises = marksData.map(({ seat, marks }) => {
        const parsedMarks = isNaN(parseInt(marks, 10)) ? 0 : parseInt(marks, 10);
        const updateQuery = 'UPDATE students SET marks = ? WHERE seat = ?';
        return db.promise().query(updateQuery, [parsedMarks, seat]);
      });
      await Promise.all(updateMarksPromises);
  
      const [students] = await db.promise().query(`
        WITH RankedStudents AS (
          SELECT 
            seat,
            marks,
            pro,
            level,
            std_cat,
            RANK() OVER (PARTITION BY pro, level, std_cat ORDER BY marks DESC) AS student_rank
          FROM 
            students
        )
        SELECT 
          seat,
          marks,
          CASE 
            WHEN student_rank <= 20 THEN 'winner'
            WHEN student_rank > 20 AND student_rank <= 40 THEN 'runnerUp'
            WHEN student_rank > 40 AND student_rank <= 60 THEN 'runner2' 
            ELSE '-' 
          END AS position
        FROM 
          RankedStudents
        WHERE 
          student_rank >= 0
      `);
  
      const updatePositionsAndMarksPromises = students.map(student => {
        const parsedMarks = isNaN(parseInt(student.marks, 10)) ? 0 : parseInt(student.marks, 10);
        const updateQuery = 'UPDATE students SET position = ?, marks = ? WHERE seat = ?';
        return db.promise().query(updateQuery, [student.position, parsedMarks, student.seat]);
      });
  
      await Promise.all(updatePositionsAndMarksPromises);
  
      res.send('Student marks and positions updated successfully');
    } catch (err) {
      res.status(500).send('Error updating student marks and positions');
    }
  });
      
    app.post('/updateMarks', async (req, res) => {
    const { marksData } = req.body;
  
    try {
      for (const { seat, marks } of marksData) {
        const result = await db.promise().query('SELECT * FROM students WHERE seat = ?', [seat]);
        if (result[0].length === 0) {
          return res.status(404).send(`No student found with seat number: ${seat}`);
        }
        
        const student = result[0][0];
        const position = determineCategory(marks, student.pro + " " + student.level, student.std_cat);
        
        const updateQuery = 'UPDATE students SET marks = ?, position = ? WHERE seat = ?';
        await db.promise().query(updateQuery, [marks, position, seat]);
      }
  
      res.send('Marks updated successfully');
    } catch (err) {
      res.status(500).send('Error updating marks');
    }
  });
  

app.get('/batches', async (req, res) => {
    try {
      const [batches] = await db.promise().query('SELECT DISTINCT batch FROM students');
      res.json(batches.map(row => row.batch));
    } catch (err) {
      res.status(500).send('Error fetching batches');
    }
  });

  
  app.get('/data', async (req, res) => {
    const batch = req.query.batch;
    try {
      const [students] = await db.promise().query('SELECT * FROM students WHERE batch = ?', [batch]);
      res.json(students);
    } catch (err) { 
      res.status(500).send('Error fetching students');
    }
  });

  app.post('/modifyPositions', async (req, res) => {
    const { positionData } = req.body;
  
  
    if (!Array.isArray(positionData)) {
      return res.status(400).send('Invalid data format');
    }
  
    try {
      const query = `UPDATE students SET position = ? WHERE seat = ?`;
      for (let record of positionData) {
        await db.execute(query, [record.position, record.seat]);
      }
      res.send('Positions updated successfully');
    } catch (error) {
      res.status(500).send('Error updating positions');
    }
  });
  
  
  app.get('/data2', (req, res) => {
    const query = `
    SELECT *
    FROM students
    ORDER BY 
        CASE 
            WHEN position = 'winner' THEN 1
            WHEN position = 'runnerUp' THEN 2
            WHEN position = 'runner2' THEN 3
            ELSE 4  
        END,
    marks DESC

    `;
        db.query(query, (err, results) => {
            if (err) {
                res.status(500).send('Error fetching data');
            } else {
                res.json(results);
            }
        });
    });


const determineCategory = (marks, level, grade) => {
    // Define the mark ranges and corresponding categories
    const levelGradeCategories = {
      "MA BASIC": {
        "III": [
          { range: [45, 75], category: "Winner" },
          { range: [38, 44], category: "Runner" },
          { range: [30, 37], category: "Runner 2" }
        ],
        "IV": [
          { range: [45, 75], category: "Winner" },
          { range: [38, 44], category: "Runner" },
          { range: [30, 37], category: "Runner 2" }
        ],
        "V": [
          { range: [48, 75], category: "Winner" },
          { range: [40, 47], category: "Runner" },
          { range: [35, 39], category: "Runner 2" }
        ],
        "VI": [
          { range: [48, 75], category: "Winner" },
          { range: [40, 47], category: "Runner" },
          { range: [35, 39], category: "Runner 2" }
        ],
        "VII": [
          { range: [50, 75], category: "Winner" },
          { range: [45, 49], category: "Runner" },
          { range: [38, 44], category: "Runner 2" }
        ],
        "VIII": [
          { range: [50, 75], category: "Winner" },
          { range: [45, 49], category: "Runner" },
          { range: [38, 44], category: "Runner 2" }
        ]
      },
      "MA 1": {
        "III": [
          { range: [50, 75], category: "Winner" },
          { range: [45, 49], category: "Runner" },
          { range: [35, 44], category: "Runner 2" }
        ],
        "IV": [
          { range: [50, 75], category: "Winner" },
          { range: [45, 49], category: "Runner" },
          { range: [35, 44], category: "Runner 2" }
        ],
        "V": [
          { range: [55, 75], category: "Winner" },
          { range: [48, 54], category: "Runner" },
          { range: [38, 47], category: "Runner 2" }
        ],
        "VI": [
          { range: [55, 75], category: "Winner" },
          { range: [48, 54], category: "Runner" },
          { range: [38, 47], category: "Runner 2" }
        ],
        "VII": [
          { range: [60, 75], category: "Winner" },
          { range: [50, 59], category: "Runner" },
          { range: [45, 49], category: "Runner 2" }
        ],
        "VIII": [
          { range: [60, 75], category: "Winner" },
          { range: [50, 59], category: "Runner" },
          { range: [45, 49], category: "Runner 2" }
        ]
      },
      "MA 2": {
        "III": [
          { range: [45, 75], category: "Winner" },
          { range: [40, 44], category: "Runner" },
          { range: [35, 39], category: "Runner 2" }
        ],
        "IV": [
          { range: [45, 75], category: "Winner" },
          { range: [40, 44], category: "Runner" },
          { range: [35, 39], category: "Runner 2" }
        ],
        "V": [
          { range: [49, 75], category: "Winner" },
          { range: [42, 48], category: "Runner" },
          { range: [35, 41], category: "Runner 2" }
        ],
        "VI": [
          { range: [49, 75], category: "Winner" },
          { range: [42, 48], category: "Runner" },
          { range: [35, 41], category: "Runner 2" }
        ],
        "VII": [
          { range: [52, 75], category: "Winner" },
          { range: [44, 51], category: "Runner" },
          { range: [37, 43], category: "Runner 2" }
        ],
        "VIII": [
          { range: [52, 75], category: "Winner" },
          { range: [44, 51], category: "Runner" },
          { range: [37, 43], category: "Runner 2" }
        ]
      },
      "MA 3": {
        "IV": [
          { range: [40, 75], category: "Winner" },
          { range: [30, 39], category: "Runner" },
          { range: [25, 29], category: "Runner 2" }
        ],
        "V": [
          { range: [45, 75], category: "Winner" },
          { range: [38, 44], category: "Runner" },
          { range: [32, 37], category: "Runner 2" }
        ],
        "VI": [
          { range: [45, 75], category: "Winner" },
          { range: [38, 44], category: "Runner" },
          { range: [32, 37], category: "Runner 2" }
        ],
        "VII": [
          { range: [50, 75], category: "Winner" },
          { range: [42, 49], category: "Runner" },
          { range: [35, 40], category: "Runner 2" }
        ],
        "VIII": [
          { range: [50, 75], category: "Winner" },
          { range: [42, 49], category: "Runner" },
          { range: [35, 40], category: "Runner 2" }
        ]
      },
      "MA 4": {
        "IV": [
          { range: [40, 75], category: "Winner" },
          { range: [30, 39], category: "Runner" },
          { range: [25, 29], category: "Runner 2" }
        ],
        "V": [
          { range: [45, 75], category: "Winner" },
          { range: [38, 44], category: "Runner" },
          { range: [30, 37], category: "Runner 2" }
        ],
        "VI": [
          { range: [45, 75], category: "Winner" },
          { range: [38, 44], category: "Runner" },
          { range: [30, 37], category: "Runner 2" }
        ],
        "VII": [
          { range: [48, 75], category: "Winner" },
          { range: [40, 47], category: "Runner" },
          { range: [35, 39], category: "Runner 2" }
        ],
        "VIII": [
          { range: [48, 75], category: "Winner" },
          { range: [40, 47], category: "Runner" },
          { range: [35, 39], category: "Runner 2" }
        ]
      },
      "MA 5": {
        "IV": [
          { range: [35, 75], category: "Winner" },
          { range: [30, 34], category: "Runner" },
          { range: [25, 29], category: "Runner 2" }
        ],
        "V": [
          { range: [40, 75], category: "Winner" },
          { range: [34, 39], category: "Runner" },
          { range: [30, 33], category: "Runner 2" }
        ],
        "VI": [
          { range: [40, 75], category: "Winner" },
          { range: [34, 39], category: "Runner" },
          { range: [30, 33], category: "Runner 2" }
        ],
        "VII": [
          { range: [41, 75], category: "Winner" },
          { range: [35, 40], category: "Runner" },
          { range: [30, 34], category: "Runner 2" }
        ],
        "VIII": [
          { range: [41, 75], category: "Winner" },
          { range: [35, 40], category: "Runner" },
          { range: [30, 34], category: "Runner 2" }
        ]
      },
      "MA 6": {
        "IV": [
          { range: [35, 75], category: "Winner" },
          { range: [30, 34], category: "Runner" },
          { range: [25, 29], category: "Runner 2" }
        ],
        "V": [
          { range: [40, 75], category: "Winner" },
          { range: [34, 39], category: "Runner" },
          { range: [30, 33], category: "Runner 2" }
        ],
        "VI": [
          { range: [40, 75], category: "Winner" },
          { range: [34, 39], category: "Runner" },
          { range: [30, 33], category: "Runner 2" }
        ],
        "VII": [
          { range: [41, 75], category: "Winner" },
          { range: [35, 40], category: "Runner" },
          { range: [30, 34], category: "Runner 2" }
        ],
        "VIII": [
          { range: [41, 75], category: "Winner" },
          { range: [35, 40], category: "Runner" },
          { range: [30, 34], category: "Runner 2" }
        ]
        
      },
      "PRE LEVEL": {
        "I": [
          { range: [50, 75], category: "Winner" },
          { range: [40, 49], category: "Runner" },
          { range: [30, 39], category: "Runner 2" }
        ],
        "II": [
          { range: [50, 75], category: "Winner" },
          { range: [40, 49], category: "Runner" },
          { range: [30, 39], category: "Runner 2" }
        ]
      },
      "AA BASIC": {
        "I": [
          { range: [50, 75], category: "Winner" },
          { range: [40, 49], category: "Runner" },
          { range: [30, 39], category: "Runner 2" }
        ],
        "II": [
          { range: [50, 75], category: "Winner" },
          { range: [40, 49], category: "Runner" },
          { range: [30, 39], category: "Runner 2" }
        ],
        "III": [
          { range: [55, 75], category: "Winner" },
          { range: [45, 54], category: "Runner" },
          { range: [38, 44], category: "Runner 2" }
        ]
      },
      "AA 1": {
        "I": [
          { range: [48, 75], category: "Winner" },
          { range: [38, 47], category: "Runner" },
          { range: [33, 37], category: "Runner 2" }
        ],
        "II": [
          { range: [48, 75], category: "Winner" },
          { range: [38, 47], category: "Runner" },
          { range: [33, 37], category: "Runner 2" }
        ],
        "III": [
          { range: [50, 75], category: "Winner" },
          { range: [40, 49], category: "Runner" },
          { range: [35, 39], category: "Runner 2" }
        ],
        "IV": [
          { range: [50, 75], category: "Winner" },
          { range: [40, 49], category: "Runner" },
          { range: [35, 39], category: "Runner 2" }
        ]
      },
      "AA 2": {
        "I": [
          { range: [45, 75], category: "Winner" },
          { range: [36, 44], category: "Runner" },
          { range: [31, 35], category: "Runner 2" }
        ],
        "II": [
          { range: [45, 75], category: "Winner" },
          { range: [36, 44], category: "Runner" },
          { range: [31, 35], category: "Runner 2" }
        ],
        "III": [
          { range: [48, 75], category: "Winner" },
          { range: [38, 47], category: "Runner" },
          { range: [35, 37], category: "Runner 2" }
        ],
        "IV": [
          { range: [48, 75], category: "Winner" },
          { range: [38, 47], category: "Runner" },
          { range: [35, 37], category: "Runner 2" }
        ],
        "V": [
          { range: [55, 75], category: "Winner" },
          { range: [48, 54], category: "Runner" },
          { range: [42, 47], category: "Runner 2" }
        ]
      },
      "AA 3": {
        "I": [
          { range: [45, 75], category: "Winner" },
          { range: [36, 44], category: "Runner" },
          { range: [31, 35], category: "Runner 2" }
        ],
        "II": [
          { range: [45, 75], category: "Winner" },
          { range: [36, 44], category: "Runner" },
          { range: [31, 35], category: "Runner 2" }
        ],
        "III": [
          { range: [48, 75], category: "Winner" },
          { range: [38, 47], category: "Runner" },
          { range: [35, 37], category: "Runner 2" }
        ],
        "IV": [
          { range: [48, 75], category: "Winner" },
          { range: [38, 47], category: "Runner" },
          { range: [35, 37], category: "Runner 2" }
        ],
        "V": [
          { range: [55, 75], category: "Winner" },
          { range: [48, 54], category: "Runner" },
          { range: [42, 47], category: "Runner 2" }
        ]
      },
      "AA 4": {
        "I": [
          { range: [40, 75], category: "Winner" },
          { range: [34, 39], category: "Runner" },
          { range: [30, 33], category: "Runner 2" }
        ],
        "II": [
          { range: [40, 75], category: "Winner" },
          { range: [34, 39], category: "Runner" },
          { range: [30, 33], category: "Runner 2" }
        ],
        "III": [
          { range: [40, 75], category: "Winner" },
          { range: [34, 39], category: "Runner" },
          { range: [30, 33], category: "Runner 2" }
        ],
        "IV": [
          { range: [40, 75], category: "Winner" },
          { range: [34, 39], category: "Runner" },
          { range: [30, 33], category: "Runner 2" }
        ],
        "V": [
          { range: [50, 75], category: "Winner" },
          { range: [45, 49], category: "Runner" },
          { range: [40, 44], category: "Runner 2" }
        ]
      },
      "AA 5": {
        "I": [
          { range: [40, 75], category: "Winner" },
          { range: [30, 39], category: "Runner" },
          { range: [25, 29], category: "Runner 2" }
        ],
        "II": [
          { range: [40, 75], category: "Winner" },
          { range: [30, 39], category: "Runner" },
          { range: [25, 29], category: "Runner 2" }
        ],
        "III": [
          { range: [40, 75], category: "Winner" },
          { range: [30, 39], category: "Runner" },
          { range: [25, 29], category: "Runner 2" }
        ],
        "IV": [
          { range: [40, 75], category: "Winner" },
          { range: [30, 39], category: "Runner" },
          { range: [25, 29], category: "Runner 2" }
        ],
        "V": [
          { range: [45, 75], category: "Winner" },
          { range: [38, 44], category: "Runner" },
          { range: [32, 37], category: "Runner 2" }
        ]
      },
      "AA 6": {
        "I": [
          { range: [40, 75], category: "Winner" },
          { range: [30, 39], category: "Runner" },
          { range: [25, 29], category: "Runner 2" }
        ],
        "II": [
          { range: [40, 75], category: "Winner" },
          { range: [30, 39], category: "Runner" },
          { range: [25, 29], category: "Runner 2" }
        ],
        "III": [
          { range: [40, 75], category: "Winner" },
          { range: [30, 39], category: "Runner" },
          { range: [25, 29], category: "Runner 2" }
        ],
        "IV": [
          { range: [40, 75], category: "Winner" },
          { range: [30, 39], category: "Runner" },
          { range: [25, 29], category: "Runner 2" }
        ],
        "V": [
          { range: [45, 75], category: "Winner" },
          { range: [38, 44], category: "Runner" },
          { range: [32, 37], category: "Runner 2" }
        ]
      }
    };
  
    if (levelGradeCategories[level] && levelGradeCategories[level][grade]) {
      for (const { range, category } of levelGradeCategories[level][grade]) {
        if (marks >= range[0] && marks <= range[1]) {
          return category; // Return the matching category
        }
      }
    }
  
    return "-"; 
  };
  app.post('/updatePositions', async (req, res) => {
    console.log("Request received to update student marks and positions");
  
    const { marksData } = req.body;  // Expecting an array of { seat, marks }
  
    try {
      // Update marks in the database first, ensuring the marks are treated as integers
      const updateMarksPromises = marksData.map(({ seat, marks }) => {
        // If marks is 'ab' or any other invalid value, set it to 0
        const parsedMarks = isNaN(parseInt(marks, 10)) ? 0 : parseInt(marks, 10);
        const updateQuery = 'UPDATE students SET marks = ? WHERE seat = ?';
        return db.promise().query(updateQuery, [parsedMarks, seat]);
      });
      await Promise.all(updateMarksPromises);
  
      // Now, fetch the top 60 students by marks, categorized by pro, level, and std_cat
      const [students] = await db.promise().query(`
        WITH RankedStudents AS (
          SELECT 
            seat,
            marks,
            pro,
            level,
            std_cat,
            RANK() OVER (PARTITION BY pro, level, std_cat ORDER BY marks DESC) AS student_rank
          FROM 
            students
        )
        SELECT 
          seat,
          marks,
          CASE 
            WHEN student_rank <= 20 THEN 'winner'
            WHEN student_rank > 20 AND student_rank <= 40 THEN 'runnerUp'
            WHEN student_rank > 40 AND student_rank <= 60 THEN 'runner2' 
            ELSE '-' 
          END AS position
        FROM 
          RankedStudents
        WHERE 
          student_rank >= 0
      `);
  
      // Prepare update query for both positions and marks
      const updatePositionsAndMarksPromises = students.map(student => {
        const parsedMarks = isNaN(parseInt(student.marks, 10)) ? 0 : parseInt(student.marks, 10);
        const updateQuery = 'UPDATE students SET position = ?, marks = ? WHERE seat = ?';
        return db.promise().query(updateQuery, [student.position, parsedMarks, student.seat]);
      });
  
      // Execute all position and marks update queries
      await Promise.all(updatePositionsAndMarksPromises);
  
      res.send('Student marks and positions updated successfully');
    } catch (err) {
      console.error('Error updating student marks and positions:', err);
      res.status(500).send('Error updating student marks and positions');
    }
  });
      
    app.post('/updateMarks', async (req, res) => {
    const { marksData } = req.body;
    console.log("Request received");
    console.log(marksData);
  
    try {
      for (const { seat, marks } of marksData) {
        // Fetch the existing student data based on the seat
        const result = await db.promise().query('SELECT * FROM students WHERE seat = ?', [seat]);
        if (result[0].length === 0) {
          return res.status(404).send(`No student found with seat number: ${seat}`);
        }
        
        const student = result[0][0];
        const position = determineCategory(marks, student.pro + " " + student.level, student.std_cat);
        
        // Prepare the update query with marks and position
        const updateQuery = 'UPDATE students SET marks = ?, position = ? WHERE seat = ?';
        await db.promise().query(updateQuery, [marks, position, seat]);
      }
  
      res.send('Marks updated successfully');
    } catch (err) {
      console.error('Error updating marks:', err);
      res.status(500).send('Error updating marks');
    }
  });
  

app.get('/batches', async (req, res) => {
    try {
      const [batches] = await db.promise().query('SELECT DISTINCT batch FROM students');
      res.json(batches.map(row => row.batch));
    } catch (err) {
      console.error('Error fetching batches:', err);
      res.status(500).send('Error fetching batches');
    }
  });

  
  app.get('/data', async (req, res) => {
    const batch = req.query.batch;
    try {
      const [students] = await db.promise().query('SELECT * FROM students WHERE batch = ?', [batch]);
      res.json(students);
    } catch (err) { 
      console.error('Error fetching student data:', err);
      res.status(500).send('Error fetching students');
    }
  });

  app.post('/modifyPositions', async (req, res) => {
    console.log(req.body);
    const { positionData } = req.body;
  
    console.log('Received position data:', positionData); // Log the incoming data
  
    if (!Array.isArray(positionData)) {
      return res.status(400).send('Invalid data format');
    }
  
    try {
      const query = `UPDATE students SET position = ? WHERE seat = ?`;
      for (let record of positionData) {
        console.log(`Updating seat ${record.seat} with position ${record.position}`);
        await db.execute(query, [record.position, record.seat]);
      }
      res.send('Positions updated successfully');
    } catch (error) {
      console.error('Error updating positions:', error);
      res.status(500).send('Error updating positions');
    }
  });
  
  
  app.get('/data2', (req, res) => {
    const query = `SELECT * 
    FROM students 
    ORDER BY 
        marks DESC    
    `;
        console.log("Hello");
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).send('Error fetching data');
            } else {
                res.json(results);
            }
        });
    });
// Start the server
const JWT_SECRET="alamacomp";
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE uname = ?', [username], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', err });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result[0];

    bcrypt.compare(password, user.pass, (err, isMatch) => {
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }


      const token = jwt.sign({ id: user.id, role: user.role,uname:user.uname }, JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token, role: user.role,uname:user.uname });
    });
  });
});


app.post('/signup', (req, res) => {
  const { username, password, role } = req.body;


  db.query('SELECT * FROM users WHERE uname = ?', [username], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', err });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query('INSERT INTO users (uname, pass, role) VALUES (?, ?, ?)', [username, hashedPassword, role], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error inserting user', err });
      }

      return res.status(201).json({ message: 'User created', role });
    });
  });
});

app.listen(PORT, () => {
    console.log("You r up!!!");
});

