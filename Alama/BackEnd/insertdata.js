const mysql = require('mysql2');
const fs = require('fs');

// 1️⃣ Read JSON file
const jsonData = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// 2️⃣ MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'alama',
  password: '12345678',
  database: 'alama'
});

// 3️⃣ Insert each record
jsonData.forEach((item) => {
  const query = `
    INSERT INTO students 
    (s_no, name_of_students, centre_name, pro, level, std_cat, seat, batch, row_no, roll_no, marks, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    item.s_no,
    item.name_of_students,
    item.centre_name,
    item.pro,
    item.level,
    item.std_cat,
    item.seat,
    item.batch,
    item.row_no,
    item.roll_no,
    item.marks,
    item.position
  ];

  connection.query(query, values, (err) => {
    if (err) console.error('Error inserting row:', err);
  });
});

console.log('✅ All data inserted successfully!');
connection.end();
