const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { resolve } = require('path');
const { v4: uuidv4 } = require('uuid');

const initializeUsersTable = () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, function(err) {
            if (err) {
                console.error('Error creating users table:', err.message);
                reject(err);
            } else {
                console.log('Users table is ready');
                resolve();
            }
        });
    });
};

initializeUsersTable().catch(console.error);

class Users {
    static async register(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (username, password) VALUES (?, ?)`, 
                [username, hashedPassword],
                function(err) {
                    if (err) {
                        if (err.message.includes('UNIQUE constraint failed')) {
                            reject(new Error('Username already exists'));
                        } else {
                            console.error('Error registering user:', err.message);
                            reject(err);
                        }
                    } else {
                        resolve({ id: this.lastID, username });
                    }
                }
            );
        });

    }


    static async login(username, password) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE username = ?',
                [username],
                async (err, user) => {
                    if (err) {
                        console.error('Database error during login:', err.message);
                        return reject(new Error('Error during login'));
                    }

                    if (!user) {
                        return reject(new Error('Invalid credentials'));
                    }

                    try {
                        const isPasswordValid = await bcrypt.compare(password, user.password);
                        
                        if (!isPasswordValid) {
                            return reject(new Error('Invalid credentials'));
                        }

                        const { password: _, ...userWithoutPassword } = user;
                        resolve(userWithoutPassword);
                        
                    } catch (error) {
                        console.error('Error during password comparison:', error);
                        reject(new Error('Error during authentication'));
                    }
                }
            );
        });
    }


}

module.exports = Users;




