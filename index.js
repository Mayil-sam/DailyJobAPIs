const express = require('express');
const cors = require('cors');
const { connectToDB, sql } = require('./db');

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 3000;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

app.get('/', (req, res) => {
  res.send('Azure SQL API is running!');
});
app.get('/Test', async (req, res) =>{
    res.json({ message: 'Locations endpoint is working!' });
});

app.get('/locations', async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM [dbo].[locations]');
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).send('Server error');
  }
});

app.get('/users', async (req, res) => {
  try {
    const result = await sql.query('select * from [dbo].[users]');
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).send('Server error');
  }
});

app.get('/dailyJobs', async (req, res) => {
  try {
    const result = await sql.query('select * from [dbo].[orders]');
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).send('Server error');
  }
});

app.post('/register', async (req, res) => {
  const { username, password, full_name, mobile_number, email } = req.body;

  if (!username || !password || !full_name || !mobile_number || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const checkUser = await sql.query`
      SELECT * FROM [dbo].[users] WHERE username = ${username}
    `;

    if (checkUser.recordset.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    await sql.query`
      INSERT INTO [dbo].[users] 
        (username, password, full_name, role, location_id, mobile_number, email)
      VALUES 
        (${username}, ${password}, ${full_name}, 'staff', 1, ${mobile_number}, ${email})
    `;

    res.status(200).json({ message: 'User registered successfully',issuccess: true });

  } catch (err) {
    console.error('SQL Insert Error:', err);
    res.status(500).json({ error: 'Error inserting user' });
  }
});


app.post('/createdailyjob', async (req, res) => {
  const {
    order_date,
    delivery_order_number,
    repair_order_number,
    work_desc,
    amount,
    done_by_user_id,
    lpo_number,
    rlpo,
    cheque_number,
    cheque_date,
    cheque_amount
  } = req.body;

  try {
    await sql.query`
      INSERT INTO [dbo].[orders] (
        order_date,
        location_id,
        delivery_order_number,
        repair_order_number,
        work_desc,
        amount,
        done_by_user_id,
        given_by_user_id,
        lpo_number,
        rlpo,
        cheque_number,
        cheque_date,
        cheque_amount,
        created_at
      ) VALUES (
        ${order_date},
        1,
        ${delivery_order_number},
        ${repair_order_number},
        ${work_desc},
        ${amount},
        ${done_by_user_id},
        NULL,
        ${lpo_number},
        ${rlpo},
        ${cheque_number},
        ${cheque_date},
        ${cheque_amount},
        GETDATE()
      );
    `;

    res.status(200).json({ message: 'Job inserted successfully' });
  } catch (err) {
    console.error('SQL Insert Error in /orders:', err);
    res.status(500).json({ error: 'Failed to insert Job' });
  }
});



app.post('/Login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await sql.query`
      SELECT user_id, full_name, role, status
      FROM [dbo].[users]
      WHERE username = ${username} AND password = ${password}
    `;

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    return res.status(200).json({ message: 'Login successful', user: result.recordset[0] });
  } catch (err) {
    console.error('SQL error in /Login:', err);
    res.status(500).send('Server error');
  }
});


// Connect to DB and start server
connectToDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to DB:', err);
  });
