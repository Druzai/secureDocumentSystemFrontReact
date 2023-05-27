import classes from "./all.module.css";
import React, {useEffect} from "react";
import {NavLink} from "react-router-dom";
import {checkIfLoggedIn} from "./util/utilities";
import {useDispatch, useSelector} from "react-redux";
import allActions from '../actions';

function Header() {
    const dispatch = useDispatch();
    // @ts-ignore
    const currentLogin = useSelector(state => state.currentLogin);

    const getAuth = async () => {
        const username = await checkIfLoggedIn();

        if (username != null){
            dispatch(allActions.loginActions.setUser({username: username}));
        } else {
            dispatch(allActions.loginActions.logOut());
        }
    };

    useEffect(() => {
        getAuth();
    }, []);

    return (
        <div className={`navigation`}>
            <nav className={`navbar navbar-expand navbar-dark bg-dark ${classes.flexHorizontal}`}>
                <div className={`container ${classes.container}`}>
                    <NavLink className={`navbar-brand ${classes.par} ${classes.links}`} to="/">
                        Домашняя
                    </NavLink>
                    <NavLink className={`nav-link ${classes.par} ${classes.links}`} to="/documents">
                        Все документы
                    </NavLink>
                    <NavLink className={`nav-link ${classes.par} ${classes.links}`} to="/newDocument">
                        Новый документ
                    </NavLink>
                    <NavLink className={`nav-link ${classes.par} ${classes.links}`} to="/passwordDocument">
                        Документ по паролю
                    </NavLink>
                    <NavLink className={`nav-link ${classes.par} ${classes.links}`} to="/users">
                        Все пользователи
                    </NavLink>
                </div>
                <div className={`container ${classes.container}`}>
                    {
                        currentLogin.loggedIn ?
                            <>
                                <NavLink className={`navbar-brand ${classes.par} ${classes.links}`} to="/me">
                                    {currentLogin.user.username}
                                </NavLink>
                                <NavLink className={`navbar-brand ${classes.par} ${classes.links}`} to="/logout">
                                    Выйти
                                </NavLink>
                            </>
                            :
                            <>
                                <NavLink className={`navbar-brand ${classes.par} ${classes.links}`} to="/login">
                                    Войти
                                </NavLink>
                                <NavLink className={`navbar-brand ${classes.par} ${classes.links}`} to="/registration">
                                    Зарегистрироваться
                                </NavLink>
                            </>
                    }
                </div>
            </nav>
        </div>
    );
}

export default Header;