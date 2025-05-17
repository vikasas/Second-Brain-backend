"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkmodel = exports.tagmodel = exports.contentmodel = exports.usermodel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Schema = mongoose_1.default.Schema;
const ObjectID = mongoose_1.default.Types.ObjectId;
dotenv_1.default.config();
mongoose_1.default.connect(process.env.MONGO_URL);
const user = new Schema({
    email: { type: String, unique: true, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true }
});
// const  contenttype = ['image', 'video', 'article', 'audio'];
const content = new Schema({
    link: { type: String, required: true },
    type: String,
    title: { type: String, required: true },
    tags: [{ type: ObjectID, ref: 'Tags' }],
    userId: { type: ObjectID, ref: 'Users', required: true }
});
const tags = new Schema({
    title: { type: String, required: true, unique: true }
});
const links = new Schema({
    hash: { type: String, required: true },
    userId: { type: ObjectID, ref: 'User', required: true },
});
exports.usermodel = mongoose_1.default.model("Users", user);
exports.contentmodel = mongoose_1.default.model("Contents", content);
exports.tagmodel = mongoose_1.default.model("Tags", tags);
exports.linkmodel = mongoose_1.default.model("Links", links);
