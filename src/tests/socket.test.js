const request = require('supertest');
const mongoose = require('mongoose');

// Use a test database
const dbUrl = 'mongodb://127.0.0.1:27017/test';
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Wait for database connection before running tests
beforeAll(async () => {
    await db.once('open', () => {
        console.log('Connected to test database');
    });
});

// Clear database before each test
beforeEach(async () => {
    await Message.deleteMany();
});

// Closle database connection after running tests
afterAll(async () => {
    await db.close();
});

describe('Messages API', () => {
    describe('GET /messages', () => {
        test('should return an empty array when there are no messages', async () => {
            const response = await request(app).get('/messages');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        test('should return all messages in the database', async () => {
            const messages = [
                { name: 'Alice', message: 'Hello' },
                { name: 'Bob', message: 'Hi' },
            ];
            await Message.insertMany(messages);

            const response = await request(app).get('/messages');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(messages);
        });
    });

    describe('POST /messages', () => {
        test('should create a new message', async () => {
            const message = { name: 'Alice', message: 'Hello' };

            const response = await request(app).post('/messages').send(message);
            expect(response.status).toBe(201);
            expect(response.body).toMatchObject(message);

            const savedMessage = await Message.findOne({ name: 'Alice' });
            expect(savedMessage).toMatchObject(message);
        });

        test('should return a 500 error when there is a server error', async () => {
            // Force an error by using an invalid property name
            const message = { name: 'Alice', text: 'Hello' };

            const response = await request(app).post('/messages').send(message);
            expect(response.status).toBe(500);
            expect(response.body).toMatchObject({ message: 'Server error' });
        });
    });
});
