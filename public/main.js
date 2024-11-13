import { bbFromFontSize, drawGrid, drawSolutionBoxes } from "./grid-raster.js";
import { computeCellSize, Globals } from "./globals.js";
import { vec2 } from "./math/index.js"; 
import { generateWordGrid } from "./wordgrid.js";
import { inch } from "./utils/conversion.js";

function createDocument(documentSize) {
    return new Document(documentSize);
}

class Document {
    constructor(documentSize) {
        this.documentSize        = documentSize;
        this.documentAspectRatio = 6/9;//this.documentSize.width / this.documentSize.height;
        
        // adjust aspect ratio
        this.documentSize.height = this.documentSize.width / this.documentAspectRatio;

        this.pages = [];
    }

    appendPage(page) {
        page.setDocument(this);
        this.pages.push(page);
        page.onAppend();
    }
    
    build() {
        for (const page of this.pages) {
            // console.log("building ", page);
            page.canvas.width  = this.documentSize.width;
            page.canvas.height = this.documentSize.height;
            
            page.build();
            page.setBase64(page.canvas.toDataURL("image/png", 1));
        }
    }
}

class DocumentPage {
    constructor(pageTitle) {
        this.pageTitle = pageTitle;
        this.document  = null;
        
        this.canvas      = document.createElement("canvas");
        this.ctx         = this.canvas.getContext("2d");
        this.globalYOffset = 0;

        this.base64UrlSnapshot = null;
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

class WordSearchSolutionPage extends DocumentPage {
    constructor(title) {
        super(title);
        this.wordSearchGridPage = null;
    }

    setWordSearchGridPage(instance) {
        this.wordSearchGridPage = instance;
    }

    build() {
        const CANVAS_SIZE = {
            width:  this.document.documentSize.width,
            height: this.document.documentSize.height
        };

        resizeCanvas(this.canvas, CANVAS_SIZE.width, CANVAS_SIZE.height);

        this.wordSearchGridPage.drawSolutionBoxes();
        this.ctx.drawImage(this.wordSearchGridPage.canvas, 0, 0);
    }
}

class WordSearchGridPage extends DocumentPage {
    constructor(themeTitle) {
        super(themeTitle);
        
        this.wordArray             = null;
        this.wordSearchGrid        = null;
        
        this.wordSearchPortionSize = .76;

        this.wordFindGridOffset = null;
        this.gridOutlineX  = 0;

        this.showSolution = false;
    }

    onAppend() {

    }

    parseData(data) {
        this.wordArray      = data.wordArray;
        this.wordSearchGrid = generateWordGrid(Globals.WordSearchConfig.gridSize, Globals.WordSearchConfig.gridSize, this.wordArray);
    }

    build() {

        this._drawTitle();
        this._drawDescription();
        this._buildWordSearchGrid();

        this._drawWordList();

        if (this.showSolution)
            this.drawSolutionBoxes();
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

        computeCellSize(gridPixelSize.width, gridPixelSize.height, Globals.WordSearchConfig.gridSize, Globals.Style.TEXT_MARGIN);

                
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



/*const documentInstance = new WordSearchGridPage("Santa's Workshop", [
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
]);

documentInstance.build();
*/

const documentInstance = createDocument({
    width: inch(11),
    height: inch(9)
});
const documentDescription = {
    categories: [
        {
            name: "Santa's Workshop",
            items: [
                "Elf", "Toys", "Gifts", "Reindeer", "Wrapping",
                "Hammer", "Paint", "Ribbon", "Doll", "Teddy",
                "Glue", "Sled"
            ],
            difficulty: 1
        },
        {
            name: "Christmas Tree Decorations",
            items: [
                "Star", "Lights", "Ornament", "Garland", "Tinsel",
                "Angel", "Ribbon", "Bell", "Icicle", "Bow",
                "Snowman", "Pinecone"
            ],
            difficulty: 1
        },
        {
            name: "Christmas Eve Traditions",
            items: [
                "Stockings", "Cookies", "Milk", "Carols", "Fireplace",
                "Dinner", "Prayer", "Presents", "Stories", "Church",
                "Candles", "Santa"
            ],
            difficulty: 1
        },
        {
            name: "Santa's Reindeer",
            items: [
                "Dasher", "Dancer", "Prancer", "Vixen", "Comet",
                "Cupid", "Donner", "Blitzen", "Rudolph", "Sleigh",
                "Hoof", "Antlers"
            ],
            difficulty: 1
        },
        {
            name: "Winter Wonderland",
            items: [
                "Snow", "Frost", "Ice", "Frozen", "Snowman",
                "Blizzard", "Skate", "Sledding", "Igloo", "Shovel",
                "Parka", "Mittens"
            ],
            difficulty: 1
        },
        {
            name: "Holiday Treats",
            items: [
                "Candy", "Cocoa", "Fudge", "Pie", "Cookies",
                "Cider", "Ginger", "Peppermint", "Truffle", "Cake",
                "Brownie", "Marshmallow"
            ],
            difficulty: 1
        },
        {
            name: "Nativity Scene",
            items: [
                "Manger", "Mary", "Joseph", "Baby", "Sheep",
                "Wise Men", "Angel", "Star", "Donkey", "Stable",
                "Frankincense", "Gold"
            ],
            difficulty: 1
        },
        {
            name: "Christmas Songs",
            items: [
                "Jingle", "Bells", "Silent", "Holy", "Night",
                "Frosty", "Rudolph", "Noel", "Carol", "Drummer",
                "Choir", "Merry"
            ],
            difficulty: 1
        },
        {
            name: "Holiday Colors",
            items: [
                "Red", "Green", "Gold", "Silver", "White",
                "Blue", "Plaid", "Tartan", "Sparkle", "Candy Cane",
                "Emerald", "Crimson"
            ],
            difficulty: 1
        },
        {
            name: "Gift Wrapping",
            items: [
                "Bow", "Ribbon", "Paper", "Tape", "Tag",
                "Box", "Gift Bag", "Scissors", "Twine", "Foil",
                "Wrap", "Label"
            ],
            difficulty: 1
        },
        
        {
            name: "Christmas Dinner",
            items: [
                "Turkey", "Ham", "Gravy", "Cranberry", "Stuffing",
                "Potatoes", "Pudding", "Pie", "Rolls", "Carrots",
                "Corn", "Roast"
            ],
            difficulty: 2
        },
        {
            name: "Letters to Santa",
            items: [
                "List", "Envelope", "Stamp", "Ink", "Pen",
                "Wish", "Elf", "Post", "Seal", "Dear",
                "Address", "Mail"
            ],
            difficulty: 2
        },
        {
            name: "Snowy Activities",
            items: [
                "Snowball", "Snowman", "Sled", "Skate", "Ski",
                "Snowshoe", "Igloo", "Hike", "Build", "Fort",
                "Slide", "Toboggan"
            ],
            difficulty: 2
        },
        {
            name: "Christmas Movies",
            items: [
                "Elf", "Grinch", "Home Alone", "Santa", "Miracle",
                "Scrooge", "Holiday", "Jack Frost", "Rudolph", "Krampus",
                "Nutcracker", "Frozen"
            ],
            difficulty: 2
        },
        {
            name: "Holiday Lights",
            items: [
                "String", "Lantern", "Glow", "Bright", "Candle",
                "Twinkle", "Bulb", "Shine", "Flicker", "Decor",
                "Beam", "Sparkle"
            ],
            difficulty: 2
        },
        {
            name: "Polar Express",
            items: [
                "Train", "Ticket", "Conductor", "Bell", "Track",
                "Hot Cocoa", "Steam", "Snow", "Whistle", "Ride",
                "Night", "Journey"
            ],
            difficulty: 2
        },
        {
            name: "Christmas at the North Pole",
            items: [
                "Elf", "Igloo", "Santa", "Sleigh", "Workshop",
                "Aurora", "Penguin", "Polar Bear", "Reindeer", "Snow",
                "Lights", "Cookies"
            ],
            difficulty: 2
        },
        {
            name: "Gingerbread House",
            items: [
                "Ginger", "Roof", "Candy", "Wall", "Icing",
                "Chimney", "Door", "Window", "Peppermint", "Lollipop",
                "Cookie", "Gumdrop"
            ],
            difficulty: 2
        },
        {
            name: "Holiday Shopping",
            items: [
                "Mall", "List", "Bags", "Cash", "Cart",
                "Gifts", "Crowd", "Sales", "Wrap", "Receipt",
                "Queue", "Toys"
            ],
            difficulty: 2
        },
        {
            name: "Christmas Morning",
            items: [
                "Presents", "Stockings", "Tree", "Coffee", "Family",
                "Unwrap", "Joy", "Slippers", "Brunch", "Excitement",
                "Fireplace", "Games"
            ],
            difficulty: 2
        },
        
        {
            name: "Caroling Night",
            items: [
                "Songs", "Carols", "Candles", "Sleigh", "Choir",
                "Joy", "Neighbors", "Voices", "Hats", "Mittens",
                "Bells", "Merry"
            ],
            difficulty: 3
        },
        {
            name: "Stocking Stuffers",
            items: [
                "Candy", "Toys", "Notes", "Socks", "Pens",
                "Keychain", "Gum", "Stickers", "Chocolate", "Puzzle",
                "Lip Balm", "Cards"
            ],
            difficulty: 3
        },
        {
            name: "Snow Day",
            items: [
                "Snow", "Sled", "Build", "Igloo", "Skate",
                "Snowball", "Fort", "Shovel", "Freeze", "Coat",
                "Mittens", "Parka"
            ],
            difficulty: 3
        },
        {
            name: "Cozy Fireplace",
            items: [
                "Warm", "Firewood", "Logs", "Blanket", "Cocoa",
                "Flames", "Smoke", "Stockings", "Crackling", "Chimney",
                "Ash", "Gloves"
            ],
            difficulty: 3
        },
        {
            name: "Christmas Animals",
            items: [
                "Reindeer", "Polar Bear", "Penguin", "Robin", "Squirrel",
                "Owl", "Fox", "Hedgehog", "Hare", "Moose",
                "Cardinal", "Husky"
            ],
            difficulty: 3
        },
        {
            name: "Holiday Sweaters",
            items: [
                "Ugly", "Knit", "Warm", "Reindeer", "Snowflake",
                "Tree", "Wool", "Pattern", "Elf", "Santa",
                "Buttons", "Tinsel"
            ],
            difficulty: 3
        },
        {
            name: "Christmas Around the World",
            items: [
                "Tradition", "Food", "Dance", "Music", "Santa",
                "Custom", "Festival", "Lights", "Market", "Gift",
                "Fireworks", "Parade"
            ],
            difficulty: 3
        },
        {
            name: "Famous Christmas Stories",
            items: [
                "Scrooge", "Tiny Tim", "Grinch", "Nutcracker", "Miracle",
                "Elf", "Rudolph", "Santa", "Frosty", "Ghosts",
                "Holiday", "Snowman"
            ],
            difficulty: 3
        },
        {
            name: "Holiday Baking",
            items: [
                "Cookies", "Cakes", "Gingerbread", "Pie", "Flour",
                "Oven", "Rolling Pin", "Sugar", "Spices", "Icing",
                "Cupcakes", "Pan"
            ],
            difficulty: 3
        },
        {
            name: "December Calendar",
            items: [
                "Date", "Holidays", "Advent", "Countdown", "Plans",
                "Christmas", "Parties", "Decorate", "Celebrate", "New Year",
                "Shopping", "Events"
            ],
            difficulty: 3
        },{
            name: "Elf Activities",
            items: [
                "Toy Making", "Gift Wrapping", "Painting", "Hammering", "Singing",
                "Dancing", "Snowball Fights", "Decorating", "Caroling", "Cookie Baking",
                "Sleigh Riding", "Skating"
            ],
            difficulty: 1
        },
        {
            name: "Letters and Cards",
            items: [
                "Envelope", "Stamp", "Ink", "Message", "Greeting",
                "Signature", "Wish", "Post", "Seal", "Address",
                "Card", "Letter"
            ],
            difficulty: 1
        },
        {
            name: "Holiday Wishes",
            items: [
                "Joy", "Peace", "Love", "Health", "Happiness",
                "Prosperity", "Warmth", "Kindness", "Magic", "Laughter",
                "Comfort", "Dreams"
            ],
            difficulty: 1
        },
        {
            name: "Christmas Market",
            items: [
                "Stalls", "Gifts", "Food", "Lights", "Tree",
                "Mulled Wine", "Ornaments", "Candles", "Toys", "Treats",
                "Music", "Crowd"
            ],
            difficulty: 1
        },
        {
            name: "Candy Cane Forest",
            items: [
                "Candy", "Red", "White", "Sweet", "Minty",
                "Stripes", "Forest", "Trees", "Snow", "Branches",
                "Hiding", "Path"
            ],
            difficulty: 1
        },
        {
            name: "Festive Pajamas",
            items: [
                "Flannel", "Warm", "Plaid", "Fleece", "Buttons",
                "Elastic", "Patterns", "Hats", "Socks", "Comfort",
                "Holiday", "Sleep"
            ],
            difficulty: 1
        },
        {
            name: "The Nutcracker",
            items: [
                "Ballet", "Dance", "Soldier", "Mouse King", "Clara",
                "Tree", "Sugarplum", "Orchestra", "Toys", "Snowflakes",
                "Magic", "Kingdom"
            ],
            difficulty: 1
        },
        {
            name: "Holiday Books",
            items: [
                "Stories", "Tales", "Classics", "Illustrations", "Magic",
                "Characters", "Legends", "Snow", "Merry", "Joyful",
                "Family", "Tradition"
            ],
            difficulty: 1
        },
        {
            name: "Ugly Sweater Party",
            items: [
                "Sweater", "Pattern", "Knitted", "Ugly", "Reindeer",
                "Snowman", "Santa", "Elf", "Lights", "Tinsel",
                "Laughs", "Photos"
            ],
            difficulty: 1
        },
        {
            name: "Winter Wildlife",
            items: [
                "Deer", "Fox", "Squirrel", "Owl", "Rabbit",
                "Bear", "Wolf", "Hawk", "Moose", "Eagle",
                "Seal", "Penguin"
            ],
            difficulty: 1
        },
        
        {
            name: "Christmas Countdown",
            items: [
                "Calendar", "Days", "Advent", "Surprise", "Countdown",
                "Gifts", "Decor", "Wreath", "Joy", "Plan",
                "Activities", "Tree"
            ],
            difficulty: 2
        },
        {
            name: "Holiday Mailbox",
            items: [
                "Letters", "Cards", "Delivery", "Post", "Mail",
                "Santa", "Envelope", "Stamp", "Wish", "Elf",
                "Address", "Greeting"
            ],
            difficulty: 2
        },
        {
            name: "Christmas Parade",
            items: [
                "Floats", "Marching", "Balloons", "Crowds", "Music",
                "Dancers", "Santa", "Confetti", "Celebration", "Costumes",
                "Street", "Fireworks"
            ],
            difficulty: 2
        },
        {
            name: "Holiday Classroom Party",
            items: [
                "Games", "Treats", "Decor", "Presents", "Crafts",
                "Songs", "Storytime", "Joy", "Santa Hat", "Cards",
                "Gifts", "Candy"
            ],
            difficulty: 2
        },
        {
            name: "Warm Winter Drinks",
            items: [
                "Hot Chocolate", "Cider", "Tea", "Coffee", "Marshmallow",
                "Spices", "Mug", "Cinnamon", "Steam", "Peppermint",
                "Whipped Cream", "Latte"
            ],
            difficulty: 2
        },
        {
            name: "Snowy Adventure",
            items: [
                "Ski", "Snowboard", "Snowshoe", "Hike", "Snowmobile",
                "Igloo", "Toboggan", "Snowball", "Freeze", "Trail",
                "Peak", "Sledding"
            ],
            difficulty: 2
        },
        {
            name: "Festive Wreaths",
            items: [
                "Evergreen", "Pinecones", "Ribbon", "Bow", "Ornaments",
                "Holly", "Berries", "Lights", "Circle", "Decor",
                "Door", "Candle"
            ],
            difficulty: 2
        },
        {
            name: "Ornament Collection",
            items: [
                "Glass", "Baubles", "Tinsel", "Shine", "Sparkle",
                "Tree", "Handmade", "Family", "Star", "Wooden",
                "Painted", "Hang"
            ],
            difficulty: 2
        },
        {
            name: "Santa's Sleigh Ride",
            items: [
                "Sleigh", "Reindeer", "Snow", "Gifts", "Chimney",
                "Night", "Stars", "Jingle", "Sky", "Hooves",
                "Santa", "Flight"
            ],
            difficulty: 2
        },
        {
            name: "Wrapping Up the Holidays",
            items: [
                "Boxes", "Paper", "Tape", "Ribbon", "Bow",
                "Gift", "Decor", "Scissors", "Card", "Tag",
                "Foil", "String"
            ],
            difficulty: 2
        },
        
        {
            name: "Santa's Nice List",
            items: [
                "Good", "Kind", "Nice", "Gift", "Elf",
                "Wish", "Hope", "List", "Letter", "Child",
                "Santa", "Magic"
            ],
            difficulty: 3
        },
        {
            name: "Santa's Naughty List",
            items: [
                "Coal", "Mischief", "Naughty", "Pranks", "Trouble",
                "Elf", "Gift", "List", "Child", "Hope",
                "Letter", "Santa"
            ],
            difficulty: 3
        },
        {
            name: "Christmas in the City",
            items: [
                "Lights", "Storefronts", "Ice Rink", "Crowds", "Snow",
                "Tree", "Parade", "Markets", "Shopping", "Decor",
                "Santa", "Cab"
            ],
            difficulty: 3
        },
        {
            name: "Winter Sports",
            items: [
                "Skiing", "Snowboarding", "Ice Skating", "Hockey", "Snowshoeing",
                "Sledding", "Curling", "Snowmobiling", "Bobsled", "Avalanche",
                "Goggles", "Gear"
            ],
            difficulty: 3
        },
        {
            name: "Festive Feast",
            items: [
                "Turkey", "Ham", "Mashed Potatoes", "Gravy", "Pie",
                "Rolls", "Stuffing", "Cranberry", "Salad", "Cider",
                "Casserole", "Pudding"
            ],
            difficulty: 3
        },
        {
            name: "Magical Snowflakes",
            items: [
                "Unique", "Frozen", "Crystal", "Ice", "Fall",
                "Drift", "Pattern", "Sparkle", "Cold", "Shimmer",
                "Whirl", "Flurry"
            ],
            difficulty: 3
        },
        {
            name: "Christmas Elf Names",
            items: [
                "Buddy", "Jingle", "Pepper", "Snowflake", "Twinkle",
                "Cookie", "Pine", "Spark", "Cinnamon", "Frosty",
                "Doodle", "Tinsel"
            ],
            difficulty: 3
        },
        {
            name: "Under the Mistletoe",
            items: [
                "Kiss", "Love", "Green", "Red", "Berries",
                "Tradition", "Holly", "Branch", "Hug", "Snow",
                "Decor", "Surprise"
            ],
            difficulty: 3
        },
        {
            name: "Santa's Sleigh Gear",
            items: [
                "Reins", "Bell", "Bag", "Seat", "Hooves",
                "Harness", "Magic", "Jingle", "Sleigh", "Wood",
                "Runners", "Glisten"
            ],
            difficulty: 3
        },
        {
            name: "Holiday Countdown",
            items: [
                "Days", "Advent", "Joy", "Excitement", "Plan",
                "Wish", "List", "Decor", "Surprise", "Gifts",
                "Hope", "Calendar"
            ],
            difficulty: 3
        },
        {
            name: "Christmas Shopping List",
            items: [
                "Toys", "Clothes", "Gadgets", "Books", "Wrapping Paper",
                "Decor", "Lights", "Gift Cards", "Bows", "Stockings",
                "Candy", "Games"
            ],
            difficulty: 1
        },
        {
            name: "Festive Fashion",
            items: [
                "Sweater", "Scarf", "Hat", "Mittens", "Boots",
                "Jacket", "Dress", "Sparkle", "Sequins", "Plaid",
                "Gloves", "Coat"
            ],
            difficulty: 1
        },
        {
            name: "Holiday Cheers",
            items: [
                "Toast", "Laughter", "Joy", "Hugs", "Smiles",
                "Friends", "Family", "Clink", "Party", "Celebration",
                "Cheers", "Wishes"
            ],
            difficulty: 1
        },
        {
            name: "Santa's Beard",
            items: [
                "White", "Fluffy", "Soft", "Curly", "Long",
                "Santa", "Magic", "Snow", "Brushed", "Warm",
                "Groomed", "Legend"
            ],
            difficulty: 1
        },
        {
            name: "Letters to the North Pole",
            items: [
                "Letter", "Post", "Wish", "Santa", "Envelope",
                "Address", "Elf", "List", "Stamp", "Ink",
                "Signature", "Mailbox"
            ],
            difficulty: 1
        },
        {
            name: "Winter Animals",
            items: [
                "Reindeer", "Polar Bear", "Arctic Fox", "Snowy Owl", "Seal",
                "Penguin", "Wolf", "Moose", "Hare", "Eagle",
                "Otter", "Lynx"
            ],
            difficulty: 1
        },
        
        {
            name: "Family Traditions",
            items: [
                "Tree Decorating", "Caroling", "Baking Cookies", "Storytelling", "Game Night",
                "Gift Exchange", "Dinner", "Photos", "Ornaments", "Movie Night",
                "Stockings", "Fireplace"
            ],
            difficulty: 2
        },
        {
            name: "Christmas Candles",
            items: [
                "Flame", "Wax", "Scented", "Glow", "Flicker",
                "Red", "White", "Gold", "Holder", "Table",
                "Light", "Warmth"
            ],
            difficulty: 2
        },
        {
            name: "Santa's Arrival",
            items: [
                "Sleigh", "Reindeer", "Roof", "Chimney", "Jingle",
                "Magic", "Presents", "Santa", "Laugh", "Cookies",
                "Milk", "Night"
            ],
            difficulty: 2
        },
        {
            name: "Christmas Cookies",
            items: [
                "Sugar", "Gingerbread", "Chocolate Chip", "Frosting", "Sprinkles",
                "Shapes", "Dough", "Baking", "Oven", "Sweet",
                "Decorate", "Plate"
            ],
            difficulty: 2
        },
        {
            name: "Winter Solstice",
            items: [
                "Shortest Day", "Sun", "Cold", "Snow", "Ancient",
                "Celebrate", "Stars", "Moon", "Fire", "Tradition",
                "Sky", "Dark"
            ],
            difficulty: 2
        },
        {
            name: "Holiday Dance Party",
            items: [
                "Music", "Lights", "Dance", "Moves", "Fun",
                "Friends", "Celebration", "Beat", "DJ", "Glow",
                "Joy", "Laughter"
            ],
            difficulty: 2
        },
        
        {
            name: "Christmas Carols",
            items: [
                "Singing", "Joyful", "Lyrics", "Melody", "Choir",
                "Hymns", "Tradition", "Harmony", "Music", "Snow",
                "Angels", "Voices"
            ],
            difficulty: 3
        },
        {
            name: "Christmas Eve Dreams",
            items: [
                "Sleep", "Wish", "Santa", "Presents", "Stars",
                "Night", "Magic", "Stockings", "Fireplace", "Cozy",
                "Hopes", "Dream"
            ],
            difficulty: 3
        },
        {
            name: "Santa's Belt and Boots",
            items: [
                "Black", "Leather", "Shiny", "Buckle", "Gold",
                "Boots", "Stomp", "Hoof", "Polished", "Heavy",
                "Santa", "Outfit"
            ],
            difficulty: 3
        },
        {
            name: "Festive Bells",
            items: [
                "Ringing", "Gold", "Silver", "Joyful", "Loud",
                "Small", "Big", "Jingle", "Holiday", "Sound",
                "Music", "Cheer"
            ],
            difficulty: 3
        },
        {
            name: "Christmas Fairy Tales",
            items: [
                "Magic", "Wish", "Santa", "Elves", "Stories",
                "Dreams", "Wonder", "Happily", "Ever After", "Snow",
                "Legends", "Characters"
            ],
            difficulty: 3
        },
        {
            name: "Frozen Lake Fun",
            items: [
                "Skating", "Ice", "Frozen", "Glide", "Cold",
                "Snow", "Play", "Slip", "Shiny", "Skates",
                "Snowflakes", "Adventure"
            ],
            difficulty: 3
        },
        {
            name: "Holiday Train Ride",
            items: [
                "Tracks", "Whistle", "Steam", "Ride", "Journey",
                "Snow", "Scenery", "Passengers", "Tickets", "Magic",
                "Santa", "Lights"
            ],
            difficulty: 3
        },
        {
            name: "Santa's Map",
            items: [
                "Route", "World", "Cities", "Houses", "Plan",
                "Journey", "Gifts", "List", "Magic", "Compass",
                "Night", "Sky"
            ],
            difficulty: 3
        }
    ]
};

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

for (let i = 0; i < 12; ++i) {
    document.body.appendChild(documentInstance.pages[i].canvas);
}

console.log(documentInstance.pages);

function resizeCanvas(c, width, height) {
    c.width  = width;
    c.height = height;
}