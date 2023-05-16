import React from "react";
import classes from "./all.module.css";

function Error() {
    return (
        <div className="about">
            <div className="container">
                <div className={`row ${classes.container}`}>
                    <div className="col-lg-5">
                        <h1 className={classes.par}>Ошибка 404!</h1>
                        <p className={classes.par}>
                            Такой страницы не существует.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Error;
