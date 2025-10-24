import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { AppError, UnauthorizedError, ForbiddenError, ConstraintError, NotFoundError } from './errors.js'
import { hashPass, checkHash } from './auth.js'
import { createUser, getUserData, insertImageDB, getUserImage } from './database.js'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
const storage = multer.memoryStorage()
const upload = multer({ storage })
const __file = fileURLToPath(import.meta.url)
const __dir = path.dirname(__file)
app.use(express.static('../frontend'))

const bucket = process.env.BUCKET
const region = process.env.BUCKET_REGION
const accessKey = process.env.BUCKET_ACCESS_KEY
const secretKey = process.env.BUCKET_SECRET_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey
    },
    region: region
})

//app.get('/', (req, res) => {
//    res.sendFile(__dir, 'index.html')
//})

app.post('/register', async (req, res, next) => {
    try {
        const { username, password } = req.body

        if (!username || !password) throw new UnauthorizedError();

        if (password.length < 8) throw new UnauthorizedError();

        const hash = await hashPass(password)
        createUser(username, hash)

        res.status(200).send('Registration success')
    }
    catch (e) {
        next(e)
    }
})

app.get('/users', authorization, (req, res, next) => {
    try {
        const username = req.user.name
        
        if (!username) throw new UnauthorizedError();

        const userData = getUserData(username)
        
        const imageData = getUserImage(username)

        res.set('Cache-Control', 'No-Cache')
        res.status(200).send({ user: userData.username, url: imageData })
    }
    catch (e) {
        next(e)
    }
})

app.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body

        if (!username || !password) throw new UnauthorizedError();

        const userData = getUserData(username)

        if (!userData) throw new NotFoundError();

        const hash = await checkHash(password, userData.password)

        if (!hash) throw new ForbiddenError();

        const user = { name: username }
        const accessKey = jwt.sign(user, process.env.SECRET_ACCESS_KEY, { expiresIn: '2m' })
        res.status(200).send({ accessKey: accessKey })
    }
    catch (e) {
        next(e)
    }
})

app.post('/tokencheck', authorization, (req, res, next) => {
    try {
        res.sendStatus(200)
    }
    catch (e) {
        next(e)
    }
})

app.post('/upload', authorization, upload.single('image'), async (req, res, next) => {
    try {
        const image = req.file
        const username = req.user.name

        if (!image || !username) throw new UnauthorizedError();

        const userData = getUserData(username)

        if (!userData) throw new NotFoundError();
        
        const fname = 'profilepic'
        const ext = path.extname(image.originalname)
        
        const params = {
            Bucket: bucket,
            Key: `profile/${fname}${ext}`,
            Body: image.buffer,
            ContentType: image.mimetype
        }

        const url = `http://${bucket}.s3.${region}.amazonaws.com/profile/${fname}${ext}`
        const command = new PutObjectCommand(params)
        await s3.send(command)
        insertImageDB(userData.id, fname, image.mimetype, url)
        res.status(200).send({ url: url })
    }
    catch (e) {
        console.log(e)
        next(e)
    }
})

function authorization(req, res, next) {
    const authHeader = req.headers['authorization']

    if (!authHeader) throw new UnauthorizedError();

    const token = authHeader.split(" ")[1]

    if (!token) throw new ForbiddenError();

    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) throw new ForbiddenError();
        req.user = user
        next()
    })
}


app.use((err, req, res, next) => {

    if (err.message.includes('UNIQUE constraint failed')) throw new ConstraintError()

    if (err instanceof AppError) {
        return res.status(err.statusCode).send({ error: err.message })
    }

    console.log(err)
    res.status(500).send({ error: 'There was a server issue.' })
})

export default app;