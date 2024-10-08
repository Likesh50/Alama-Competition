const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = 5000;

// Enable CORS to allow React frontend access
app.use(cors());
app.use(express.json()); 


// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pass123', // Change this
    database: 'alama' // Change this
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to MySQL Database');
    }
});

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Endpoint for file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    const filePath = req.file.path;

    // Read Excel file
    const workbook = xlsx.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const sheet = workbook.Sheets[sheet_name_list[0]];
    const excelData = xlsx.utils.sheet_to_json(sheet);

    try {
        // Use Promise.all to wait for all insert/update operations to complete
        await Promise.all(excelData.map(async (row) => {
            const seat = row.seat;

            // Check if seat exists
            const checkQuery = 'SELECT * FROM students WHERE seat = ?';
            const [results] = await db.promise().query(checkQuery, [seat]);

            if (results.length > 0) {
                // Update existing row
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
                // Insert new row
                const insertQuery = 'INSERT INTO students SET ?';
                await db.promise().query(insertQuery, row);
            }
        }));

        // Send response only after all operations are done
        res.send('Data inserted/updated successfully');
    } catch (err) {
        console.error('Error processing data:', err);
        res.status(500).send('Error processing data');
    }
});
const determineCategory = (marks, level, grade) => {
    // Define the mark ranges and corresponding categories
    const levelGradeCategories = {
      "MA BASIC": {
        "III": [
          { range: [45, 75], category: "winner" },
          { range: [38, 44], category: "runnerUp" },
          { range: [30, 37], category: "runner2" }
        ],
        "IV": [
          { range: [45, 75], category: "winner" },
          { range: [38, 44], category: "runnerUp" },
          { range: [30, 37], category: "runner2" }
        ],
        "V": [
          { range: [48, 75], category: "winner" },
          { range: [40, 47], category: "runnerUp" },
          { range: [35, 39], category: "runner2" }
        ],
        "VI": [
          { range: [48, 75], category: "winner" },
          { range: [40, 47], category: "runnerUp" },
          { range: [35, 39], category: "runner2" }
        ],
        "VII": [
          { range: [50, 75], category: "winner" },
          { range: [45, 49], category: "runnerUp" },
          { range: [38, 44], category: "runner2" }
        ],
        "VIII": [
          { range: [50, 75], category: "winner" },
          { range: [45, 49], category: "runnerUp" },
          { range: [38, 44], category: "runner2" }
        ]
      },
      "MA 1": {
        "III": [
          { range: [50, 75], category: "winner" },
          { range: [45, 49], category: "runnerUp" },
          { range: [35, 44], category: "runner2" }
        ],
        "IV": [
          { range: [50, 75], category: "winner" },
          { range: [45, 49], category: "runnerUp" },
          { range: [35, 44], category: "runner2" }
        ],
        "V": [
          { range: [55, 75], category: "winner" },
          { range: [48, 54], category: "runnerUp" },
          { range: [38, 47], category: "runner2" }
        ],
        "VI": [
          { range: [55, 75], category: "winner" },
          { range: [48, 54], category: "runnerUp" },
          { range: [38, 47], category: "runner2" }
        ],
        "VII": [
          { range: [60, 75], category: "winner" },
          { range: [50, 59], category: "runnerUp" },
          { range: [45, 49], category: "runner2" }
        ],
        "VIII": [
          { range: [60, 75], category: "winner" },
          { range: [50, 59], category: "runnerUp" },
          { range: [45, 49], category: "runner2" }
        ]
      },
      "MA 2": {
        "III": [
          { range: [45, 75], category: "winner" },
          { range: [40, 44], category: "runnerUp" },
          { range: [35, 39], category: "runner2" }
        ],
        "IV": [
          { range: [45, 75], category: "winner" },
          { range: [40, 44], category: "runnerUp" },
          { range: [35, 39], category: "runner2" }
        ],
        "V": [
          { range: [49, 75], category: "winner" },
          { range: [42, 48], category: "runnerUp" },
          { range: [35, 41], category: "runner2" }
        ],
        "VI": [
          { range: [49, 75], category: "winner" },
          { range: [42, 48], category: "runnerUp" },
          { range: [35, 41], category: "runner2" }
        ],
        "VII": [
          { range: [52, 75], category: "winner" },
          { range: [44, 51], category: "runnerUp" },
          { range: [37, 43], category: "runner2" }
        ],
        "VIII": [
          { range: [52, 75], category: "winner" },
          { range: [44, 51], category: "runnerUp" },
          { range: [37, 43], category: "runner2" }
        ]
      },
      "MA 3": {
        "III": [
          { range: [40, 75], category: "winner" },
          { range: [30, 39], category: "runnerUp" },
          { range: [25, 29], category: "runner2" }
        ],
        "IV": [
          { range: [40, 75], category: "winner" },
          { range: [30, 39], category: "runnerUp" },
          { range: [25, 29], category: "runner2" }
        ],
        "V": [
          { range: [45, 75], category: "winner" },
          { range: [38, 44], category: "runnerUp" },
          { range: [32, 37], category: "runner2" }
        ],
        "VI": [
          { range: [45, 75], category: "winner" },
          { range: [38, 44], category: "runnerUp" },
          { range: [32, 37], category: "runner2" }
        ],
        "VII": [
          { range: [50, 75], category: "winner" },
          { range: [42, 49], category: "runnerUp" },
          { range: [35, 40], category: "runner2" }
        ],
        "VIII": [
          { range: [50, 75], category: "winner" },
          { range: [42, 49], category: "runnerUp" },
          { range: [35, 40], category: "runner2" }
        ]
      },
      "MA 4": {
        "IV": [
          { range: [40, 75], category: "winner" },
          { range: [30, 39], category: "runnerUp" },
          { range: [25, 29], category: "runner2" }
        ],
        "V": [
          { range: [45, 75], category: "winner" },
          { range: [38, 44], category: "runnerUp" },
          { range: [30, 37], category: "runner2" }
        ],
        "VI": [
          { range: [45, 75], category: "winner" },
          { range: [38, 44], category: "runnerUp" },
          { range: [30, 37], category: "runner2" }
        ],
        "VII": [
          { range: [48, 75], category: "winner" },
          { range: [40, 47], category: "runnerUp" },
          { range: [35, 39], category: "runner2" }
        ],
        "VIII": [
          { range: [48, 75], category: "winner" },
          { range: [40, 47], category: "runnerUp" },
          { range: [35, 39], category: "runner2" }
        ]
      },
      "MA 5": {
        "IV": [
          { range: [35, 75], category: "winner" },
          { range: [30, 34], category: "runnerUp" },
          { range: [25, 29], category: "runner2" }
        ],
        "V": [
          { range: [40, 75], category: "winner" },
          { range: [34, 39], category: "runnerUp" },
          { range: [30, 33], category: "runner2" }
        ],
        "VI": [
          { range: [40, 75], category: "winner" },
          { range: [34, 39], category: "runnerUp" },
          { range: [30, 33], category: "runner2" }
        ],
        "VII": [
          { range: [41, 75], category: "winner" },
          { range: [35, 40], category: "runnerUp" },
          { range: [30, 34], category: "runner2" }
        ],
        "VIII": [
          { range: [41, 75], category: "winner" },
          { range: [35, 40], category: "runnerUp" },
          { range: [30, 34], category: "runner2" }
        ]
      },
      "MA 6": {
        "IV": [
          { range: [35, 75], category: "winner" },
          { range: [30, 34], category: "runnerUp" },
          { range: [25, 29], category: "runner2" }
        ],
        "V": [
          { range: [40, 75], category: "winner" },
          { range: [34, 39], category: "runnerUp" },
          { range: [30, 33], category: "runner2" }
        ],
        "VI": [
          { range: [40, 75], category: "winner" },
          { range: [34, 39], category: "runnerUp" },
          { range: [30, 33], category: "runner2" }
        ],
        "VII": [
          { range: [41, 75], category: "winner" },
          { range: [35, 40], category: "runnerUp" },
          { range: [30, 34], category: "runner2" }
        ],
        "VIII": [
          { range: [41, 75], category: "winner" },
          { range: [35, 40], category: "runnerUp" },
          { range: [30, 34], category: "runner2" }
        ]
        
      },
      "PRE LEVEL": {
        "I": [
          { range: [50, 75], category: "winner" },
          { range: [40, 49], category: "runnerUp" },
          { range: [30, 39], category: "runner2" }
        ],
        "II": [
          { range: [50, 75], category: "winner" },
          { range: [40, 49], category: "runnerUp" },
          { range: [30, 39], category: "runner2" }
        ]
      },
      "AA BASIC": {
        "I": [
          { range: [50, 75], category: "winner" },
          { range: [40, 49], category: "runnerUp" },
          { range: [30, 39], category: "runner2" }
        ],
        "II": [
          { range: [50, 75], category: "winner" },
          { range: [40, 49], category: "runnerUp" },
          { range: [30, 39], category: "runner2" }
        ],
        "III": [
          { range: [55, 75], category: "winner" },
          { range: [48, 54], category: "runnerUp" },
          { range: [38, 44], category: "runner2" }
        ]
      },
      "AA 1": {
        "I": [
          { range: [48, 75], category: "winner" },
          { range: [38, 47], category: "runnerUp" },
          { range: [33, 37], category: "runner2" }
        ],
        "II": [
          { range: [48, 75], category: "winner" },
          { range: [38, 47], category: "runnerUp" },
          { range: [33, 37], category: "runner2" }
        ],
        "III": [
          { range: [50, 75], category: "winner" },
          { range: [40, 49], category: "runnerUp" },
          { range: [35, 39], category: "runner2" }
        ],
        "IV": [
          { range: [50, 75], category: "winner" },
          { range: [40, 49], category: "runnerUp" },
          { range: [35, 39], category: "runner2" }
        ]
      },
      "AA 2": {
        "I": [
          { range: [45, 75], category: "winner" },
          { range: [36, 44], category: "runnerUp" },
          { range: [31, 35], category: "runner2" }
        ],
        "II": [
          { range: [45, 75], category: "winner" },
          { range: [36, 44], category: "runnerUp" },
          { range: [31, 35], category: "runner2" }
        ],
        "III": [
          { range: [48, 75], category: "winner" },
          { range: [38, 47], category: "runnerUp" },
          { range: [35, 37], category: "runner2" }
        ],
        "IV": [
          { range: [48, 75], category: "winner" },
          { range: [38, 47], category: "runnerUp" },
          { range: [35, 37], category: "runner2" }
        ],
        "V": [
          { range: [55, 75], category: "winner" },
          { range: [48, 54], category: "runnerUp" },
          { range: [42, 47], category: "runner2" }
        ]
      },
      "AA 3": {
        "I": [
          { range: [45, 75], category: "winner" },
          { range: [36, 44], category: "runnerUp" },
          { range: [31, 35], category: "runner2" }
        ],
        "II": [
          { range: [45, 75], category: "winner" },
          { range: [36, 44], category: "runnerUp" },
          { range: [31, 35], category: "runner2" }
        ],
        "III": [
          { range: [48, 75], category: "winner" },
          { range: [38, 47], category: "runnerUp" },
          { range: [35, 37], category: "runner2" }
        ],
        "IV": [
          { range: [48, 75], category: "winner" },
          { range: [38, 47], category: "runnerUp" },
          { range: [35, 37], category: "runner2" }
        ],
        "V": [
          { range: [55, 75], category: "winner" },
          { range: [48, 54], category: "runnerUp" },
          { range: [42, 47], category: "runner2" }
        ]
      },
      "AA 4": {
        "I": [
          { range: [40, 75], category: "winner" },
          { range: [34, 39], category: "runnerUp" },
          { range: [30, 33], category: "runner2" }
        ],
        "II": [
          { range: [40, 75], category: "winner" },
          { range: [34, 39], category: "runnerUp" },
          { range: [30, 33], category: "runner2" }
        ],
        "III": [
          { range: [40, 75], category: "winner" },
          { range: [34, 39], category: "runnerUp" },
          { range: [30, 33], category: "runner2" }
        ],
        "IV": [
          { range: [40, 75], category: "winner" },
          { range: [34, 39], category: "runnerUp" },
          { range: [30, 33], category: "runner2" }
        ],
        "V": [
          { range: [50, 75], category: "winner" },
          { range: [45, 49], category: "runnerUp" },
          { range: [40, 44], category: "runner2" }
        ]
      },
      "AA 5": {
        "I": [
          { range: [40, 75], category: "winner" },
          { range: [30, 39], category: "runnerUp" },
          { range: [25, 29], category: "runner2" }
        ],
        "II": [
          { range: [40, 75], category: "winner" },
          { range: [30, 39], category: "runnerUp" },
          { range: [25, 29], category: "runner2" }
        ],
        "III": [
          { range: [40, 75], category: "winner" },
          { range: [30, 39], category: "runnerUp" },
          { range: [25, 29], category: "runner2" }
        ],
        "IV": [
          { range: [40, 75], category: "winner" },
          { range: [30, 39], category: "runnerUp" },
          { range: [25, 29], category: "runner2" }
        ],
        "V": [
          { range: [45, 75], category: "winner" },
          { range: [38, 44], category: "runnerUp" },
          { range: [32, 37], category: "runner2" }
        ]
      },
      "AA 6": {
        "I": [
          { range: [40, 75], category: "winner" },
          { range: [30, 39], category: "runnerUp" },
          { range: [25, 29], category: "runner2" }
        ],
        "II": [
          { range: [40, 75], category: "winner" },
          { range: [30, 39], category: "runnerUp" },
          { range: [25, 29], category: "runner2" }
        ],
        "III": [
          { range: [40, 75], category: "winner" },
          { range: [30, 39], category: "runnerUp" },
          { range: [25, 29], category: "runner2" }
        ],
        "IV": [
          { range: [40, 75], category: "winner" },
          { range: [30, 39], category: "runnerUp" },
          { range: [25, 29], category: "runner2" }
        ],
        "V": [
          { range: [45, 75], category: "winner" },
          { range: [38, 44], category: "runnerUp" },
          { range: [32, 37], category: "runner2" }
        ]
      }
    };
  
    // Check if the level and grade exist in the categories
    if (levelGradeCategories[level] && levelGradeCategories[level][grade]) {
      for (const { range, category } of levelGradeCategories[level][grade]) {
        if (marks >= range[0] && marks <= range[1]) {
          return category; // Return the matching category
        }
      }
    }
  
    return "-"; 
  };
  app.post('/updateMarks2', async (req, res) => {
    const { marksData } = req.body;
    console.log("Request received for updating marks");
    console.log(marksData);
  
    try {
      for (const { seat, marks } of marksData) {
        // Fetch the existing student data based on the seat
        const result = await db.promise().query('SELECT * FROM students WHERE seat = ?', [seat]);
        if (result[0].length === 0) {
          return res.status(404).send(`No student found with seat number: ${seat}`);
        }
  
        // Fetch the position for each seat using the ranking system
        const categorizeQuery = `
          WITH RankedStudents AS (
            SELECT 
              seat,
              marks,
              DENSE_RANK() OVER (ORDER BY marks DESC) AS rank
            FROM students
          ),
          WinnerCategory AS (
            SELECT 
              seat, marks, 'winner' AS category
            FROM RankedStudents
            WHERE rank <= 20 OR marks = (SELECT marks FROM RankedStudents WHERE rank = 20)
          ),
          RunnerUpCategory AS (
            SELECT 
              seat, marks, 'runnerUp' AS category
            FROM RankedStudents
            WHERE rank > 20 AND rank <= 40 OR (rank > 20 AND marks = (SELECT marks FROM RankedStudents WHERE rank = 40))
          ),
          Runner2Category AS (
            SELECT 
              seat, marks, 'runner2' AS category
            FROM RankedStudents
            WHERE rank > 40 AND rank <= 60 OR (rank > 40 AND marks = (SELECT marks FROM RankedStudents WHERE rank = 60))
          )
          SELECT * FROM WinnerCategory
          UNION ALL
          SELECT * FROM RunnerUpCategory
          UNION ALL
          SELECT * FROM Runner2Category;
        `;
  
        // Execute the categorization query
        const categorizedResult = await db.promise().query(categorizeQuery);
  
        // Now, based on the categorization, update the student records
        for (const student of categorizedResult[0]) {
          const updateQuery = `
            UPDATE students 
            SET marks = ?, position = ? 
            WHERE seat = ?;
          `;
          await db.promise().query(updateQuery, [marks, student.category, seat]);
        }
      }
  
      res.send('Marks updated and students categorized successfully');
    } catch (err) {
      console.error('Error updating marks and categorizing students:', err);
      res.status(500).send('Error updating marks and categorizing students');
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
  
  app.get('/data2', (req, res) => {
    const query = 'SELECT * FROM students';
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
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
