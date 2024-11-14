export function createDocument(documentSize, settings) {
    return new Document(documentSize, settings);
}

export class Document {
    constructor(documentSize, settings) {
        this.documentSize        = documentSize;
        this.documentAspectRatio = 6/9;//this.documentSize.width / this.documentSize.height;
        
        // adjust aspect ratio
        this.documentSize.height = this.documentSize.width / this.documentAspectRatio;

        this.pageIndexBoxSize       = settings.PAGE_INDEX_BOX_SIZE;
        
        this.pageIndexBoxSize       = settings.PAGE_INDEX_BOX_SIZE;
  
        this.pageIndexBoxLineWidth  = settings.PAGE_INDEX_BOX_LINEWIDTH;
        this.pageIndexStrokeColor   = settings.PAGE_INDEX_BOX_STROKECOLOR;
        this.pageIndexBoxBackground = settings.PAGE_INDEX_BOX_BACKGROUND;
        this.pageIndexTextColor     = settings.PAGE_INDEX_TEXTCOLOR;
        this.fontFamily             = settings.FONT_FAMILY;


        this.pages = [];

        this.startPageOffset = 1;
    }

    appendPage(page) {
        page.setDocument(this);
        this.pages.push(page);
        page.onAppend();
    }
    
    build() {
        let currentPageIndex = this.startPageOffset;
        for (const page of this.pages) {
            // console.log("building ", page);
            page.canvas.width  = this.documentSize.width;
            page.canvas.height = this.documentSize.height;
            
            page.build();
            this._drawPageIndex(page, currentPageIndex);

            page.setBase64(page.canvas.toDataURL("image/png", 1));

            ++currentPageIndex;
        }
    }

    _drawPageIndex(page, pageIndex) {
        const size = this.pageIndexBoxSize;

        page.ctx.save();
        
        page.ctx.globalAlpha = 1;
        // draw page number rounded box
        page.ctx.beginPath();
        page.ctx.moveTo(this.documentSize.width / 2 - size / 2, this.documentSize.height);
        page.ctx.bezierCurveTo(
            this.documentSize.width / 2 - size / 2 - 20, 
            this.documentSize.height - size, 
            this.documentSize.width / 2 + size / 2 + 20, 
            this.documentSize.height - size,
            this.documentSize.width / 2 + size / 2, 
            this.documentSize.height
        );
        page.ctx.lineWidth   = this.pageIndexBoxLineWidth;
        page.ctx.strokeStyle = this.pageIndexStrokeColor;
        page.ctx.fillStyle   = this.pageIndexBoxBackground;
        
        page.ctx.stroke();
        page.ctx.fill();
        page.ctx.closePath();

        // draw page number
        page.ctx.fillStyle = this.pageIndexTextColor;
        page.ctx.textBaseline = "bottom";
        page.ctx.font = `${size / 2.5}px ${this.fontFamily}`
        const textMeasure = page.ctx.measureText(pageIndex);
        page.ctx.fillText(pageIndex, this.documentSize.width / 2 - textMeasure.width / 2, this.documentSize.height - size / 4 + 16);
        page.ctx.restore();
    }
}