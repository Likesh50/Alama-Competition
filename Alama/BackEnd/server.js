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
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const db = mysql.createConnection({
  host: 'srv1639.hstgr.io',
  user: 'u347524458_developer',
  password: 'Alamatn@24', 
  database: 'u347524458_alamatn'
});


db.connect((err) => {
  if (err) {
      console.error('Database connection failed:', err); 
  } else {
      console.log('Connected to the database'); 
  }
});


app.get('/', (req, res) => {
  res.send('Hello, World! Your server is working.');
});

const upload = multer({ dest: 'uploads/' });


app.post('/upload', async (req, res) => {
  const excelData = req.body.data; 

  if (!excelData || !Array.isArray(excelData)) {
    return res.status(400).send('Invalid or missing data');
  }

  try {
    await Promise.all(excelData.map(async (row) => {
      Object.keys(row).forEach((key) => {
        if (typeof row[key] === 'string') {
          row[key] = row[key].trim();
        }
      });

      const marks = isNaN(row.marks) ? 0 : Number(row.marks);
      row.marks = marks;

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
    res.status(500).send('Internal Server Error');
  }
});


  // app.post('/updatePositions', async (req, res) => {
  
  //   const { marksData } = req.body;  
  
  //   try {
  //     const updateMarksPromises = marksData.map(({ seat, marks }) => {
  //       const parsedMarks = isNaN(parseInt(marks, 10)) ? 0 : parseInt(marks, 10);
  //       const updateQuery = 'UPDATE students SET marks = ? WHERE seat = ?';
  //       return db.promise().query(updateQuery, [parsedMarks, seat]);
  //     });
  //     await Promise.all(updateMarksPromises);
  
  //     const [students] = await db.promise().query(`
  //       WITH RankedStudents AS (
  //         SELECT 
  //           seat,
  //           marks,
  //           pro,
  //           level,
  //           std_cat,
  //           RANK() OVER (PARTITION BY pro, level, std_cat ORDER BY marks DESC) AS student_rank
  //         FROM 
  //           students
  //       )
  //       SELECT 
  //         seat,
  //         marks,
  //         CASE 
  //           WHEN student_rank <= 20 THEN 'winner'
  //           WHEN student_rank > 20 AND student_rank <= 40 THEN 'runnerUp'
  //           WHEN student_rank > 40 AND student_rank <= 60 THEN 'runner2' 
  //           ELSE '-' 
  //         END AS position
  //       FROM 
  //         RankedStudents
  //       WHERE 
  //         student_rank >= 0
  //     `);
  
  //     const updatePositionsAndMarksPromises = students.map(student => {
  //       const parsedMarks = isNaN(parseInt(student.marks, 10)) ? 0 : parseInt(student.marks, 10);
  //       const updateQuery = 'UPDATE students SET position = ?, marks = ? WHERE seat = ?';
  //       return db.promise().query(updateQuery, [student.position, parsedMarks, student.seat]);
  //     });
  
  //     await Promise.all(updatePositionsAndMarksPromises);
  
  //     res.send('Student marks and positions updated successfully');
  //   } catch (err) {
  //     res.status(500).send('Error updating student marks and positions');
  //   }
  // });
      
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

app.delete('/students', async (req, res) => {
  try {
    const deleteQuery = 'DELETE FROM students';
    await db.promise().query(deleteQuery);
    res.send('All records deleted successfully');
  } catch (err) {
    console.error('Error deleting records:', err);
    res.status(500).send('Error deleting records');
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
            WHEN position = 'champion' THEN 1
            WHEN position = 'winner' THEN 2
            WHEN position = 'runnerUp' THEN 3
            WHEN position = 'runner2' THEN 4
            ELSE 5
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

    app.get('/count', async (req, res) => {
      try {
        const [result] = await db.promise().query('SELECT COUNT(*) AS count FROM students');
        const count = result[0].count;
        res.json({ count });
      } catch (error) {
        console.error('Error fetching count:', error.message); // Log the error message
        console.error(error); // Log the full error object for more details
        res.status(500).json({ error: 'Failed to fetch student count' });
      }
    });
    

    app.delete('/students', async (req, res) => {
      try {
        await db.query('DELETE FROM students');
        
        res.json({ message: 'All records deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete student records' });
      }
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

  const centers=[
    {
      "name": "ALAMA - PALLIKONDA",
      "strength": 10,
      "champion": 0,
      "winner": 1,
      "runner": 2,
      "runner_1": 2
    },
    {
      "name": "ALAMA USOOR",
      "strength": 8,
      "champion": 0,
      "winner": 1,
      "runner": 2,
      "runner_1": 2
    },
    {
      "name": "ALAMA-SAINATHAPURAM",
      "strength": 19,
      "champion": 2,
      "winner": 3,
      "runner": 4,
      "runner_1": 4
    },
    {
      "name": "CHINNU'S PENTECH",
      "strength": 8,
      "champion": 0,
      "winner": 1,
      "runner": 2,
      "runner_1": 2
    },
    {
      "name": "DESIA SAINATHAPURAM",
      "strength": 46,
      "champion": 2,
      "winner": 5,
      "runner": 10,
      "runner_1": 15
    },
    {
      "name": "DESIA SCHOOLS",
      "strength": 82,
      "champion": 2,
      "winner": 10,
      "runner": 15,
      "runner_1": 20
    },
    {
      "name": "HOLY CROSS MAT HR SEC SCHOOL(VELLORE)",
      "strength": 122,
      "champion": 4,
      "winner": 12,
      "runner": 22,
      "runner_1": 33
    },
    {
      "name": "HOLY CROSS MATRIC HR.SEC.SCHOOL- DINIGUL",
      "strength": 15,
      "champion": 1,
      "winner": 2,
      "runner": 3,
      "runner_1": 4
    },
    {
      "name": "JAI DHAKSHAYA INSTITUTE",
      "strength": 19,
      "champion": 1,
      "winner": 2,
      "runner": 4,
      "runner_1": 6
    },
    {
      "name": "KASTHURI N&P SCHOOL",
      "strength": 49,
      "champion": 1,
      "winner": 4,
      "runner": 8,
      "runner_1": 11
    },
    {
      "name": "LOTUS N & P SCHOOL",
      "strength": 11,
      "champion": 0,
      "winner": 1,
      "runner": 2,
      "runner_1": 2
    },
    {
      "name": "OTOMATIKS ACTIVITY CENTER(VELLORE)",
      "strength": 16,
      "champion": 1,
      "winner": 2,
      "runner": 3,
      "runner_1": 4
    },
    {
      "name": "RATHINAGIRI BAGEERATHAN  Metric.Hr Sec SCHOOL",
      "strength": 123,
      "champion": 4,
      "winner": 13,
      "runner": 23,
      "runner_1": 33
    },
    {
      "name": "SAI  KRISHNA N & P SCHOOL",
      "strength": 27,
      "champion": 1,
      "winner": 2,
      "runner": 4,
      "runner_1": 8
    },
    {
      "name": "SARVESH ACADEMY",
      "strength": 16,
      "champion": 1,
      "winner": 2,
      "runner": 2,
      "runner_1": 5
    },
    {
      "name": "SNEHA DEEPAM MATRIC HR SEC SCHOOL",
      "strength": 40,
      "champion": 1,
      "winner": 4,
      "runner": 8,
      "runner_1": 10
    },
    {
      "name": "SRI ARUNACHALA VIDYALAYA N/P SCHOOL",
      "strength": 16,
      "champion": 1,
      "winner": 2,
      "runner": 2,
      "runner_1": 4
    },
    {
      "name": "SRI NARAYANI VIDYALAYA",
      "strength": 182,
      "champion": 5,
      "winner": 20,
      "runner": 32,
      "runner_1": 55
    },
    {
      "name": "SRI NARAYANI VIDYASHRAM SR.SEC.SCHOOL",
      "strength": 119,
      "champion": 5,
      "winner": 14,
      "runner": 23,
      "runner_1": 35
    },
    {
      "name": "SRI NEELAMEGAN BHARATH N & PSCHOOL",
      "strength": 62,
      "champion": 1,
      "winner": 6,
      "runner": 12,
      "runner_1": 14
    },
    {
      "name": "UNICORN ACADEMY",
      "strength": 13,
      "champion": 1,
      "winner": 2,
      "runner": 3,
      "runner_1": 3
    },
    {
      "name": "ALAMA-VALLALAR",
      "strength": 24,
      "champion": 1,
      "winner": 3,
      "runner": 5,
      "runner_1": 7
    },
    {
      "name": "VANI VIDYALAYA MATRIC HR SEC SCHOOL",
      "strength": 29,
      "champion": 1,
      "winner": 3,
      "runner": 6,
      "runner_1": 9
    },
    {
      "name": "VISHWA VIDHYALAYA",
      "strength": 44,
      "champion": 1,
      "winner": 3,
      "runner": 8,
      "runner_1": 12
    },
    {
      "name": "VVNKM SR SEC SCHOOL (CBSE)",
      "strength": 64,
      "champion": 2,
      "winner": 7,
      "runner": 13,
      "runner_1": 18
    },{
      "name": "ALAMA GUDIYATHAM",
      "strength": 46,
      "champion": 2,
      "winner": 6,
      "runner": 9,
      "runner_1": 13
  },
  {
      "name": "ALAMA- LALAPET",
      "strength": 18,
      "champion": 1,
      "winner": 2,
      "runner": 3,
      "runner_1": 4
  },
  {
      "name": "ALAMA- THIMIRI",
      "strength": 35,
      "champion": 1,
      "winner": 3,
      "runner": 7,
      "runner_1": 8
  },
  {
      "name": "C S I  SCHOOL",
      "strength": 6,
      "champion": 0,
      "winner": 1,
      "runner": 1,
      "runner_1": 2
  },
  {
      "name": "ALAMA-THIRUVALAM",
      "strength": 29,
      "champion": 1,
      "winner": 3,
      "runner": 5,
      "runner_1": 8
  },
  {
      "name": "ANICHAM ACADEMY ",
      "strength": 3,
      "champion": 0,
      "winner": 0,
      "runner": 1,
      "runner_1": 1
  },
  {
      "name": "ARCOT TALENT SCHOOL",
      "strength": 17,
      "champion": 0,
      "winner": 2,
      "runner": 3,
      "runner_1": 4
  },
  {
      "name": "ARCOT TALENT CENTER",
      "strength": 19,
      "champion": 1,
      "winner": 2,
      "runner": 3,
      "runner_1": 4
  },
  {
      "name": "ARISE & SHINE LEARNING POINT",
      "strength": 13,
      "champion": 1,
      "winner": 2,
      "runner": 2,
      "runner_1": 3
  },
  {
      "name": "ASHIRWAD INTERNATIONAL CBSE SCHOOL.",
      "strength": 42,
      "champion": 1,
      "winner": 5,
      "runner": 7,
      "runner_1": 11
  },
  {
      "name": "AYYAN EDUCATION  CENTRE ",
      "strength": 63,
      "champion": 2,
      "winner": 8,
      "runner": 12,
      "runner_1": 18
  },
  {
      "name": "ALAMA-BHEL RANIPET",
      "strength": 34,
      "champion": 2,
      "winner": 4,
      "runner": 7,
      "runner_1": 8
  },
  {
      "name": "BRUNDAVAN ENGLISH MEDIUM SCHOOL",
      "strength": 64,
      "champion": 1,
      "winner": 8,
      "runner": 10,
      "runner_1": 16
  },
  {
      "name": "G.VARADHARAJALU CHETTIAR Hr. Sec. SCHOOL   (E M)",
      "strength": 46,
      "champion": 1,
      "winner": 5,
      "runner": 8,
      "runner_1": 11
  },
  {
      "name": "G.VARADHARAJALU CHETTIAR Hr. Sec SCHOOL  (T M)",
      "strength": 30,
      "champion": 1,
      "winner": 3,
      "runner": 5,
      "runner_1": 7
  },
  {
      "name": "HINDU VIDHYALAYA CBSE SCHOOL",
      "strength": 80,
      "champion": 2,
      "winner": 9,
      "runner": 14,
      "runner_1": 18
  },
  {
      "name": "IMPERIALEDUCATION ACADEMY",
      "strength": 8,
      "champion": 0,
      "winner": 1,
      "runner": 2,
      "runner_1": 2
  },
  {
      "name": "KIDZEE PLAY SCHOOL",
      "strength": 13,
      "champion": 0,
      "winner": 1,
      "runner": 3,
      "runner_1": 3
  },
  {
      "name": "KKS MANI MATRIC HR.SEC.SCHOOL",
      "strength": 205,
      "champion": 6,
      "winner": 23,
      "runner": 35,
      "runner_1": 61
  },
  {
      "name": "LEADERS VIDHYASHRAM CBSE SCHOOL",
      "strength": 28,
      "champion": 1,
      "winner": 3,
      "runner": 5,
      "runner_1": 8
  },
  {
      "name": "MAHALAKSHMI VIDYASHRAM CBSE SCHOOL",
      "strength": 45,
      "champion": 1,
      "winner": 4,
      "runner": 8,
      "runner_1": 11
  },
  {
      "name": "MMES PUBLIC SCHOOL",
      "strength": 59,
      "champion": 1,
      "winner": 6,
      "runner": 10,
      "runner_1": 15
  },
  {
      "name": "MOTHER MATRIC HR SEC SCHOOL",
      "strength": 59,
      "champion": 1,
      "winner": 6,
      "runner": 10,
      "runner_1": 16
  },
  {
      "name": "MUGA TUTOR",
      "strength": 5,
      "champion": 0,
      "winner": 1,
      "runner": 1,
      "runner_1": 1
  },
  {
      "name": "NAMAKKAL TEACHERS VIDHYAASHRAM SCHOOL",
      "strength": 18,
      "champion": 1,
      "winner": 2,
      "runner": 3,
      "runner_1": 4
  },
  {
    "name": "PINKZ PUPLIC SCHOOL",
    "strength": 141,
    "champion": 4,
    "winner": 14,
    "runner": 25,
    "runner_1": 36
},
{
    "name": "QUEEN MARRYS  P&N SCHOOL",
    "strength": 26,
    "champion": 1,
    "winner": 2,
    "runner": 4,
    "runner_1": 7
},
{
    "name": "RAJ ACADEMY",
    "strength": 16,
    "champion": 0,
    "winner": 2,
    "runner": 3,
    "runner_1": 4
},
{
    "name": "RAMAKRISHNA SCHOOL (KANNAMANGALAM)",
    "strength": 27,
    "champion": 2,
    "winner": 4,
    "runner": 5,
    "runner_1": 7
},
{
    "name": "REWOD NURSERY AND PRIMRY SCHOOL",
    "strength": 17,
    "champion": 1,
    "winner": 2,
    "runner": 3,
    "runner_1": 3
},
{
    "name": "RISHI SCHOOL",
    "strength": 103,
    "champion": 3,
    "winner": 10,
    "runner": 16,
    "runner_1": 26
},
{
    "name": "SARASWATHI EDUCATION ACADAMY",
    "strength": 4,
    "champion": 0,
    "winner": 0,
    "runner": 1,
    "runner_1": 1
},
{
    "name": "SHRI RAMACHANDRA SCHOOL",
    "strength": 11,
    "champion": 1,
    "winner": 1,
    "runner": 2,
    "runner_1": 2
},
{
    "name": "SREE ABIRAAMI SCHOOL (CBSE)",
    "strength": 8,
    "champion": 0,
    "winner": 1,
    "runner": 2,
    "runner_1": 2
},
{
    "name": "SREE SAI ACADEMY (CHITTOOR)",
    "strength": 7,
    "champion": 0,
    "winner": 1,
    "runner": 1,
    "runner_1": 2
},
{
    "name": "SREE SAI ACADEMY(BRUNDAVAN SCHOOL",
    "strength": 5,
    "champion": 0,
    "winner": 1,
    "runner": 1,
    "runner_1": 1
},
{
    "name": "SRI ARUTSAI MAT.Hr.Sec.SCHOOL",
    "strength": 59,
    "champion": 1,
    "winner": 7,
    "runner": 10,
    "runner_1": 14
},
{
    "name": "SRI JAYAM NAMAKKAL MATRIC HR SEC SCHOOL",
    "strength": 49,
    "champion": 1,
    "winner": 6,
    "runner": 7,
    "runner_1": 12
},
{
    "name": "ST GEMMA MATRIC HR SEC SCHOOL",
    "strength": 24,
    "champion": 1,
    "winner": 3,
    "runner": 4,
    "runner_1": 6
},
{
    "name": "THE GEEKAY WORLD SCHOOL",
    "strength": 18,
    "champion": 1,
    "winner": 2,
    "runner": 3,
    "runner_1": 4
},
{
    "name": "TULIP INTERNATIONAL SCHOOL [CBSE]",
    "strength": 137,
    "champion": 6,
    "winner": 16,
    "runner": 26,
    "runner_1": 38
},
{
    "name": "V K V LALAPET",
    "strength": 8,
    "champion": 0,
    "winner": 1,
    "runner": 2,
    "runner_1": 2
},
{
    "name": "V.K.V MATRICULATION HIGH SCHOOL",
    "strength": 35,
    "champion": 1,
    "winner": 4,
    "runner": 6,
    "runner_1": 8
},
{
    "name": "VETRI EDUCATION CENTRE",
    "strength": 21,
    "champion": 1,
    "winner": 2,
    "runner": 3,
    "runner_1": 6
},
{
    "name": "VIDYA PEEDAM SENIOR SECONDARY SCHOOL",
    "strength": 15,
    "champion": 1,
    "winner": 3,
    "runner": 3,
    "runner_1": 3
},
{
    "name": "YASH ACADAMY",
    "strength": 2,
    "champion": 0,
    "winner": 0,
    "runner": 1,
    "runner_1": 0
},
{
    "name": "AISHWARYA SCHOOL (ATTUR)",
    "strength": 7,
    "champion": 0,
    "winner": 1,
    "runner": 1,
    "runner_1": 2
},
{
    "name": "AISHWARYA ACADEMY (ATTUR)",
    "strength": 10,
    "champion": 1,
    "winner": 1,
    "runner": 1,
    "runner_1": 2
},
{
    "name": "ALAMA - MADIPAKKAM",
    "strength": 14,
    "champion": 1,
    "winner": 2,
    "runner": 2,
    "runner_1": 4
},
{
    "name": "ALAMA - AMBUR",
    "strength": 36,
    "champion": 1,
    "winner": 5,
    "runner": 6,
    "runner_1": 10
},
{
  "name": "ALAMA ARAKKONAM",
  "strength": 100,
  "champion": 2,
  "winner": 10,
  "runner": 21,
  "runner_1": 32
},
{
  "name": "BLOSSOM ACTIVITY CENTRE ",
  "strength": 11,
  "champion": 1,
  "winner": 2,
  "runner": 2,
  "runner_1": 2
},
{
  "name": "DREAMZ INSTITUTE",
  "strength": 11,
  "champion": 1,
  "winner": 1,
  "runner": 2,
  "runner_1": 2
},
{
  "name": "OTOMATIKS ACTIVITY CENTER(CHENNAI)",
  "strength": 6,
  "champion": 1,
  "winner": 1,
  "runner": 1,
  "runner_1": 1
},
{
  "name": "SAI VIKETHA ACADEMY (POLUR)",
  "strength": 15,
  "champion": 1,
  "winner": 2,
  "runner": 3,
  "runner_1": 4
},
{
  "name": "ALAMA -SRIPERUMBADUR",
  "strength": 16,
  "champion": 1,
  "winner": 2,
  "runner": 3,
  "runner_1": 4
},
{
  "name": "SUCCESS MANTRA",
  "strength": 50,
  "champion": 2,
  "winner": 7,
  "runner": 10,
  "runner_1": 11
},
{
  "name": "THE ASHRAM SCHOOL ",
  "strength": 12,
  "champion": 1,
  "winner": 2,
  "runner": 2,
  "runner_1": 2
},
{
  "name": "ALAMA-TINDIVANAM",
  "strength": 17,
  "champion": 1,
  "winner": 3,
  "runner": 3,
  "runner_1": 4
},
{
  "name": "GRACE MHSS, RANIPET",
  "strength": 42,
  "champion": 1,
  "winner": 4,
  "runner": 8,
  "runner_1": 9
},
{
  "name": "AIMS CBSE SCHOOL",
  "strength": 34,
  "champion": 1,
  "winner": 4,
  "runner": 7,
  "runner_1": 9
}
  ];



  app.post('/updatePositions', async (req, res) => {
  
    const { marksData } = req.body;  

    try {
        const updateMarksPromises = marksData.map(({ seat, marks }) => {
            const parsedMarks = isNaN(parseInt(marks, 10)) ? 0 : parseInt(marks, 10);
            const updateQuery = 'UPDATE students SET marks = ?,position ="-" WHERE seat = ?';
            return db.promise().query(updateQuery, [parsedMarks, seat]);
        });
        
        await Promise.all(updateMarksPromises);

        res.send('Student marks updated successfully');
    } catch (err) {
        res.status(500).send('Error updating student marks');
    }
});

app.post('/calculatePositions', async (req, res) => {
  try {
      // Fetch students from the database
      const [students] = await db.promise().query('SELECT seat, marks, centre_name FROM students where marks>20');

      // Group students by center
      const groupedStudents = centers.reduce((acc, center) => {
          acc[center.name] = students.filter(student => student.centre_name === center.name);
          return acc;
      }, {});

      const updatePromises = [];

      // Calculate positions and update results for each center
      for (const center of centers) {
          const centerStudents = groupedStudents[center.name] || [];

          // Sort students by marks in descending order
          const sortedStudents = centerStudents.sort((a, b) => b.marks - a.marks);

          let championCount = 0;
          let winnerCount = 0;
          let runnerCount = 0;
          let runner1Count = 0;

          // Allocate positions based on defined limits
          for (const student of sortedStudents) {
              if (championCount < center.champion) {
                  updatePromises.push(db.promise().query('UPDATE students SET position = ? WHERE seat = ?', ['champion', student.seat]));
                  championCount++;
              } else if (winnerCount < center.winner) {
                  updatePromises.push(db.promise().query('UPDATE students SET position = ? WHERE seat = ?', ['winner', student.seat]));
                  winnerCount++;
              } else if (runnerCount < center.runner) {
                  updatePromises.push(db.promise().query('UPDATE students SET position = ? WHERE seat = ?', ['runner', student.seat]));
                  runnerCount++;
              } else if (runner1Count < center.runner_1) {
                  updatePromises.push(db.promise().query('UPDATE students SET position = ? WHERE seat = ?', ['runner_1', student.seat]));
                  runner1Count++;
              }
          }
      }

      // Execute all update queries
      await Promise.all(updatePromises);

      res.send('Positions calculated and updated successfully for all centers');
  } catch (err) {
      console.log(err);
      res.status(500).send('Error calculating positions');
  }
});

  app.post('/updatePositions-national', async (req, res) => {
  
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
  
  
  // app.get('/data2', (req, res) => {
  //   const query = `SELECT * 
  //   FROM students 
  //   ORDER BY 
  //       marks DESC    
  //   `;
  //       console.log("Hello");
  //       db.query(query, (err, results) => {
  //           if (err) {
  //               console.error('Error fetching data:', err);
  //               res.status(500).send('Error fetching data');
  //           } else {
  //               res.json(results);
  //           }
  //       });
  //   });
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

