import background from "/public/background.jpg";
import metalGrid from "/public/metal_grid.png";

import './ChatPage.css'

import Navbar from "../components/Navbar/Navbar.tsx";
import Chat from "../components/Chat/Chat.tsx";

function ChatPage() {

    return (
        <div className="app">
            <div className="background-container">
                <div className="background background-top" style={{backgroundImage: `url(${background})`}}></div>
                <div className="background background-bottom" style={{backgroundImage: `url(${metalGrid})`}}></div>
            </div>

            <Navbar/>
            <Chat />
        </div>
    )

}

export default ChatPage;