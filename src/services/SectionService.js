import axios from "axios";

const BASE_URL = "http://localhost:8080/api/section";

class SectionService {

    // POST
    saveSection(sectionRequestDTO) {
        return axios.post(BASE_URL, sectionRequestDTO);
    }

    // GET All
    getAllSections() {
        return axios.get(BASE_URL);
    }

    // GET By Id
    getSectionById(id) {
        return axios.get(`${BASE_URL}/${id}`);
    }

    // PUT
    updateSection(id, sectionRequestDTO) {
        return axios.put(`${BASE_URL}/${id}`, sectionRequestDTO);
    }

    // DELETE
    deleteSection(id) {
        return axios.delete(`${BASE_URL}/${id}`);
    }
}

export default new SectionService();