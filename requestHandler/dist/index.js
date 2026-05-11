"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const aws_sdk_1 = require("aws-sdk");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const s3 = new aws_sdk_1.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_ENDPOINT,
});
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.get(/.*/, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(process.env.accessKeyId);
    const host = req.hostname;
    const parts = host.split(".");
    let id;
    let filepath;
    if (host === "localhost" || parts.length < 3) {
        const pathParts = req.path.split("/").filter(Boolean);
        const firstSegment = pathParts[0] || "";
        // asset request — first segment is "assets" or contains a dot (file extension)
        const isAssetRequest = !firstSegment ||
            firstSegment === "assets" ||
            firstSegment.includes(".") ||
            firstSegment === ".well-known";
        if (isAssetRequest) {
            // get deployment ID from cookie set when index.html was served
            id = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.deploymentId) || "";
            filepath = req.path;
        }
        else {
            // first segment is the deployment ID
            id = firstSegment;
            filepath =
                pathParts.length >= 2
                    ? "/" + pathParts.slice(1).join("/")
                    : "/index.html";
            // save ID in cookie so asset requests know which deployment to serve
            res.cookie("deploymentId", id, {
                httpOnly: false,
                maxAge: 1000 * 60 * 60, // 1 hour
            });
        }
    }
    else {
        // subdomain-based: abc123.domain.com
        id = parts[0];
        filepath = req.path;
    }
    console.log("id:", id, "filepath:", filepath);
    if (!id) {
        res.status(400).send("No deployment ID found");
        return;
    }
    const finalPath = filepath === "/" ? "/index.html" : filepath;
    try {
        const contents = yield s3
            .getObject({
            Bucket: "deployx",
            Key: `dist/${id}${finalPath}`,
        })
            .promise();
        const type = finalPath.endsWith(".html")
            ? "text/html"
            : finalPath.endsWith(".css")
                ? "text/css"
                : finalPath.endsWith(".js")
                    ? "application/javascript"
                    : finalPath.endsWith(".png")
                        ? "image/png"
                        : finalPath.endsWith(".jpg") || finalPath.endsWith(".jpeg")
                            ? "image/jpeg"
                            : finalPath.endsWith(".svg")
                                ? "image/svg+xml"
                                : finalPath.endsWith(".ico")
                                    ? "image/x-icon"
                                    : finalPath.endsWith(".json")
                                        ? "application/json"
                                        : "application/octet-stream";
        res.set("Content-Type", type);
        res.send(contents.Body);
    }
    catch (err) {
        if (err.code === "NoSuchKey") {
            // SPA fallback — serve index.html for client-side routes
            try {
                const index = yield s3
                    .getObject({
                    Bucket: "deployx",
                    Key: `dist/${id}/index.html`,
                })
                    .promise();
                res.set("Content-Type", "text/html");
                res.send(index.Body);
            }
            catch (_b) {
                res.status(404).send("Deployment not found");
            }
        }
        else {
            console.error("S3 error:", err);
            res.status(500).send("Error fetching file");
        }
    }
}));
app.listen(3001, () => console.log("Request handler running on port 3001"));
