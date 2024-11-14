
let mainInstance = null;

const ENDPOINT_SERVICE = "http://localhost:4000/api/v1/";

const apiInstances = [];

class WordSearchAPI {

    constructor() {
        this.apiKey = "";
    }

    async getDocumentDescription() {
        try {
            const response = await fetch(`${ENDPOINT_SERVICE}description`, {
                method: "GET",
                headers: {
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}` 
                }
            });

            if (response.status == 200) {
                const data = await response.json();
                if (data && data.status == "success")
                    return data.data;
                else
                    return null;
            }
        } catch(ex) {
            console.error(`saveDocumentDescription() Exception caught: ${ex}`);
            return null;
        }
    }

    async saveDocumentDescription(document) {
        try {
            const response = await fetch(`${ENDPOINT_SERVICE}description`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}` 
                },
                body: JSON.stringify(document)
            });

            if (response.status == 200) {
                const data = await response.json();
                if (data && data.status == "success")
                    return {status: "success"};
                else
                    return {status: "failed", reason: data.reason};
            }
        } catch(ex) {
            console.error(`saveDocumentDescription() Exception caught: ${ex}`);
            return {status: "failed", reason: ex.reason || "unknown", exception: ex};
        }
    }

    static create() {
        return new WordSearchAPI();
    }
}

export function newInstance(setDefault) {
    const instance = WordSearchAPI.create();

    if (setDefault)
        mainInstance = instance;

    apiInstances.push(instance);

    return instance;
}

export default {
    newInstance
};