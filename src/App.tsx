import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {
    Home,
    About,
    Error,
    Header,
    Login,
    Logout,
    Registration,
} from "./components";
import {useSelector} from 'react-redux'

function App() {
    // @ts-ignore
    const currentLogin = useSelector(state => state.currentLogin);
    if (currentLogin.loggedIn) {
        return (
            <div className="App">
                <header className="App-header">
                        <BrowserRouter>
                            <Header/>
                            <Routes>
                                <Route path="/" element={<Home/>}/>
                                <Route path="/login" element={<Login/>}/>
                                <Route path="/logout" element={<Logout/>}/>
                                <Route path="/registration" element={<Registration/>}/>
                                <Route path="/about" element={<About/>}/>
                                <Route path="*" element={<Error/>}/>
                            </Routes>
                        </BrowserRouter>
                </header>
            </div>
        );
    } else {
        return (
            <div className="App">
                <header className="App-header">
                        <BrowserRouter>
                            <Header/>
                            <Routes>
                                <Route path="*" element={<Login/>}/>
                                <Route path="/logout" element={<Logout/>}/>
                                <Route path="/registration" element={<Registration/>}/>
                                <Route path="/about" element={<About/>}/>
                            </Routes>
                        </BrowserRouter>
                </header>
            </div>
        );
    }
}

export default App;
