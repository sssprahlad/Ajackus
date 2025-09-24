import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddUserForm from './AddUserForm';
import "./Home.css";
import { api, DELETE_USER_API, UPDATE_USER_API } from '../../utils/Constants';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SEARCH_API } from '../../utils/Constants';

const Home = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [filterData, setFilterData] = useState('');
    const [userManagement, setUserManagement] = useState([]); 
    const [editingId, setEditingId] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    
    const toggleAddUserForm = () => {
        setShowAddUserForm(prev => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };


    const [isLoading, setIsLoading] = useState(true);
    
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    

    const fetchUsers = async (page = 1) => {
        setIsLoading(true);
        try {
            let response;
            
            if (searchTerm || filterData) {
                const searchParams = new URLSearchParams({
                    q: searchTerm || '',
                    filter: filterData || '',
                    page,
                    limit: itemsPerPage
                });
                response = await api.get(`${SEARCH_API}?${searchParams}`);
            } else {
                const params = new URLSearchParams({
                    page,
                    limit: itemsPerPage
                });
                response = await api.get(`${SEARCH_API}?${params}`);
            }
            
            setUserManagement(response.data.users || response.data.results || []);
            setTotalItems(response.data.total || 0);
            
           
            if (response.data.page && response.data.page !== currentPage) {
                setCurrentPage(response.data.page);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
            setUserManagement([]);
            setTotalItems(0);
        } finally {
            setIsLoading(false);
        }
    };

    console.log(userManagement, 'userManagement');
    
   
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        fetchUsers(pageNumber);
    };
    
  
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchUsers(1);
        }, 300);
        
        return () => clearTimeout(timer);
     
    }, [searchTerm, filterData]);
    

    useEffect(() => {
        fetchUsers(currentPage);
    }, []);

    const handleEditUser = (user) => {
        setEditingId(user.id);
        setEditingUser({...user});
    };


    const handleSaveUser = async (userId) => {
        try {
            await api.patch(`${UPDATE_USER_API}/${userId}`, editingUser);
            toast.success('User updated successfully');
            setEditingId(null);
            setEditingUser(null);
            fetchUsers(currentPage);
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingUser(null);
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`${DELETE_USER_API}/${userId}`);
                toast.success('User deleted successfully');
              
                if (userManagement.length === 1 && currentPage > 1) {
                    handlePageChange(currentPage - 1);
                } else {
                    fetchUsers(currentPage);
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };
    console.log(filterData)




    useEffect(() => {
    
}, [searchTerm, filterData]);

    return (
        <div className="home-container">
            <header className="header">
                <h1>User Management System</h1>
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </header>
            
            <div className="content-container">
                
                <div className="controls-container">
                    <div className="search-container">
                        <input
                            type="search"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    
                    <div className="action-buttons">
                        <div className="filter-container">
                            <select 
                                className="filter-select"
                                onChange={(e) => setFilterData(e.target.value)} 
                                value={filterData}
                            >
                                <option value="">Filter by</option>
                                <option value="firstname">First Name</option>
                                <option value="lastname">Last Name</option>
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                                <option value="department">Department</option>
                            </select>
                        </div>

                        <div className="dropdown-container">
                            <button 
                                className="add-user-button"
                                onClick={toggleAddUserForm}
                            >
                                <span className="button-icon">+</span>
                                Add User
                                <span className="dropdown-arrow">▼</span>
                            </button>
                            {showAddUserForm && (
                                <AddUserForm 
                                    fetchUsers={fetchUsers}
                                    onClose={() => setShowAddUserForm(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className='content-container'>
                <div className="table-container">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading users...</p>
                    </div>
                ) : userManagement.length === 0 ? (
                    <div className="empty-state">
                        <p>No users found</p>
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="clear-search-btn"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Department</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
{/* {userManagement.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user) => ( */}
{userManagement?.map((user) => (
                                    <tr key={user.id} className={editingId === user.id ? 'editing' : ''}>
                                        <td>{user.id}</td>
                                        <td>
                                            <input 
                                                type="text" 
                                                value={editingId === user.id ? (editingUser?.firstname || '') : (user.firstname || '')} 
                                                readOnly={editingId !== user.id}
                                                onChange={(e) => setEditingUser({...editingUser, firstname: e.target.value})}
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                type="text" 
                                                value={editingId === user.id ? (editingUser?.lastname || '') : (user.lastname || '')} 
                                                readOnly={editingId !== user.id}
                                                onChange={(e) => setEditingUser({...editingUser, lastname: e.target.value})}
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                type="email" 
                                                value={editingId === user.id ? (editingUser?.email || '') : (user.email || '')} 
                                                readOnly={editingId !== user.id}
                                                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                type="tel" 
                                                value={editingId === user.id ? (editingUser?.phone || '') : (user.phone || '')} 
                                                readOnly={editingId !== user.id}
                                                onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                type="text" 
                                                value={editingId === user.id ? (editingUser?.department || '') : (user.department || '')} 
                                                readOnly={editingId !== user.id}
                                                onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                                            />
                                        </td>
                                        <td className="action-buttons">
                                            {editingId === user.id ? (
                                                <>
                                                    <button className="btn-save" onClick={() => handleSaveUser(user.id)}>Save</button>
                                                    <button className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="btn-edit" onClick={() => handleEditUser(user)}>Edit</button>
                                                    <button className="btn-delete" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="pagination-container">
                            <div className="pagination-info">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                            </div>
                            
                            <div className="pagination">
                                <button 
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="pagination-button"
                                    title="First Page"
                                >
                                    &laquo;
                                </button>
                                <button 
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="pagination-button"
                                    title="Previous Page"
                                >
                                    &lsaquo;
                                </button>
                                
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                                            aria-current={currentPage === pageNum ? 'page' : undefined}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                
                                <button 
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="pagination-button"
                                    title="Next Page"
                                >
                                    &rsaquo;
                                </button>
                                <button 
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="pagination-button"
                                    title="Last Page"
                                >
                                    &raquo;
                                </button>
                            </div>
                        </div>
                        
                    </>
                )}
                </div>
            </div>
        </div>
    );
}

export default Home;