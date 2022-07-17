import axios from "axios";

const databaseURL = process.env.REACT_APP_DATABASE_BASE_URL;
const frontendBaseURL = process.env.REACT_APP_FRONTEND_BASE_URL || "";

const axiosInstance = axios.create({
    baseURL: databaseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        //prettier-ignore
        "Accept": "application/json",
        "Access-Control-Allow-Origin": frontendBaseURL,
    },
});

export default axiosInstance;
