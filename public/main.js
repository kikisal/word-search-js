import { bbFromFontSize, drawGrid, drawSolutionBox, drawSolutionBoxes } from "./grid-raster.js";
import { computeGridPixelSize, computeCellSize, Globals } from "./globals.js";
import { vec2 } from "./math/index.js"; 
import { generateWordGrid } from "./wordgrid.js";
const c = document.createElement('canvas');

const documentAspectRatio   = 6/9;
const wordSearchPortionSize = .8;

const CANVAS_SIZE = {
    width:  600,
    height: 600
};

CANVAS_SIZE.height = CANVAS_SIZE.width/documentAspectRatio;


c.width  = CANVAS_SIZE.width;
c.height = CANVAS_SIZE.height;
const ctx = c.getContext("2d");


ctx.save();

const wordSearchGrid = generateWordGrid(Globals.WordSearchConfig.gridSize, Globals.WordSearchConfig.gridSize, [
    "Elf",
    "Toys",
    "Gifts",
    "Reindeer",
    "Wrapping",
    "Hammer",
    "Paint",
    "Ribbon",
    "Doll",
    "Teddy",
    "Sleigh",
    "Bells",
    "This is a long word do not consider it"
]);



computeCellSize(CANVAS_SIZE.width * wordSearchPortionSize, CANVAS_SIZE.width * wordSearchPortionSize, Globals.WordSearchConfig.gridSize, Globals.Style.TEXT_MARGIN);


const [cellWidth, cellHeight] = [
    Globals.Style.CELL_SIZE.width,
    Globals.Style.CELL_SIZE.height,
];

const finalGridPixelSize = computeGridPixelSize();
const wordFindGridOffset = vec2(
    (CANVAS_SIZE.width * (1 - wordSearchPortionSize)) / 2,
    0
);

// resizeCanvas(c, finalGridPixelSize.width, finalGridPixelSize.height);

drawGrid(ctx, wordSearchGrid, cellWidth, cellHeight, Globals.Style.TEXT_MARGIN, {
    color: "#000",
    baseline: "middle",
    fontSize: cellWidth,

    offset: wordFindGridOffset,
    boxSize: {
        width: cellWidth,
        height: cellHeight
    }
});

drawSolutionBoxes(ctx, wordSearchGrid, cellWidth +  Globals.Style.TEXT_MARGIN,  cellHeight +  Globals.Style.TEXT_MARGIN, .3, Globals.Style.TEXT_MARGIN, wordFindGridOffset);

ctx.restore();

const wordTargetElement = document.createElement("div");
wordTargetElement.classList.add("word-wrapper");


for (const word of wordSearchGrid.wordSet) {
    wordTargetElement.appendChild(createWordElement(word));
}

function createWordElement(word) {
    const element = document.createElement("div");
    element.classList.add("word-item");
    element.textContent = word;
    return element;
}

document.body.appendChild(c);
document.body.appendChild(wordTargetElement);


function resizeCanvas(c, width, height) {
    c.width  = width;
    c.height = height;
}