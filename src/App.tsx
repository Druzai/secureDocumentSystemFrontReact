import './App.css';
import {BrowserRouter, Route, Routes, useParams} from "react-router-dom";
import {
    Home,
    Error,
    Header,
    Login,
    Logout,
    Registration,
    Users,
    UserProfile,
    Documents,
    MyUser,
    NewDocument,
    DocumentEditor,
    PasswordDocument,
    DocumentSetPasswordId
} from "./components";
import {useSelector} from 'react-redux';

const UserProfileComponentWrapper = () => {
    const { userId } = useParams();
    // @ts-ignore
    return <UserProfile userId={userId} />;
};

const DocumentEditorComponentWrapper = () => {
    const { documentId } = useParams();
    // @ts-ignore
    return <DocumentEditor documentId={documentId} />;
};

const DocumentSetPasswordComponentWrapper = () => {
    const { documentId } = useParams();
    // @ts-ignore
    return <DocumentSetPasswordId documentId={documentId} />;
};

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
                            <Route path="/users" element={<Users/>}/>
                            <Route
                                path='/user/:userId/'
                                element={<UserProfileComponentWrapper />}
                            />
                            <Route path="/documents" element={<Documents/>}/>
                            <Route path="/me" element={<MyUser/>}/>
                            <Route path="/newDocument" element={<NewDocument/>}/>
                            <Route path="/passwordDocument" element={<PasswordDocument/>}/>
                            <Route
                                path='/document/:documentId/'
                                element={<DocumentEditorComponentWrapper />}
                            />
                            <Route
                                path='/document/:documentId/setPassword'
                                element={<DocumentSetPasswordComponentWrapper />}
                            />
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
                            <Route path="/" element={<Home/>}/>
                            <Route path="/users" element={<Users/>}/>
                        </Routes>
                    </BrowserRouter>
                </header>
            </div>
        );
    }
}

export default App;
