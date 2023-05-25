import {createStore, StoreEnhancer} from 'redux'
import rootReducer from './reducers'

export const createAppStore = (initialState: StoreEnhancer<unknown, unknown> | undefined) =>
    createStore(
        rootReducer,
        initialState,
    )

// @ts-ignore
export default createAppStore();
