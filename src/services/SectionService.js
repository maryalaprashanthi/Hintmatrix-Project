import axios from "axios";

const BASE_URL = "http://localhost:8080";

export const saveSection = (section) => {
    return axios.post(
        `${BASE_URL}/saveSection`, 
        section,
        { withCredentials: true } // ◄— Passes your active login cookie
    );
};

export const getAllSections = () => {
    return axios.get(
        `${BASE_URL}/getAllSections`,
        { withCredentials: true } // ◄— Passes your active login cookie
    );
};

export const getSectionById = (id) => {
    return axios.get(
        `${BASE_URL}/getSectionById/${id}`,
        { withCredentials: true }
    );
};

export const updateSection = (section) => {
    return axios.put(
        `${BASE_URL}/updateSection`, 
        section,
        { withCredentials: true }
    );
};

export const deleteSection = (id) => {
    return axios.delete(
        `${BASE_URL}/deleteSection/${id}`,
        { withCredentials: true }
    );
};
