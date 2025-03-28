import {BrowserRouter, Route, Routes} from "react-router-dom";
import LoginPage from "./LoginPage/LoginPage.tsx";
import ChatPage from "./ChatPage/ChatPage.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/chat" element={<ChatPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;
