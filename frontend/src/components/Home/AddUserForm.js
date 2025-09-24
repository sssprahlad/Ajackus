import React, { useState, useEffect } from 'react';
import './AddUserForm.css';
import { api, ADD_USER_API } from '../../utils/Constants';

const AddUserForm = ({ user, onClose, fetchUsers }) => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        department: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    console.log(formData,"formData");

    // useEffect(() => {
    //     if (user) {
    //         setFormData({
    //             firstname: user.firstname || '',
    //             lastname: user.lastname || '',
    //             email: user.email || '',
    //             phone: user.phone || '',
    //             website: user.website || '',
    //             company: user.company || '',
    //             city: user.city || '',
    //             department: user.department || ''
    //         });
    //     }
    // }, [user]);

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.firstname.trim()) newErrors.firstname = 'Name is required';
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        
      
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddUser = async (e) => {
        console.log("add user btn clicked");
        e.preventDefault();
        
        const formDataForValidation = {
            ...formData,
            company: typeof formData.company === 'object' 
                ? formData.company.name || '' 
                : String(formData.company || '')
        };
        
        setFormData(formDataForValidation);
        
        if (!validateForm()) return;
        console.log('Form data being submitted:', formDataForValidation);

        setLoading(true);
        try {
            console.log('Form submitted:', formDataForValidation);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const response = await api.post(ADD_USER_API, {
                firstname: formDataForValidation.firstname,
                lastname: formDataForValidation.lastname,
                email: formDataForValidation.email,
                phone: formDataForValidation.phone,
                department: formDataForValidation.department
            });
            console.log('Server response:', response);
            fetchUsers();   


            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-user-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{user ? 'Edit User' : 'Add New User'}</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                
                <form  className="user-form">
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div className="form-group">
                        <label>First Name <span className="required">*</span></label>
                        <input
                            type="text"
                            className={`form-input ${errors.firstname ? 'error' : ''}`}
                            value={formData.firstname}
                            onChange={(e) => handleInputChange('firstname', e.target.value)}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label>Last Name <span className="required">*</span></label>
                        <input
                            type="text"
                            className={`form-input ${errors.lastname ? 'error' : ''}`}
                            value={formData.lastname}
                            onChange={(e) => handleInputChange('lastname', e.target.value)}
                        />
                        {errors.lastname && <span className="error-message">{errors.lastname}</span>}
                    </div>
                    </div>
                    
                    
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div className="form-group">
                        <label>Phone <span className="required">*</span></label>
                        <input
                            type="tel"
                            className={`form-input ${errors.phone ? 'error' : ''}`}
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label>Department</label>
                        <input
                            type="text"
                            className={`form-input ${errors.department ? 'error' : ''}`}
                            value={formData.department}
                            onChange={(e) => handleInputChange('department', e.target.value)}
                        />
                        {errors.department && <span className="error-message">{errors.department}</span>}
                    </div>
                    </div>
                    <div className="form-group">
                        <label>Email <span className="required">*</span></label>
                        <input
                            type="email"
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn primary"
                            disabled={loading} onClick={handleAddUser}
                        >
                            {/* {loading ? 'Processing...' : (user ? 'Update User' : 'Add User')} */}
                            Add User
                        </button>
                        <button
                            type="button"
                            className="btn secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserForm;
