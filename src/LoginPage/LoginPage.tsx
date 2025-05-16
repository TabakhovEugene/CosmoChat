import {useState} from "react";
import './LoginPage.css'
import { Link } from 'react-router-dom'

import {login} from "../redux/authSlice.tsx";

import planetEarth from '/public/planet-earth.png';
import planetMars from '/public/mars.png';
import {useDispatch} from "react-redux";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [planet, setPlanet] = useState("Earth");
    const dispatch = useDispatch();

    function SignIn() {
        dispatch(login({ username, planet }));
    }

    return (
        <div className="login-background">
            <div className="login-form">
                <h3 className="login-title">Sign in to connect to the CosmoChat</h3>
                <input
                    className="login-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username..."
                />

                <div className="planet-selection">
                    <div className="select-wrapper">
                        <select
                            id="planet-select"
                            className="planet-select"
                            value={planet}
                            onChange={(e) => setPlanet(e.target.value)}
                        >
                            <option value="Earth">Earth</option>
                            <option value="Mars">Mars</option>
                        </select>
                        <div className="planet-icon-container">
                            <img
                                src={planet === "Earth" ? planetEarth : planetMars}
                                alt={planet}
                                className="planet-icon"
                            />
                        </div>
                    </div>
                </div>

                <Link
                    onClick={SignIn}
                    to='/chat'
                    className="login-button"
                >
                    Sign in
                </Link>
            </div>
        </div>
    )
}

export default LoginPage;