const UserManagement = require('../models/UserManagement');


exports.manageUser = async (req, res) => {
    const { firstname, lastname, email, phone, department } = req.body;
    
    if (!firstname || !lastname || !email || !phone || !department) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    try {
        const user = await UserManagement.addUser(firstname, lastname, email, phone, department);
        res.status(201).json({ message: "User Added successfully", user });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: "Failed to add user" });
    }
}  


exports.getAllUsers = async (req,res) => {
    try {
        const users = await UserManagement.getAllUsersData();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
} 

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        
        const user = await UserManagement.getUserById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstname, lastname, email, phone, department } = req.body;
        
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        
        const requiredFields = ['firstname', 'lastname', 'email', 'phone', 'department'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: 'All fields are required', 
                missingFields 
            });
        }
        
        const updatedUser = await UserManagement.updateUser(
            id, 
            firstname, 
            lastname, 
            email, 
            phone, 
            department
        );
        
        res.status(200).json({ 
            message: 'User updated successfully', 
            user: updatedUser 
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ 
            message: 'Failed to update user', 
            error: error.message 
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        
        const user = await UserManagement.getUserById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        await UserManagement.deleteUser(id);
        
        res.status(200).json({ 
            message: 'User deleted successfully',
            userId: id
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            message: 'Failed to delete user',
            error: error.message
        });
    }

};



exports.searchQuery = async (req, res) => {
    try {
        const { q = '', filter = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        
        console.log('Search query:', { q, filter, page: pageNum, limit: limitNum });
        
        const searchTerm = q.trim();
        
        const { users, total, totalPages } = await UserManagement.searchQuery(
            searchTerm, 
            filter,
            pageNum,
            limitNum
        );
        
        res.status(200).json({
            message: users.length > 0 ? 'Search completed successfully' : 'No matching users found',
            count: users.length,
            total,
            page: pageNum,
            totalPages,
            users
        });
        
    } catch (error) {
        console.error('Error in searchQuery:', error);
        res.status(500).json({ 
            success: false,
            message: 'An error occurred while processing your search',
            error: error.message,
            results: []
        });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        
        const { users, total, totalPages } = await UserManagement.getAllUsersData(
            pageNum,
            limitNum
        );
        
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            count: users.length,
            total,
            page: pageNum,
            totalPages,
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};