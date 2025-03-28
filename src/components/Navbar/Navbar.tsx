import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import './Navbar.css';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        // Clear localStorage
        localStorage.removeItem("username");
        localStorage.removeItem("planet");

        // Redirect to login page
        navigate("/");
    };

    return (
        <nav className="header">
            <div className="logo">CosmoChat</div>
            <div className="menu-container" ref={menuRef}>
                <div className="menu-icon" onClick={toggleMenu}>☰</div>
                {isMenuOpen && (
                    <div className="dropdown-menu">
                        <div className="menu-item" onClick={handleLogout}>
                            <LogoutIcon className="menu-icon-mui" />
                            <span>Logout</span>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;