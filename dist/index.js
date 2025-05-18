"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usermiddleware_1 = require("./usermiddleware");
const db_1 = require("./db");
const bcrypt_1 = __importStar(require("bcrypt"));
const db_2 = require("./db");
const utils_1 = require("./utils");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const validateinput = zod_1.z.object({
    email: zod_1.z.string().min(5).max(50).email(),
    username: zod_1.z.string().min(5).max(50),
    password: zod_1.z.string().min(8).max(20).regex(/[A-z]/, "Must contain atleast one upper case letter").regex(/[a-z]/, "Must contain Atleast one lowercase").regex(/[0-9]/, "Must contain atleast one number")
});
app.post("/api/v1/signup", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsed = validateinput.safeParse(req.body);
        if (!parsed.success) {
            return res.status(411).json({
                message: "Please Enter the correct Credentials",
                errors: parsed.error.errors,
            });
        }
        const { email, username, password } = parsed.data;
        try {
            const hashedpassword = yield bcrypt_1.default.hash(password, 10);
            const user = yield db_1.usermodel.create({
                email: email,
                username: username,
                password: hashedpassword
            });
            res.status(200).json({
                message: "You are Signed up"
            });
        }
        catch (e) {
            res.status(500).json({
                message: "Server error"
            });
        }
    });
});
app.post("/api/v1/signin", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        try {
            const user = yield db_1.usermodel.findOne({
                email: email
            });
            if (!user) {
                return res.status(403).json({
                    message: "The credentials are wrong"
                });
            }
            const passwordmatch = yield bcrypt_1.default.compare(password, user.password);
            if (user && passwordmatch) {
                const token = jsonwebtoken_1.default.sign({
                    id: user._id,
                    email: email
                }, process.env.JWT_SECRET);
                return res.status(200).json({
                    message: "you are signed in",
                    token
                });
            }
        }
        catch (e) {
            return res.status(500).json({
                message: "Server error"
            });
        }
    });
});
app.post("/api/v1/content", usermiddleware_1.usermiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { link, type, title, tags, userId } = req.body;
        const userid = req.id;
        try {
            yield db_2.contentmodel.create({
                link: link,
                type: type,
                title: title,
                tags: [],
                userId: userid
            });
            res.status(200).json({
                message: "The content added Sucessfully"
            });
        }
        catch (e) {
            res.status(500).json({
                message: "Server Error"
            });
        }
    });
});
app.get("/api/v1/content", usermiddleware_1.usermiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userid = req.id;
        try {
            const content = yield db_2.contentmodel.find({
                userId: userid
            }).populate("userId", "username");
            res.status(200).json({
                content
            });
        }
        catch (e) {
            res.status(500).json({
                message: "Server Error"
            });
        }
    });
});
app.delete("/api/v1/content/:id", usermiddleware_1.usermiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userid = req.id;
        const contentid = req.params.id;
        try {
            const content = yield db_2.contentmodel.findOneAndDelete({
                _id: contentid,
                userId: userid,
            });
            if (content) {
                res.status(200).json({
                    message: "Content Delted Sucessfully"
                });
            }
            else {
                res.json({
                    message: "content not found"
                });
            }
        }
        catch (e) {
            res.status(500).json({
                message: "Server Error"
            });
        }
    });
});
app.post("/api/v1/share", usermiddleware_1.usermiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { share } = req.body;
        if (share) {
            const existinglink = yield db_1.linkmodel.findOne({
                userId: req.id
            });
            if (existinglink) {
                res.json({
                    hash: existinglink.hash
                });
                return;
            }
            yield db_1.linkmodel.create({
                hash: (0, utils_1.hashlink)(10),
                userId: req.id,
            });
            res.json({
                hash: bcrypt_1.hash
            });
        }
        else {
            yield db_1.linkmodel.deleteOne({
                userId: req.id,
            });
            res.json({
                message: "link delted"
            });
        }
    });
});
app.get("/api/v1/share/:sharelink", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const hash = req.params.sharelink;
        const link = yield db_1.linkmodel.findOne({
            hash: hash
        });
        if (!link) {
            res.status(411).json({
                message: "link does not exist"
            });
            return;
        }
        const content = yield db_2.contentmodel.find({
            userId: link.userId
        });
        const user = yield db_1.usermodel.findOne({
            _id: link.userId
        });
        if (!user) {
            res.status(411).json({
                message: "user does not exist"
            });
            return;
        }
        res.json({
            username: user.username,
            content: content
        });
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
