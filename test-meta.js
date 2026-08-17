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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var crypto = require("crypto");
var axios_1 = require("axios");
var prisma = new client_1.PrismaClient();
var ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";
function decrypt(cipherText) {
    var ALGORITHM = "aes-256-gcm";
    var key = Buffer.from(ENCRYPTION_KEY, "hex");
    var _a = cipherText.split(":"), ivHex = _a[0], tagHex = _a[1], encryptedData = _a[2];
    var iv = Buffer.from(ivHex, "hex");
    var tag = Buffer.from(tagHex, "hex");
    var decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    var decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
function test() {
    return __awaiter(this, void 0, void 0, function () {
        var waba, token, payload, res, e_1, e_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, prisma.whatsAppAccount.findFirst({
                            where: { workspace_id: { startsWith: '3b04fc39' } }
                        })];
                case 1:
                    waba = _b.sent();
                    if (!waba) {
                        console.log('No WABA found');
                        return [2 /*return*/];
                    }
                    token = decrypt(waba.access_token);
                    console.log('Phone ID:', waba.phone_number_id);
                    payload = {
                        messaging_product: "whatsapp",
                        recipient_type: "individual",
                        to: "918667634636", // Must use a real test number
                        type: "interactive",
                        interactive: {
                            type: "product_list",
                            header: { type: "text", text: "Catalog" },
                            body: { text: "Browse products" },
                            footer: { text: "Footer" },
                            action: {
                                catalog_id: "4423126644641809",
                                sections: [
                                    {
                                        title: "Selected Products",
                                        product_items: [
                                            { product_retailer_id: "16635" },
                                            { product_retailer_id: "16443" },
                                            { product_retailer_id: "16441" },
                                            { product_retailer_id: "16440" }
                                        ]
                                    }
                                ]
                            }
                        }
                    };
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, axios_1.default.post("https://graph.facebook.com/v19.0/".concat(waba.phone_number_id, "/messages"), payload, { headers: { Authorization: "Bearer ".concat(token) } })];
                case 3:
                    res = _b.sent();
                    console.log("Success!", res.data);
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _b.sent();
                    console.log("Meta API Error:", JSON.stringify((_a = e_1.response) === null || _a === void 0 ? void 0 : _a.data, null, 2));
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 7];
                case 6:
                    e_2 = _b.sent();
                    console.error("Script error:", e_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
test();
