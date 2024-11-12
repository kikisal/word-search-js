import { Globals } from "./globals.js";
import { vec2 } from "./math/Vec2.js";

export function bbFromFontSize() {
    return parseInt(Globals.Style.FONT_FAMILY.split(" ")[0]);
}

export function drawLetter(letter, position, style, ctx) {
    ctx.save();

    ctx.fillStyle    = style.color;
    ctx.font         = `${style.fontSize}px ${style.font || Globals.Style.FONT_FAMILY}`;
    ctx.textBaseline = style.baseline;

    const metric = ctx.measureText(letter);

    const diff = style.boxSize.width - metric.width;
    ctx.fillText(letter, position.x + diff/2, position.y + style.boxSize.height / 2);
    ctx.restore();
}

export function computeDir(p1, p2) {
    const diff = vec2(p2.x - p1.x, p2.y - p1.y);
    const len = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
    return vec2(diff.x/len, diff.y/len);
}

export function drawSolutionBox(ctx, wordSearchGrid, solutionBox, cellWidth,  cellHeight, alpha, margin) {

    const newDir = computeDir(solutionBox.start, solutionBox.end);

    
    //ctx.globalAlpha = alpha;
    const lineStart = vec2(solutionBox.start.x * cellWidth + cellWidth / 2 - margin/2, solutionBox.start.y * cellHeight + cellHeight / 2 - margin/2);
    const lineEnd   = vec2(solutionBox.end.x * cellWidth + cellWidth / 2 - margin/2, solutionBox.end.y * cellHeight + cellHeight/2  - margin/2);

    const dirShiftFactor = cellWidth/2;

    // to fit the letters
    lineStart.x -= newDir.x * dirShiftFactor;
    lineStart.y -= newDir.y * dirShiftFactor;
    
    lineEnd.x += newDir.x * dirShiftFactor;
    lineEnd.y += newDir.y * dirShiftFactor;

    ctx.beginPath();
    ctx.lineWidth = cellWidth - 10;
    ctx.moveTo(lineStart.x, lineStart.y);
    ctx.lineTo(lineEnd.x, lineEnd.y);
    ctx.stroke();
    ctx.closePath();

    /*
    const MAX_ATTEMPS = 50;

    for (let i = 0; i < MAX_ATTEMPS; ++i) {
        const x = solutionBox.start.x + solutionBox.dir[1] * i;
        const y = solutionBox.start.y + solutionBox.dir[0] * i;

        drawLetter(wordSearchGrid.letter(x, y), vec2(x * bbwidth, y * bbheight), {
            color: "red",
            baseline: "middle",
            boxSize: {
                width: bbwidth,
                height: bbheight
            }
        }, ctx);

        if (x == solutionBox.end.x && y == solutionBox.end.y)
            break;
    }
    */

}

export function drawGrid(ctx, wordSearchGrid, cellWidth, cellHeight, margin, style) {
    for (let x = 0; x < wordSearchGrid.cols; ++x) {
        for (let y = 0; y < wordSearchGrid.rows; ++y) {        
            drawLetter(wordSearchGrid.letter(x, y), vec2(style.offset.x + x * (cellWidth + margin), style.offset.y + y * (cellHeight + margin)), style, ctx);
        }
    }
}

export function drawSolutionBoxes(ctx, wordSearchGrid, cellWidth,  cellHeight, alpha, margin, offset) {
    const offRenderCanvas = document.createElement('canvas');
    offRenderCanvas.width  = ctx.canvas.width;
    offRenderCanvas.height = ctx.canvas.height;

    
    // draw solution boxes
    for (const solutionBox of wordSearchGrid.solutionBoxes) {
        drawSolutionBox(offRenderCanvas.getContext("2d"), wordSearchGrid, solutionBox, cellWidth, cellHeight, alpha, margin);
    }

    ctx.globalAlpha = alpha;
    ctx.drawImage(offRenderCanvas, offset.x, offset.y);
}
