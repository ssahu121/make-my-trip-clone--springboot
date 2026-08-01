import { configureStore, createSlice } from "@reduxjs/toolkit";


const saveusertolocalStorage = (user) => {
if (typeof window !== "undefined") {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user"); 
    }
  }
};
const initialState = {
  user: (typeof window !== "undefined" && localStorage.getItem("user")) 
         ? JSON.parse(localStorage.getItem("user")) 
         : null,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      saveusertolocalStorage(action.payload);
    },
    clearUser: (state) => {
      state.user = null;
    //  if(typeof window !== "undefined" && localStorage) {
    // localStorage.setItem("user", JSON.stringify(user));
    saveusertolocalStorage(null);
  
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

export default store;
