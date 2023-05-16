import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {
    Home,
    About,
    Header,
    Login,
    Logout,
    Registration,
} from "./components";
import { Provider } from 'react-redux'
import store from './store';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <Provider store={store}>
                    <BrowserRouter>
                        <Header/>
                        <Routes>
                            <Route path="/" element={<Home/>}/>
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/logout" element={<Logout/>}/>
                            <Route path="/registration" element={<Registration/>}/>
                            <Route path="/about" element={<About/>}/>
                        </Routes>
                    </BrowserRouter>
                </Provider>
            </header>
        </div>
    );
}

export default App;
