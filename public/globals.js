export const Globals = {
    Style: {
        FONT_FAMILY: `Sour Gummy`,
        TEXT_COLOR: "#242424",
        CELL_SIZE: {
            width: 30,
            height: 30
        },
        TEXT_MARGIN: 4,
        PAGE_INDEX_BOX_SIZE: 120,
        PAGE_INDEX_BOX_LINEWIDTH: 8,
        PAGE_INDEX_BOX_STROKECOLOR: "#7a7a7a",
        PAGE_INDEX_BOX_BACKGROUND: "#E6E6E6",
        PAGE_INDEX_TEXTCOLOR: "#4d4c4c"
    },

    WordSearchConfig: {
        gridSize: [8, 10, 12],
        maxDifficultyLevels: 3
    }
}

export function computeCellSize(cWidth, cHeight, gridSize, cellMargin) {
    Globals.Style.CELL_SIZE.width  = (cWidth/gridSize)  - cellMargin;
    Globals.Style.CELL_SIZE.height = (cHeight/gridSize) - cellMargin;    
}

export function computeGridPixelSize() {
    return {
        width:   Globals.WordSearchConfig.gridSize * (Globals.Style.CELL_SIZE.width + Globals.Style.TEXT_MARGIN),
        height:  Globals.WordSearchConfig.gridSize * (Globals.Style.CELL_SIZE.height+ Globals.Style.TEXT_MARGIN),
    };
}