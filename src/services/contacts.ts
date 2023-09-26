import axios from "axios";
import config from "../config/config";
import { CONTACTS } from "../constants/page-paths.constants";

type ListContactsApi = {
    query?: Record<string, any>;
};

const listContacts = (args?: ListContactsApi) => {
    let url = config.BACKEND_BASE + CONTACTS.LIST;

    let query = args?.query || {};
    return axios.get(url, {
        params: query,
    });
};

export {listContacts};