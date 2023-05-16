import classes from "./all.module.css";
import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";
import {checkIfLoggedIn} from "./util/utilities";

class Element {
    name: string;
    link: string;

    constructor(name: string, link: string) {
        this.name = name;
        this.link = link;
    }
}

function Header() {
    const [elements, setElements] = useState([
        new Element("Войти", "/login"),
        new Element("Зарегистрироваться", "/registration")
    ]);

    const getAuth = async () => {
        const auth = await checkIfLoggedIn();

        if (auth) {
            let newElements = [];
            newElements.push(new Element("Выйти", "/logout"));
            setElements(newElements);
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
                    <NavLink className={`nav-link ${classes.par} ${classes.links}`} to="/about">
                        О проекте
                    </NavLink>
                </div>
                <div className={`container ${classes.container}`}>
                    {
                        elements.map(e => {
                            return <NavLink className={`navbar-brand ${classes.par} ${classes.links}`} to={e.link}>
                                {e.name}
                            </NavLink>
                        })
                    }
                </div>
            </nav>
        </div>
    );
}

export default Header;