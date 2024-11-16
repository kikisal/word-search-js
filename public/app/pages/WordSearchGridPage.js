import { drawGrid, drawSolutionBoxes } from "./../../grid-raster.js";
import { computeCellSize, Globals } from "./../../globals.js";
import { vec2 } from "./../../math/index.js"; 
import { generateWordGrid } from "./../../wordgrid.js";
import { DocumentPage } from "../../canvas-doc/DocumentPage.js";

export class WordSearchGridPage extends DocumentPage {
    constructor(themeTitle) {
        super(themeTitle);
        
        this.wordArray             = null;
        this.wordSearchGrid        = null;
        
        this.wordSearchPortionSize = .76;

        this.wordFindGridOffset = null;
        this.gridOutlineX  = 0;

        this.showSolution = false;

        this.difficulty   = 1;
    }

    onAppend() {

    }

    parseData(data) {
        this.wordArray      = data.wordArray;
        this.wordSearchGrid = generateWordGrid(Globals.WordSearchConfig.gridSize[this.difficulty - 1], Globals.WordSearchConfig.gridSize[this.difficulty - 1], this.wordArray, this.difficulty);
    }

    build() {

        this._drawTitle();
        this._drawDescription();
        this._buildWordSearchGrid();

        this._drawWordList();

        this._drawDifficultyLevel();

        if (this.showSolution)
            this.drawSolutionBoxes();

    }
    
    _drawDifficultyLevel() {
        const { ctx } = this;
        
        const CANVAS_SIZE = {
            width:  this.document.documentSize.width,
            height: this.document.documentSize.height
        };


        ctx.save();
        const boxHeight  = 38;
        const boxPadding = 18;
        const yMargin    = 80;
        ctx.font = `${boxHeight}px ${Globals.Style.FONT_FAMILY}`;
        ctx.textBaseline = "bottom";

        const text = `Difficulty: ${this.getDifficultyLevelLabel()}`;
        
        const textWidth = ctx.measureText(text);
        ctx.translate(CANVAS_SIZE.width / 2 - textWidth.width / 2, CANVAS_SIZE.height - boxHeight * 3 - 75);
        ctx.fillStyle = "#e6e6e6";
        ctx.fillRect(0, 0, textWidth.width + 20, boxHeight + boxPadding);
        ctx.fillStyle = Globals.Style.TEXT_COLOR;
        ctx.fillText(text, boxPadding / 2, boxHeight + boxPadding / 2);

      
        ctx.restore();
    }

    getDifficultyLevelLabel() {
        return ["Easy", "Medium", "Hard"][this.difficulty - 1];
    }

    _drawWordList() {
        this.globalYOffset += 20;

        const {ctx} = this;
        const fontSize = 46;
        const description = "Words to find: ";
        this.globalYOffset += fontSize;
        
        ctx.save();
        ctx.textBaseline = "bottom";
        ctx.font = `${fontSize}px ${Globals.Style.FONT_FAMILY}`;
        const measure = ctx.measureText(description);
        const textWidth = measure.width;
        ctx.fillStyle = Globals.Style.TEXT_COLOR;

        const textYPosition = this.globalYOffset;

        ctx.fillText(description, this.gridOutlineX, this.globalYOffset);
        ctx.restore();
        this.globalYOffset += fontSize/1.8;

        // underline: 
        ctx.beginPath();
        ctx.moveTo(this.gridOutlineX, textYPosition);
        ctx.lineTo(this.gridOutlineX + textWidth - 15, textYPosition);
        ctx.lineWidth = 3;
        ctx.strokeStyle = Globals.Style.TEXT_COLOR;
        ctx.stroke();

        ctx.closePath();

        this.globalYOffset += 20;

        const startYPos = this.globalYOffset;

        let textItemYPos = startYPos;

        let wordGroupX = 0;
        let maxWordLen = 0;

        for (let i = 0; i < this.wordSearchGrid.wordSet.length; ++i) {
            const word = this.wordSearchGrid.wordSet[i];
            const listFontSize = 35;

            ctx.save();
            ctx.font = `${listFontSize}px ${Globals.Style.FONT_FAMILY}`;
            ctx.textBaseline = "bottom";
            const listMeasureText = ctx.measureText(word);
            if (listMeasureText.width >= maxWordLen)
                maxWordLen = listMeasureText.width;
                
            ctx.fillStyle = Globals.Style.TEXT_COLOR;
            ctx.fillText(word, this.gridOutlineX + wordGroupX, textItemYPos);
            ctx.restore();

            textItemYPos += listFontSize;

            if ((i + 1) % 5 == 0) {
                wordGroupX += maxWordLen + 50;
                maxWordLen = 0;
                textItemYPos = startYPos;
            }
        }

        this._drawDifficultyArrows(this.gridOutlineX + textWidth, textYPosition - fontSize + 5);
    }

