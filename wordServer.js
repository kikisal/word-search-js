const express = require("express");
const { DescriptionHandler } = require("./handlers/description-handler");
const { SaveHandler }        = require("./handlers/save-handler");
const bodyParser = require("body-parser");
const { CreateToken } = require("./handlers/create-token");

const app = express();

const PORT      = 4000;

const handlers = {
    description:    DescriptionHandler,
    save:           SaveHandler,
    "create-token": CreateToken
}

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin",    "*");
    res.setHeader("Access-Control-Allow-Headers",   "*");
    res.setHeader("Access-Control-Request-Headers", "*");
    
    next();
});

app.use(bodyParser.raw({ type: 'application/octet-stream' }));
app.use(express.json());

app.use("/api/v1/:path", (req, res) => {
    const path = req.params.path;
    if (!(path in handlers))
        res.send("Handler not found");
    else {
        const handler = handlers[path];

        if (!(handler.methods.includes(req.method))) {
            res.send(`Invalid request data for route ${path}`);
            return;
        }

        try {
            handler.handle(req, res);
        } catch(ex) {
            console.log(`Exception caught in handling request. ${ex}`);
            if(!res.headersSent)
                res.sendStatus(500);
        }
    }
});

app.listen(PORT, () => {
    console.log("server listening to port", PORT);
});