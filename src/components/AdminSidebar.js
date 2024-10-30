import React from 'react';
import './AdminSidebar.css';
import { FaChartLine, FaList, FaClipboardList, FaUserCircle, FaCog } from 'react-icons/fa';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <h2>UrbanDepot</h2>
            </div>
            <ul className="sidebar-menu">
                <li onClick={() => setActiveTab('statistics')} className={activeTab === 'statistics' ? 'active' : ''}>
                    <FaChartLine className="icon" />
                    <span>Statistics Overview</span>
                </li>
                <li onClick={() => setActiveTab('registered')} className={activeTab === 'registered' ? 'active' : ''}>
                    <FaList className="icon" />
                    <span>Registered Places List</span>
                </li>
                <li onClick={() => setActiveTab('bookings')} className={activeTab === 'bookings' ? 'active' : ''}>
                    <FaClipboardList className="icon" />
                    <span>Booking Details</span>
                </li>
                <li onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>
                    <FaUserCircle className="icon" />
                    <span>Profile</span>
                </li>
                <li onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}>
                    <FaCog className="icon" />
                    <span>Settings</span>
                </li>
            </ul>
            <div className="sidebar-profile">
                <img src="https://via.placeholder.com/50" alt="Profile" className="profile-pic" />
                <div className="profile-info">
                    <p>Admin Name</p>
                    <small>Administrator</small>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
