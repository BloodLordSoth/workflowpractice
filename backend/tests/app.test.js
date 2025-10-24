import request from 'supertest'
import app from '../app.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()
let token;
const __file = fileURLToPath(import.meta.url)
const __dir = path.dirname(__file)


beforeAll(() => {
        const user = { name : 'coolguy' }
        token = jwt.sign(user, process.env.SECRET_ACCESS_KEY, { expiresIn: '10m' })
    });

describe('/POST register endpoint', () => {

    describe('No username sent', () => {
        test('Should return 401 statusCode', async () => {
            const res = await request(app).post('/register').send({
                username: 'lordsoth'
            })
            expect(res.statusCode).toBe(401)
        })
    })

    describe('password length less than 8', () => {
        test('should return 401 statusCode', async () => {
            const res = await request(app).post('/register').send({
                username: 'lordsoth',
                password: 'hey'
            })
            expect(res.statusCode).toBe(401)
        })
    })

    describe('password and username already registered', () => { 
        test('should return 409 status', async () => {
            const res = await request(app).post('/register').send({
                username: 'lordsoth',
                password: 'password123'
            })
            expect(res.statusCode).toBe(409)
        })
    })

})


describe('/POST login endpoint', () => {

    describe('If no username given', () => {
        test('should return 401', async () => {
            const res = await request(app).post('/login').send({
                password: 'password123'
            })
            expect(res.statusCode).toBe(401)
        })
    })

    describe('If no user is found', () => {
        test('should return 404', async () => {
            const res = await request(app).post('/login').send({
                username: 'beetlejuice',
                password: 'password123'
            })
            expect(res.statusCode).toBe(404)
        })
    })

    describe('If invalid password', () => {
        test('should return 403', async () => {
            const res = await request(app).post('/login').send({
                username: 'lordsoth',
                password: 'password1'
            })
            expect(res.statusCode).toBe(403)
        })
    })

    describe('successful login', () => {
        test('should return 200', async () => {
            const res = await request(app).post('/login').send({
                username: 'lordsoth',
                password: 'password123'
            })
            expect(res.statusCode).toBe(200)
        })
    })

    describe('successful login json response', () => {
        test('should return valid json', async () => {
            const res = await request(app).post('/login').send({
                username: "lordsoth",
                password: 'password123'
            })
            expect(res.headers['content-type']).toEqual(expect.stringContaining('json'))
        })
    })
})

describe('/POST upload endpoint', () => {

    describe('with no image', () => {
        test('should return 401', async () => {
            const res = await request(app).post('/upload').set({ 'Authorization': `Bearer ${token}` })
            expect(res.statusCode).toBe(401)
        })
    })


})