    _drawDifficultyArrows(offsetX, offsetY) {
        const { ctx } = this;

        const anglesFromDir = (dirs) => {
            const angles = [];

            for (const dir of dirs) {
                const x = dir[1];
                const y = dir[0];

                const mag = Math.sqrt(x*x + y*y);

                const cos = x / mag;

                angles.push(y >= 0 ? Math.acos(cos) : (2*Math.PI - Math.acos(cos)));
            }

            return angles;
        }

        const arrowSize = {
            width:  40,
            height: 30
        };

        const arrowsOffset = {
            x: offsetX + 10,
            y: offsetY + 2
        };

        const marginRight = 20;

        const arrowCount = 5;
        const angles = anglesFromDir(this.wordSearchGrid.allowedDirections);

        arrowSize.height = arrowSize.width / (this.document.arrowImage.width / this.document.arrowImage.height);
        
        const arrowBitmap = document.createElement("canvas");
        const bitmapCtx   = arrowBitmap.getContext("2d");

        const bitmapWidth  = (this.document.arrowImage.width + marginRight) * arrowCount;
        arrowBitmap.width  = bitmapWidth;
        arrowBitmap.height = arrowSize.height;

        for (let i = 0; i < angles.length; ++i) {
            const angle = angles[i];
            bitmapCtx.save();
            bitmapCtx.translate(i * (arrowSize.width + marginRight) + arrowSize.width/2, arrowSize.height/2);
            bitmapCtx.rotate(angle);
            bitmapCtx.drawImage(this.document.arrowImage, -arrowSize.width/2, -arrowSize.height/2, arrowSize.width, arrowSize.height);
            bitmapCtx.restore();
        }

        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.drawImage(arrowBitmap, arrowsOffset.x, arrowsOffset.y);
        ctx.restore();
    }

    _drawDescription() {
        const {ctx} = this;
        const fontSize = 46;
        const description = "Find the words hidden in the puzzle 👇";
        this.globalYOffset += fontSize;
        ctx.save();
        ctx.font = `${fontSize}px ${Globals.Style.FONT_FAMILY}`;
        const measure = ctx.measureText(description);
        const textWidth = measure.width;
        ctx.fillStyle = Globals.Style.TEXT_COLOR;
        ctx.fillText(description, (this.document.documentSize.width - textWidth) / 2, this.globalYOffset);
        ctx.restore();
        this.globalYOffset += fontSize/1.8;
        
    }

    _drawTitle() {
        const { ctx } = this;
        
        const CANVAS_SIZE = {
            width:  this.document.documentSize.width,
            height: this.document.documentSize.height
        };


        ctx.save();
        const boxHeight  = 60;
        const boxPadding = 18;
        const yMargin    = 80;
        ctx.font = `${boxHeight}px ${Globals.Style.FONT_FAMILY}`;
        ctx.textBaseline = "bottom";

        this.globalYOffset += boxHeight + yMargin + boxPadding;
        
        const textWidth = ctx.measureText(this.pageTitle);
        ctx.translate(CANVAS_SIZE.width / 2 - textWidth.width / 2, yMargin / 2);
        ctx.fillStyle = "#e6e6e6";
        ctx.fillRect(0, 0, textWidth.width + 20, boxHeight + boxPadding);
        ctx.fillStyle = Globals.Style.TEXT_COLOR;
        ctx.fillText(this.pageTitle, boxPadding / 2, boxHeight + boxPadding / 2);

        ctx.beginPath();
        ctx.rect(0, 0, textWidth.width + 20, boxHeight + boxPadding);
        ctx.strokeStyle = "#696969";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }

    _drawGridOutline(position, gridPixelSize) {
        
        const {ctx} = this;

        const margin = 20;

        this.globalYOffset += margin;
        position.y = this.globalYOffset;

        this.gridOutlineX = position.x - margin/2;
        
        ctx.beginPath();
        ctx.rect(this.gridOutlineX, position.y - margin/2, gridPixelSize.width + margin, gridPixelSize.height + margin);
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.closePath();
    }

    _buildWordSearchGrid() {
        

        const CANVAS_SIZE = {
            width:  this.document.documentSize.width,
            height: this.document.documentSize.height
        };

        const {ctx} = this;

        const gridPixelSize = {
            width:  CANVAS_SIZE.width * this.wordSearchPortionSize,
            height: CANVAS_SIZE.width * this.wordSearchPortionSize
        }

        
        this.wordFindGridOffset = vec2(
            (CANVAS_SIZE.width * (1 - this.wordSearchPortionSize)) / 2,
            this.globalYOffset
        );


        this._drawGridOutline(this.wordFindGridOffset, gridPixelSize);

        this.wordFindGridOffset.y = this.globalYOffset;

        computeCellSize(gridPixelSize.width, gridPixelSize.height, Globals.WordSearchConfig.gridSize[this.difficulty - 1], Globals.Style.TEXT_MARGIN);

                
        const [cellWidth, cellHeight] = [
            Globals.Style.CELL_SIZE.width,
            Globals.Style.CELL_SIZE.height,
        ];

                
        drawGrid(this.ctx, this.wordSearchGrid, cellWidth, cellHeight, Globals.Style.TEXT_MARGIN, {
            color: Globals.Style.TEXT_COLOR,
            baseline: "middle",
            fontSize: cellWidth,

            offset: this.wordFindGridOffset,
            boxSize: {
                width: cellWidth,
                height: cellHeight
            }
        });

        this.globalYOffset += gridPixelSize.height + 20;

    }

    drawSolutionBoxes() {
        const [cellWidth, cellHeight] = [
            Globals.Style.CELL_SIZE.width,
            Globals.Style.CELL_SIZE.height,
        ];

        drawSolutionBoxes(this.ctx, this.wordSearchGrid, cellWidth +  Globals.Style.TEXT_MARGIN,  cellHeight +  Globals.Style.TEXT_MARGIN, .2, Globals.Style.TEXT_MARGIN, this.wordFindGridOffset);
    }
}
