
import { inch } from "./utils/conversion.js";

import wordSearchApi from "./api/wordsearch.js";
import { createDocument } from "./canvas-doc/Document.js";
import { WordSearchGridPage } from "./app/pages/WordSearchGridPage.js";
import { Globals } from "./globals.js";

const wordSearchApp = wordSearchApi.newInstance(true);

const documentInstance = createDocument({
    width: inch(11),
    height: inch(9)
}, {
    PAGE_INDEX_BOX_SIZE:        Globals.Style.PAGE_INDEX_BOX_SIZE,
    PAGE_INDEX_BOX_LINEWIDTH:   Globals.Style.PAGE_INDEX_BOX_LINEWIDTH,
    PAGE_INDEX_BOX_STROKECOLOR: Globals.Style.PAGE_INDEX_BOX_STROKECOLOR,
    PAGE_INDEX_BOX_BACKGROUND:  Globals.Style.PAGE_INDEX_BOX_BACKGROUND,
    PAGE_INDEX_TEXTCOLOR:       Globals.Style.PAGE_INDEX_TEXTCOLOR,
    FONT_FAMILY:                Globals.Style.FONT_FAMILY
});

async function init() {

    const documentDescription = (await wordSearchApp.getDocumentDescription());
    console.log(documentDescription);
    documentDescription.categories = documentDescription.categories.slice(0, 20);


    const solutionPages = [];
    
    for (const category of documentDescription.categories) {
        const wordSearchPage = new WordSearchGridPage(category.name);
        wordSearchPage.difficulty = category.difficulty;
    
        wordSearchPage.parseData({wordArray: category.items});
    
        documentInstance.appendPage(wordSearchPage);
    
    
        const solutionPage = new WordSearchGridPage(category.name);
    
        solutionPage.wordArray      = wordSearchPage.wordArray;
        solutionPage.wordSearchGrid = wordSearchPage.wordSearchGrid;
        solutionPage.showSolution   = true;
    
        solutionPages.push(solutionPage);
    }
    
    for (const solutionPage of solutionPages)
        documentInstance.appendPage(solutionPage);   
    
    documentInstance.build();
    
    for (let i = 0; i < 160; ++i) {
        document.body.appendChild(documentInstance.pages[i].canvas);
    }
    
    console.log(documentInstance.pages);
    
}

init();
