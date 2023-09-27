import axios from "axios";
import config from "../config/config";
import { CONTACTS } from "../constants/page-paths.constants";

type ListContactsApi = {
    query?: Record<string, any>;
    abortCont?: AbortController;
};

const listContacts = (args?: ListContactsApi) => {
    let url = config.BACKEND_BASE + CONTACTS.LIST;

    let query = args?.query || {};
    let abortSignal = args?.abortCont?.signal;
    return axios.get(url, {
        params: query,
        signal: abortSignal
    });
};

export {listContacts};