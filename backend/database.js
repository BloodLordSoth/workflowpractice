import db from './schema.js'

export function createUser(user, pass) {
    const stmt = db.prepare(`
        INSERT INTO users (username, password)
        VALUES (?, ?)
        `)
    stmt.run(user, pass)
}

export function getUsers() {
    const userData = db.prepare('SELECT * FROM users').all()
    return userData
}

export function getUserData(user) {
    const data = db.prepare('SELECT * FROM users WHERE username = ?').get(user)
    return data
}

export function insertImageDB(id, name, mimetype, url){
    const stmt = db.prepare(`
        INSERT INTO images (user_id, image_name, mime_type, image_url)    
        VALUES (?, ?, ?, ?)
    `)
    stmt.run(id, name, mimetype, url)
}

export function getUserImage(user){
    const userData = db.prepare('SELECT * FROM users WHERE username = ?').get(user)
    const fname = 'profilepic'
    const imageData = db.prepare('SELECT * FROM images WHERE user_id = ? AND image_name = ?').get(userData.id, fname)
    return imageData.url
}