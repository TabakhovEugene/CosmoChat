import './Chat.css'
import {useEffect, useRef, useState} from "react";
import {useSelector} from "react-redux";

import planetEarth from '/public/planet-earth.png';
import planetMars from '/public/mars.png';
import paperClip from '/public/paper-clip.png';
import send from '/public/send.png';

const defaultAvatar = `https://i.pravatar.cc/`;

function Chat() {
    const [messages, setMessages] = useState([]);
    const [value, setValue] = useState("");
    const socket = useRef();
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const { username, planet } = useSelector((state) => state.auth);

    // Determine WebSocket URL based on planet
    const getWebSocketUrl = () => {
        if (planet === "Earth") {
            return "ws://192.168.43.131:8005";
        } else if (planet === "Mars") {
            return "ws://192.168.43.131:8010";
        }
        return "ws://192.168.43.131:8005";
    };

    function connect() {
        if (socket.current && socket.current.readyState !== WebSocket.CLOSED) {
            return;
        }

        socket.current = new WebSocket(getWebSocketUrl());

        socket.current.onopen = () => {
            socket.current.send(JSON.stringify({
                event: 'connection',
                username,
                planet,
                id: Date.now()
            }));
        }

        socket.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setMessages(prev => [ ...prev, message]);
        }

        socket.current.onerror = (error) => {
            console.error(`WebSocket Error for ${planet}:`, error);
        };

        socket.current.onclose = () => {
            console.log(`WebSocket connection to ${planet} closed`);
            // Optional: Implement reconnection logic here
        };
    }

    useEffect(() => {
        connect();
    }, []);

    // Function to scroll down
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!value.trim() || planet !== "Earth") return; // Only Earth can send messages

        const message = {
            event: 'message',
            username,
            message: value,
            planet: "Earth",
            id: Date.now()
        };

        socket.current.send(JSON.stringify(message));
        setValue('');
    };

    const handleFileClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files.length > 0 && planet === "Earth") { // Only Earth can send files
            const message = {
                event: 'message',
                username,
                message: `Отправил файл: ${files[0].name}`,
                planet: "Earth",
                id: Date.now()
            };
            socket.current.send(JSON.stringify(message));
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Get appropriate planet image
    const getPlanetImage = () => {
        return planet === "Earth" ? planetEarth : planetMars;
    };

    // Determine if input should be disabled (on Mars)
    const isInputDisabled = planet !== "Earth";

    return (
        <div className='chat-wrapper'>
            <div className="chat-container">
                <div className="chat-header">
                    <div className="user-info">
                        <img src={defaultAvatar} alt="User Avatar" className="user-avatar"/>
                        <div className="user-details">
                            <span className="username">{username}</span>
                            <span className="status">online<span className="status-dot"></span></span>
                        </div>
                    </div>
                    <div className="connection-info">
                        Connected to {planet}
                        <img src={getPlanetImage()} alt="Planet" className="earth-icon"/>
                    </div>
                </div>

                <div className="chat-messages" ref={messagesContainerRef}>
                    {messages.map(mess => {
                        const isError = !!mess.error;

                        if (isError) {
                            return (
                                <div
                                    key={mess.id}
                                    className={`message-wrapper ${planet === "Mars" ? "mars-message" : ""}`}
                                >
                                    <span className="message-author">{mess.username}</span>
                                    <div className="message error-message-bubble">
                                        Сообщение потеряно!
                                    </div>
                                    <span className="message-time">{formatTime(mess.id)}</span>
                                </div>
                            );
                        }

                        if (!mess.message) {
                            return (
                                <div key={mess.id} className="connection-message">
                                    Пользователь {mess.username} подключился!
                                </div>
                            );
                        }

                        return (
                            <div
                                key={mess.id}
                                className={`message-wrapper ${planet === "Mars" ? "mars-message" : ""}`}
                            >
                                <span className="message-author">{mess.username}</span>
                                <div className={`message ${planet === "Mars" ? "mars-message-bubble" : ""}`}>
                                    {mess.message}
                                </div>
                                <span className="message-time">{formatTime(mess.id)}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="chat-input">
                    <button
                        className="attachment-btn"
                        onClick={handleFileClick}
                        disabled={isInputDisabled}
                    >
                        <img src={paperClip} alt="Attach File" className="paperclip-icon" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        disabled={isInputDisabled}
                    />
                    <input
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        type="text"
                        placeholder="Message..."
                        onKeyPress={e => e.key === 'Enter' && sendMessage()}
                        disabled={isInputDisabled}
                    />
                    <button
                        className="send-btn"
                        onClick={sendMessage}
                        disabled={isInputDisabled}
                    >
                        <img src={send} alt="Send" className="send-icon" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;