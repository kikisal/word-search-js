const TOKEN_LEN = 24;

const generateToken = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < TOKEN_LEN; i++)
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    
    return result;
}

const tokenMap = new Map();

function validTypeCheck(res, body) {    
    if (typeof body.chunks == "undefined")
    {
        res.json({
            status: "failed",
            reasong: "chunks not specified"
        });

        return false;
    }

    if (typeof body.chunks != "number")
    {
        res.json({
            status: "failed",
            reasong: "chunks field must be a number"
        });

        return false;
    }

    return true;
}

module.exports = {
    tokenMap: tokenMap,
    CreateToken: {
        methods: ["POST"],
        handle(req, res) {
            const token = generateToken();

            if (!validTypeCheck(res, req.body))
                return;

            tokenMap.set(token, {
                chunkCount: req.body.chunks,
                chunks: [],
                bracketCounts: 0
            });
            

            res.json({
                status: "success",
                token: token
            });
        
        }
    }
}