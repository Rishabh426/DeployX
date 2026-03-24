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
const aws_sdk_1 = require("aws-sdk");
const s3 = new aws_sdk_1.S3({
    accessKeyId: "825a1c7ffa7a58bd9b2a88d2cdd0724e",
    secretAccessKey: "bf4afe3bfcf2abba7aa7e55d5e9802a6f38a3d7518410b5b98bd8707298bb6bc",
    endpoint: "https://3ed379d7938b7fe8529a55c36d305443.r2.cloudflarestorage.com",
});
const app = (0, express_1.default)();
app.get(/.*/, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const host = req.hostname;
    const id = host.split(".")[0];
    const filepath = req.path;
    console.log(filepath);
    console.log(`dist/${id}${filepath}`);
    const contents = yield s3.getObject({
        Bucket: "deployx",
        Key: `dist/${id}${filepath}`,
    }).promise();
    const type = filepath.endsWith("html") ? "text/html" : filepath.endsWith("css") ?
        "text/css" : "application/javascript";
    res.set("Content-Type", type);
    res.send(contents.Body);
}));
app.listen(3001);
