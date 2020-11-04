const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/rangers', async(req, res) => {
  try {
    const data = await client.query('SELECT * from rangers');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/rangers/:id', async(req, res) => {
  try {
    const rangerId = req.params.id;
  
    const data = await client.query('SELECT * FROM rangers WHERE rangers.id=$1', [rangerId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/rangers/', async(req, res) => {
  try {
    
    const newName = req.body.name;
    const newColor = req.body.ranger_color;
    const newFavorite = req.body.favorite;
    const newOrder = req.body.order_appeared;
    const newOwner = req.body.owner_id;

    const data = await client.query(`
      INSERT INTO rangers (name, ranger_color, favorite, order_appeared, owner_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`, 
    
    [newName, newColor, newFavorite, newOrder, newOwner]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// app.put('/rangers/:id', async(req, res) => {
//   try {
//     const newName = req.body.name;
//     const newColor = req.body.ranger_color;
//     const newFavorite = req.body.favorite;
//     const newOrder = req.body.order_appeared;
//     const newOwner = req.body.owner_id;

//     const data = await client.query(`
//     INSERT INTO rangers (name, ranger_color, favorite, order_appeared, owner_id)
//     VALUES ($1, $2, $3, $4, $5)
//     RETURNING *`,  
//     [newName, newColor, newFavorite, newOrder, newOwner]);

//     res.json(data.rows[0]);
//   } catch(e) {
//     res.status(500).json({ error: e.message });
//   }
// });

app.put('/rangers/:id', async(req, res) => {
  try {
    const newName = req.body.name;
    const newColor = req.body.ranger_color;
    const newFavorite = req.body.favorite;
    const newOwner = req.body.owner_id;
    const newOrderAppear = req.body.order_appeared;

    const data = await client.query(`
      UPDATE rangers
      SET name = $1, 
      ranger_color = $2,
      favorite = $3,
      order_appeared = $4,
      owner_id = $5
      WHERE rangers.id = $6
      RETURNING *;
    `, 
    [newName, newColor, newFavorite, newOrderAppear, newOwner, req.params.id]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/rangers/:id', async(req, res) => {
  try {
    const rangerId = req.params.id;

    const data = await client.query('DELETE from rangers WHERE rangers.id=$1 RETURNING *', [rangerId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
