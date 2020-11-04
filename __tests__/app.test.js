require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token;
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns rangers', async() => {

      const expectation = [
        {
          id: 1,
          name: 'Jason Lee Scott',
          ranger_color: 'red',
          favorite: false,
          owner_id: 1,
          order_appeared: 3,
        },
        {
          id: 2,
          name: 'Billy Cranston',
          ranger_color: 'blue',
          favorite: false,
          owner_id: 1,
          order_appeared: 5,
        },
        {
          id: 3,
          name: 'Trini Kwan',
          ranger_color: 'yellow',
          favorite: false,
          owner_id: 1,
          order_appeared: 1,
        },
        {
          id: 4,
          name: 'Zack Taylor',
          ranger_color: 'black',
          favorite: false,
          owner_id: 1,
          order_appeared: 4,
        },
        {
          id: 5,
          name: 'Kimberly Ann Hart',
          ranger_color: 'pink',
          favorite: false,
          owner_id: 1,
          order_appeared: 2,
        },
        {
          id: 6,
          name: 'Tommy Oliver',
          ranger_color: 'green',
          favorite: true,
          owner_id: 1,
          order_appeared: 6,
        },
      ];
      
      const data = await fakeRequest(app)
        .get('/rangers')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });

    test('returns a single red ranger', async() => {
      const expectation = {
        id: 1,
        name: 'Jason Lee Scott',
        ranger_color: 'red',
        favorite: false,
        owner_id: 1,
        order_appeared: 3,
      };

      const data = await fakeRequest(app)
        .get('/rangers/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('adds a single ranger to the database and returns it', async() => {
      const expectation = {
        id: 7,
        name: 'Donny Vu',
        ranger_color: 'RGB',
        favorite: true,
        owner_id: 1,
        order_appeared: 7,
      };

      const data = await fakeRequest(app)
        .post('/rangers')
        .send({
          id: 7,
          name: 'Donny Vu',
          ranger_color: 'RGB',
          favorite: true,
          owner_id: 1,
          order_appeared: 7,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const allRangers = await fakeRequest(app)
        .get('/rangers')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allRangers.body.length).toEqual(7);
    });

    test('updates a ranger by replacement and returns it', async() => {
      const expectation = {
        id: 1,
        name: 'Duck McGee',
        ranger_color: 'silver',
        favorite: false,
        order_appeared: 3,
        owner_id: 1,
      };

      const data = await fakeRequest(app)
        .put('/rangers/1')
        .send({ 
          name: 'Duck McGee',
          ranger_color: 'silver',
          favorite: false,
          order_appeared: 3,
          owner_id: 1,
        });
      await fakeRequest(app)
        .get('/rangers/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

    });

    test('deletes a single ranger from the db', async() => {
      const deletedItem =   {
        id: 5,
        name: 'Kimberly Ann Hart',
        ranger_color: 'pink',
        favorite: false,
        owner_id: 1,
        order_appeared: 2,
      };

      const data = await fakeRequest(app)
        .delete('/rangers/5')
        .expect('Content-Type', /json/)
        .expect(200);

      await fakeRequest(app)
        .get('/rangers')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(deletedItem);

    });
  });
});
