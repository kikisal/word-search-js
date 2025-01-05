const fs   = require("fs");
const path = require("path");

module.exports = {
    DescriptionHandler: {
        methods: ["POST", "GET"],
        handle(req, res) {
            switch(req.method) {
                case "GET": {
                    const content = fs.readFileSync(path.join(process.cwd(), "document.desc.json"));
                    res.json({
                        status: "success",
                        data: JSON.parse(content.toString("utf-8"))
                    });
                }
            }
        }
    }
}