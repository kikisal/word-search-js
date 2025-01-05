const fs   = require("fs");
const path = require("path");
const { tokenMap } = require("./create-token");
const { debuggingMode } = require("./../server.config");

function errCode(code) {
    if (debuggingMode)
        return ` - ${code}`;

    return "";
}


module.exports = {
    SaveHandler: {
        methods: ["POST"],
        handle(req, res) {

            const token = req.headers["transfer-token"];
            if (!token) {
                res.json({
                    status: "failed",
                    reason: `invalid token${errCode(0)}`
                });
                return;
            }

            const uploadState = tokenMap.get(token);
            if (!uploadState) {
                res.json({
                    status: "failed",
                    reason: `invalid token${errCode(1)}`
                });
                return;
            }

            const data = req.body;

            
            if (!(data instanceof Buffer)) {
                res.json({
                    status: "failed",
                    reason: "invalid chunk data format"
                });

                return;
            }

            if (!data) {
                res.json({
                    status: "failed",
                    reason: "bad chunk data"
                });

                return;
            }

            const jsonChunk = data.toString("utf-8");
            uploadState.chunks.push(jsonChunk);


            if (uploadState.chunks.length >= uploadState.chunkCount) {
                res.json({
                    status: "success",
                    uploadState: "complete"
                });

                
                try {
                    const docObj = JSON.parse(uploadState.chunks.join(""));
                    
                    for (const doc of docObj) {
                        const base64Data = doc.docImage.replace(/^data:image\/\w+;base64,/, "");
                        fs.writeFileSync(path.join(process.cwd(), "storage", `${token}-${doc.index}.png`), Buffer.from(base64Data, "base64"));
                    }
                } catch(ex) {
                    console.log("Invalid uploaded document data: ", ex);
                }
                

                tokenMap.delete(token);
                return;
            }

            res.json({
                status: "success",
                uploadState: "needs-more"
            });
        }
    }
}