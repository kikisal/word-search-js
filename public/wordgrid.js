export class WordGrid {
    constructor(cols, rows, wordSet) {
        this.cols          = cols;
        this.rows          = rows;
        this.wordSet       = null;
        this.wordsNoSpace  = null;
        this.gridData      = null;
        this.solutionBoxes = [];

        this.generateWordSearch(wordSet, {cols, rows});
    }

    generateGrid(wordSet) {
        this.wordSet = wordSet;
        this.gridData = new Array(this.rows * this.cols);
        for (let y = 0; y < this.rows; ++y) {
            for (let x = 0; x < this.cols; ++x) {
                this.setLetter(x, y, sampleRandomLetter());
            }
        }
    }

    generateWordSearch(words, gridSize) {
        
        words.sort(() => Math.random() - 0.5);

        this.wordSet      = words;
        this.wordsNoSpace = words = removeSpaces(words);


        this.gridData = Array.from({length: gridSize.cols * gridSize.rows}, (_v, k) => null);

        const directions = [
            [0, 1],   // Right
            [1, 0],   // Down
            [-1, 0],  // Up
            [1, 1],   // Diagonal down-right
            [1, -1],  // Diagonal down-left
            [-1, 1],  // Diagonal up-right
        ];

        const canPlaceWord = (word, row, col, dirRow, dirCol) => {
            for (let i = 0; i < word.length; i++) {
                const newRow = row + i * dirRow;
                const newCol = col + i * dirCol;
                if (
                    newRow < 0 || newRow >= gridSize.rows ||
                    newCol < 0 || newCol >= gridSize.cols ||
                    (this.letter(newCol, newRow) && this.letter(newCol, newRow) !== word[i])
                ) {
                    return false;
                }
            }
            return true;
        }

        const placeWord = (word, row, col, dirRow, dirCol) => {
            this.solutionBox = {};

            for (let i = 0; i < word.length; i++) {
                const x = col + i * dirCol;
                const y = row + i * dirRow;
                this.setLetter(x, y, word[i].toUpperCase());
                if (i == 0) {
                    this.solutionBox.start = {x, y};
                    this.solutionBox.dir   = [dirRow, dirCol];
                }

                if (i == word.length - 1) {
                    this.solutionBox.end = {x, y};
                }

            }

            this.solutionBoxes.push(this.solutionBox);
        }


        const unplacedWords = [];

        for (let i = 0; i < this.wordSet.length; ++i) {
            const word = words[i];
            
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 100) {
                const row = Math.floor(Math.random() * gridSize.rows);
                const col = Math.floor(Math.random() * gridSize.cols);
                const [dirRow, dirCol] = directions[Math.floor(Math.random() * directions.length)];

                if (canPlaceWord(word, row, col, dirRow, dirCol)) {   
                    placeWord(word, row, col, dirRow, dirCol);
                    placed = true;
                }

                attempts++;
            }

            if (!placed)
                unplacedWords.push(this.wordSet[i]);
        }


        for (const word of unplacedWords) {
            const ind = this.wordSet.indexOf(word);
            if (ind >= 0)
                this.wordSet.splice(ind, 1);
        }

        for (let row = 0; row < gridSize.rows; row++) {
            for (let col = 0; col < gridSize.cols; col++) {
                if (!this.letter(col, row)) {
                    this.setLetter(col, row, String.fromCharCode(65 + Math.floor(Math.random() * 26)));
                }
            }
        }
    }

    setLetter(x, y, letter) {
        this.gridData[y * this.cols + x] = letter;
    }

    clamp(x, y) {
        return [x < 0 ? 0 : (x >= this.cols ? x - 1 : x), y < 0 ? 0 : (y >= this.rows ? y - 1 : y)];
    }

    letter(x, y) {
        [x, y] = this.clamp(x, y);
        return this.gridData[y * this.cols + x];
    }

}


function sampleRandomLetter() {
    const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    return alphabet[Math.floor(Math.random() * (alphabet.length - 1))];
}

export function generateWordGrid(cols, rows, words) {
    return new WordGrid(cols, rows, words);
}

function removeSpaces(words) {
    const result = [];
    for (const word of words) {
        result.push(word.replace(" ", ""));
    }

    return result;
}