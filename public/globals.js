export const Globals = {
    Style: {
        FONT_FAMILY: `Sour Gummy`,
        TEXT_COLOR: "#242424",
        CELL_SIZE: {
            width: 30,
            height: 30
        },
        TEXT_MARGIN: 4
    },

    WordSearchConfig: {
        gridSize: 12
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