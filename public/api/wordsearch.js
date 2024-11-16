let mainInstance = null;

const ENDPOINT_SERVICE = "http://localhost:4000/api/v1/";

const apiInstances = [];

class WordSearchAPI {

    constructor() {
        this.apiKey = "";
    }

    async _saveDoc(token, data) {

        try {
            const response = await fetch(`${ENDPOINT_SERVICE}save`, {
                method: "POST",
                headers: {
                    "Content-type": "application/octet-stream",
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Transfer-Token": token
                },
                body: data
            });
    
            if (response.status == 200) {
                const data = await response.json();
                if (data && data.status == "success")
                    return true;
                else {
                    console.error("saveDocument() something went wrong: ", data);
                    return false;
                }
            }
        } catch(ex) {
            console.error(`saveDocument() Exception caught: ${ex}`);
            return false;
        }
    }

    async saveDocument(documentInstance) {
        const data = [];
        for (const page of documentInstance.pages) {
            data.push({
                index:    page.pageIndex,
                docImage: page.base64UrlSnapshot
            });
        }

        const payload = JSON.stringify(data);
        
        const chunkSize  = 100000;
        const chunkCount = Math.ceil(payload.length / chunkSize);


        const chunks = [];

        for (let i = 0; i < chunkCount; ++i) {
            const offset = i * chunkSize;
            const slice = payload.slice(offset, offset + chunkSize);
            
            if (slice.length == 0)
                break;

            chunks.push(new Blob([slice], {type: "application/octet-stream"}));
        }

        console.log("Sending ", chunks.length);

        const token = await this._createSaveToken(chunks.length);
        if (!token) {
            console.log("token was null");
            return false;
        }

        console.log("token was generated: ", token);

        let chunkIndex = 0;

        for (const chunk of chunks) {
            const result = await this._saveDoc(token, chunk);
            if (!result) {
                console.log(`chunk ${chunkIndex} failed to be sent. ${chunk}`);
                return false;
            }

            ++chunkIndex;
        }
        

        //console.log("after promise: ", result);
    }

    async _createSaveToken(chunks) {
        try {
            const response = await fetch(`${ENDPOINT_SERVICE}create-token`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}` 
                },

                body: JSON.stringify({
                    chunks
                })
            });

            if (response.status == 200) {
                const data = await response.json();
                if (data && data.status == "success")
                    return data.token;
                else
                    return null;
            }
        } catch(ex) {
            console.error(`_createSaveToken() Exception caught: ${ex}`);
            return null;
        }
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