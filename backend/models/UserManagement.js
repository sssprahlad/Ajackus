const db = require('../config/db');


const initializeUserManagement = () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS usersManagement (
                id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
                firstname TEXT NOT NULL,
                lastname TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                department TEXT NOT NULL
            )
        `)
    })
}

initializeUserManagement().catch(console.error);

class UserManagement {
    static async addUser(firstname, lastname, email, phone, department) {

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO usersManagement (firstname, lastname, email, phone, department) VALUES (?, ?, ?, ?, ?)`,
                [firstname, lastname, email, phone, department],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            )
            
        })
        
    }


    static getAllUsersData(page = 1, limit = 10, searchTerm = '', filter = '') {
        return new Promise((resolve, reject) => {
            
            db.get(
                `SELECT COUNT(*) as total FROM usersManagement`,
                [],
                (countErr, countResult) => {
                    if (countErr) {
                        reject(countErr);
                        return;
                    }

                    const total = countResult.total;
                    const offset = (page - 1) * limit;
                    
                  
                    db.all(
                        `SELECT * FROM usersManagement 
                         ORDER BY id DESC 
                         LIMIT ? OFFSET ?`,
                        [limit, offset],
                        (err, rows) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve({
                                    users: rows || [],
                                    total,
                                    page,
                                    totalPages: Math.ceil(total / limit)
                                });
                            }
                        }
                    );
                }
            );
        });
    }



    static getUserById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM usersManagement WHERE id = ?`,
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    static updateUser(id, firstname, lastname, email, phone, department) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE usersManagement 
                 SET firstname = ?, lastname = ?, email = ?, phone = ?, 
                     department = ?
                 WHERE id = ?`,
                [firstname, lastname, email, phone, department, id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, firstname, lastname, email, phone, department });
                    }
                }
            );
        });
    }

    static deleteUser(id) {
        return new Promise((resolve, reject) => {
            db.run(
                `DELETE FROM usersManagement WHERE id = ?`,
                [id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id });
                    }
                }
            );
        });
    }


    // static searchQuery(searchTerm = '', filter = '', page = 1, limit = 10) {
    //     console.log(searchTerm, filter, page, limit,"sai");
        
    //     return new Promise((resolve, reject) => {
    //         const offset = (page - 1) * limit;
    //         let baseQuery = 'FROM usersManagement';
    //         let whereClause = '';
    //         const params = [];
            
    //         if (searchTerm && searchTerm.trim() !== '') {
    //             const searchPattern = `%${searchTerm}%`;
    //             if (filter) {
    //                 whereClause = ` WHERE ${filter} LIKE ?`;
    //                 params.push(searchPattern);
    //             } else {
    //                 whereClause = ` WHERE firstname LIKE ? OR lastname LIKE ? OR email LIKE ? OR phone LIKE ? OR department LIKE ?`;
    //                 params.push(...Array(5).fill(searchPattern));
    //             }
    //         } else if (filter) {
    //             whereClause = ` WHERE ${filter} IS NOT NULL`;
    //         }

         
    //         db.get(
    //             `SELECT COUNT(*) as total ${baseQuery} ${whereClause}`,
    //             params,
    //             (countErr, countResult) => {
    //                 if (countErr) {
    //                     console.error('Error counting search results:', countErr);
    //                     reject(countErr);
    //                     return;
    //                 }

    //                 const total = countResult.total;
    //                 const paginationParams = [...params, limit, offset];
                    
    //                 let orderClause = 'ORDER BY ';
    //                 if (filter && searchTerm) {
    //                     orderClause += `${filter} ASC`;
    //                 } else {
    //                     orderClause += 'id DESC';
    //                 }
                    
    //                 db.all(
    //                     `SELECT * ${baseQuery} ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
    //                     paginationParams,
    //                     (err, rows) => {
    //                         if (err) {
    //                             console.error('Error in search query:', err);
    //                             reject(err);
    //                         } else {
    //                             resolve({
    //                                 users: rows || [],
    //                                 total,
    //                                 page,
    //                                 totalPages: Math.ceil(total / limit)
    //                             });
    //                         }
    //                     }
    //                 );
    //             }
    //         );
    //     });
    // }


    static searchQuery(searchTerm = '', filter = '', page = 1, limit = 10) {
        console.log('Search params:', { searchTerm, filter, page, limit });
        
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * limit;
            let baseQuery = 'FROM usersManagement';
            let whereClause = '';
            const params = [];
            
            
            if (searchTerm && searchTerm.trim() !== '') {
                const searchPattern = `%${searchTerm}%`;
                if (filter) {
                    whereClause = ` WHERE ${filter} LIKE ?`;
                    params.push(searchPattern);
                } else {
                    whereClause = ` WHERE firstname LIKE ? OR lastname LIKE ? OR email LIKE ? OR phone LIKE ? OR department LIKE ?`;
                    params.push(...Array(5).fill(searchPattern));
                }
            } else if (filter) {
                whereClause = '';
            }
    
            db.get(
                `SELECT COUNT(*) as total ${baseQuery} ${whereClause}`,
                params,
                (countErr, countResult) => {
                    if (countErr) {
                        console.error('Error counting search results:', countErr);
                        reject(countErr);
                        return;
                    }
    
                    const total = countResult.total || 0;
                    const paginationParams = [...params, limit, offset];
                    
                    let orderClause = 'ORDER BY ';
                    if (filter) {
                        orderClause += `${filter} ASC, id DESC`; 
                    } else {
                        orderClause += 'id DESC';
                    }
                    
                    db.all(
                        `SELECT * ${baseQuery} ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
                        paginationParams,
                        (err, rows) => {
                            if (err) {
                                console.error('Error in search query:', err);
                                reject(err);
                            } else {
                                resolve({
                                    users: rows || [],
                                    total,
                                    page,
                                    totalPages: Math.ceil(total / limit)
                                });
                            }
                        }
                    );
                }
            );
        });
    }

    




}


module.exports = UserManagement;