export class DocumentPage {
    constructor(pageTitle) {
        this.pageTitle         = pageTitle;
        this.document          = null;
        
        this.canvas            = document.createElement("canvas");
        this.ctx               = this.canvas.getContext("2d");
        this.globalYOffset     = 0;

        this.base64UrlSnapshot = null;
        this.pageIndex         = 0;
    }

    setIndex(index) {
        this.pageIndex = index;
    }

    setBase64(base64Url) {
        this.base64UrlSnapshot = base64Url;
    }

    onAppend() {

    }

    build() {

    }

    parseData(data) {
        throw new Error("Not implemented.");
    }

    getDocument() {
        return this.document;
    }

    setDocument(document) {
        this.document = document;
    }
}
