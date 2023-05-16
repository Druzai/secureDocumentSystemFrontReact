import {combineReducers} from 'redux';

import currentLogin from './currentLogin';

const rootReducer = combineReducers({
    currentLogin,
})

export default rootReducer;