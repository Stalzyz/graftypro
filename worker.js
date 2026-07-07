"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.campaignWorker = void 0;
var bullmq_1 = require("bullmq");
var db_1 = require("@/lib/db");
var service_1 = require("@/lib/whatsapp/service");
var flow_runner_1 = require("@/lib/engine/flow-runner");
var encryption_1 = require("@/lib/security/encryption");
var media_downloader_1 = require("@/lib/whatsapp/media-downloader");
var message_normalizer_1 = require("@/lib/engine/message-normalizer");
var queue_1 = require("@/lib/queue");
var redis_status_1 = require("@/lib/redis-status");
// --- CONFIG ---
// ☢️ PRODUCTION-AWARE REDIS: In Docker (NODE_ENV=production), default to service name 'redis'
// unless REDIS_HOST is explicitly set to something else. Matches queue.ts logic.
var _rHost = (function () {
    var isProd = process.env.NODE_ENV === "production";
    var envHost = process.env.REDIS_HOST;
    if (process.env.REDIS_URL) {
        try {
            return new URL(process.env.REDIS_URL).hostname;
        }
        catch (_a) { }
    }
    return isProd ? (envHost && envHost !== "localhost" ? envHost : "redis") : (envHost || "localhost");
})();
var REDIS_CONNECTION = {
    host: _rHost,
    port: parseInt(process.env.REDIS_PORT || "6379"),
};
console.log("\uD83D\uDD0C [Worker] Redis Connection: ".concat(_rHost, ":").concat(process.env.REDIS_PORT || "6379"));
// --- STARTUP CONNECTIVITY TEST & HEALTH MONITORING ---
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, dripDispatchQueue, automationQueue, HealthMonitorService_1, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("🚀 [Worker] Starting up...");
                console.log("🔗 [Worker] Testing Database Connection...");
                _b.label = 1;
            case 1:
                _b.trys.push([1, 9, , 10]);
                return [4 /*yield*/, db_1.prisma.$connect()];
            case 2:
                _b.sent();
                console.log("✅ [Worker] Database Connected successfully.");
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/queue"); })];
            case 3:
                _a = _b.sent(), dripDispatchQueue = _a.dripDispatchQueue, automationQueue = _a.automationQueue;
                if (!dripDispatchQueue) return [3 /*break*/, 5];
                return [4 /*yield*/, dripDispatchQueue.add("drip-pulse", {}, { repeat: { every: 60000 } })];
            case 4:
                _b.sent();
                console.log("⏱️ [Worker] Drip Pulse scheduled (Every 60s)");
                _b.label = 5;
            case 5:
                if (!automationQueue) return [3 /*break*/, 7];
                return [4 /*yield*/, automationQueue.add("nightly-reconciliation", {}, {
                        repeat: { pattern: "0 2 * * *" } // Run at 2 AM every night
                    })];
            case 6:
                _b.sent();
                console.log("🌙 [Worker] Nightly Reconciliation scheduled (2 AM)");
                _b.label = 7;
            case 7: return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/whatsapp/health-monitor"); })];
            case 8:
                HealthMonitorService_1 = (_b.sent()).HealthMonitorService;
                console.log("🩺 [Worker] Initializing Connection Health Monitor...");
                HealthMonitorService_1.runGlobalHealthCheck().catch(console.error);
                setInterval(function () {
                    HealthMonitorService_1.runGlobalHealthCheck().catch(console.error);
                }, 6 * 60 * 60 * 1000);
                return [3 /*break*/, 10];
            case 9:
                err_1 = _b.sent();
                console.error("❌ [Worker] CRITICAL: DB connection failed!", err_1);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); })();
// ---------------------------------------------------------
// 1. META API WORKER (Prioritized Outbound Layer)
// ---------------------------------------------------------
var metaApiWorker = new bullmq_1.Worker("meta-api-queue", function (job) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, type, payload, toRaw, to, phoneNumberId, accessToken, workspaceId, campaignId, category, existing, cachedStatus, currentStatus, _b, throttleKey, isAllowed, skipFatigue, fatigued, result, _c, mediaType, metaMessageId, chatPreviewBody_1, chatButtons, template, components, bodyComp, buttonComp, bodyParams, e_1, conversation, stats, campaign, processed, err_2, responseData, metaErrorCode, metaErrorMessage, isTemplateError, isBillingError, isFatal, updatedStats, processed;
    var _d, _e, _f, _g, _h, _j, _k, _l, _m;
    return __generator(this, function (_o) {
        switch (_o.label) {
            case 0:
                _a = job.data, type = _a.type, payload = _a.payload;
                toRaw = payload.to || payload.phone || "";
                to = toRaw.replace(/\D/g, "");
                if (to.length === 10)
                    to = "91" + to; // Auto-fix missing country code for India
                if (to.length === 12 && to.startsWith("0"))
                    to = to.substring(1); // Fix 0-prefixing
                console.log("[MetaAPIWorker] \uD83D\uDCE1 Processing ".concat(type, " for ").concat(to, " (Priority: ").concat(job.opts.priority || 'DEFAULT', ")"));
                phoneNumberId = payload.phoneNumberId, accessToken = payload.accessToken;
                _o.label = 1;
            case 1:
                _o.trys.push([1, 52, , 58]);
                workspaceId = payload.workspaceId;
                campaignId = payload.campaignId;
                category = type === "SEND_TEMPLATE" ? "MARKETING" : "SERVICE";
                if (!(campaignId && payload.contactId)) return [3 /*break*/, 3];
                return [4 /*yield*/, db_1.prisma.message.findFirst({
                        where: {
                            contact_id: payload.contactId,
                            campaign_id: campaignId,
                            status: { in: ["SENT", "DELIVERED", "READ"] }
                        },
                        select: { id: true, meta_id: true }
                    })];
            case 2:
                existing = _o.sent();
                if (existing && existing.meta_id) {
                    console.warn("[MetaAPIWorker] \uD83D\uDEE1\uFE0F Idempotency Trigger: Message already sent for contact ".concat(payload.contactId, " in campaign ").concat(campaignId, "."));
                    return [2 /*return*/, { messages: [{ id: existing.meta_id }] }]; // Return success to drain job
                }
                _o.label = 3;
            case 3:
                if (!campaignId) return [3 /*break*/, 10];
                return [4 /*yield*/, redis_status_1.CampaignStatusCache.get(campaignId)];
            case 4:
                cachedStatus = _o.sent();
                _b = cachedStatus;
                if (_b) return [3 /*break*/, 6];
                return [4 /*yield*/, db_1.prisma.campaign.findUnique({
                        where: { id: campaignId },
                        select: { status: true }
                    })];
            case 5:
                _b = ((_d = (_o.sent())) === null || _d === void 0 ? void 0 : _d.status);
                _o.label = 6;
            case 6:
                currentStatus = _b;
                if (!(currentStatus === "PAUSED")) return [3 /*break*/, 8];
                console.log("[MetaAPIWorker] \u23F8\uFE0F Campaign ".concat(campaignId, " paused. Yielding job."));
                return [4 /*yield*/, job.moveToDelayed(Date.now() + 15000, job.token)];
            case 7:
                _o.sent(); // Retry in 15s instead of 30s
                return [2 /*return*/];
            case 8:
                if (currentStatus === "CANCELLED") {
                    console.log("[MetaAPIWorker] \uD83D\uDED1 Campaign ".concat(campaignId, " cancelled. Dropping job."));
                    return [2 /*return*/];
                }
                if (!(!cachedStatus && currentStatus)) return [3 /*break*/, 10];
                return [4 /*yield*/, redis_status_1.CampaignStatusCache.set(campaignId, currentStatus)];
            case 9:
                _o.sent();
                _o.label = 10;
            case 10:
                throttleKey = "ratelimit:waba:".concat(phoneNumberId);
                return [4 /*yield*/, redis_status_1.RateLimiter.isAllowed(throttleKey, 80, 1)];
            case 11:
                isAllowed = _o.sent();
                if (!!isAllowed) return [3 /*break*/, 13];
                console.warn("[MetaAPIWorker] \uD83D\uDEA6 Rate limit hit for ".concat(phoneNumberId, ". Backing off..."));
                return [4 /*yield*/, job.moveToDelayed(Date.now() + 2000, job.token)];
            case 12:
                _o.sent();
                return [2 /*return*/];
            case 13:
                skipFatigue = payload.skipFatigue === true;
                if (!(category === "MARKETING" && !skipFatigue)) return [3 /*break*/, 17];
                return [4 /*yield*/, redis_status_1.CampaignStatusCache.isFatigued(payload.contactId)];
            case 14:
                fatigued = _o.sent();
                if (!fatigued) return [3 /*break*/, 17];
                console.log("[MetaAPIWorker] \uD83D\uDE35 Contact ".concat(payload.contactId, " is fatigued. Skipping to protect engagement."));
                if (!campaignId) return [3 /*break*/, 16];
                return [4 /*yield*/, db_1.prisma.campaignStats.update({
                        where: { campaign_id: campaignId },
                        data: { failed: { increment: 1 } }
                    }).catch(function (e) { return null; })];
            case 15:
                _o.sent();
                _o.label = 16;
            case 16: return [2 /*return*/]; // Drop job silently (skipping)
            case 17:
                result = void 0;
                _c = type;
                switch (_c) {
                    case "SEND_TEMPLATE": return [3 /*break*/, 18];
                    case "SEND_TEXT": return [3 /*break*/, 20];
                    case "SEND_MEDIA": return [3 /*break*/, 22];
                    case "SEND_INTERACTIVE": return [3 /*break*/, 31];
                    case "SEND_GENERIC": return [3 /*break*/, 31];
                    case "START_FLOW": return [3 /*break*/, 33];
                }
                return [3 /*break*/, 35];
            case 18: return [4 /*yield*/, service_1.WhatsAppService.sendTemplate(phoneNumberId, accessToken, to, payload.templateName, payload.langCode || "en_US", payload.components || [], workspaceId, category, "Campaign broadcast: ".concat(payload.templateName), job.attemptsMade || 0, // ☢️ Pass actual BullMQ attempt count
                job.opts.messageId // ☢️ Pass the stable ID
                )];
            case 19:
                // ☢️ FIX #3: Pass correct description string, not boolean skipFatigue
                result = _o.sent();
                return [3 /*break*/, 36];
            case 20: return [4 /*yield*/, service_1.WhatsAppService.sendText(phoneNumberId, accessToken, to, payload.body, workspaceId, category)];
            case 21:
                result = _o.sent();
                return [3 /*break*/, 36];
            case 22:
                mediaType = payload.mediaType;
                if (!(mediaType === "IMAGE")) return [3 /*break*/, 24];
                return [4 /*yield*/, service_1.WhatsAppService.sendImage(phoneNumberId, accessToken, to, payload.url, payload.caption, workspaceId, category)];
            case 23:
                result = _o.sent();
                return [3 /*break*/, 30];
            case 24:
                if (!(mediaType === "VIDEO")) return [3 /*break*/, 26];
                return [4 /*yield*/, service_1.WhatsAppService.sendVideo(phoneNumberId, accessToken, to, payload.url, payload.caption, workspaceId, category)];
            case 25:
                result = _o.sent();
                return [3 /*break*/, 30];
            case 26:
                if (!(mediaType === "DOCUMENT")) return [3 /*break*/, 28];
                return [4 /*yield*/, service_1.WhatsAppService.sendDocument(phoneNumberId, accessToken, to, payload.url, payload.filename, workspaceId, category)];
            case 27:
                result = _o.sent();
                return [3 /*break*/, 30];
            case 28:
                if (!(mediaType === "AUDIO")) return [3 /*break*/, 30];
                return [4 /*yield*/, service_1.WhatsAppService.sendVoice(phoneNumberId, accessToken, to, payload.url, workspaceId, category)];
            case 29:
                result = _o.sent();
                _o.label = 30;
            case 30: return [3 /*break*/, 36];
            case 31: return [4 /*yield*/, service_1.WhatsAppService.sendMessage(phoneNumberId, accessToken, payload, workspaceId, category, undefined, // description
                job.attemptsMade || 0, // ☢️ Pass actual BullMQ attempt count
                job.opts.messageId // Pass the stable ID
                )];
            case 32:
                // Use the generic sendMessage for complex structures (Flows, Buttons, etc.)
                // ☢️ Pass deterministic messageId if available
                result = _o.sent();
                return [3 /*break*/, 36];
            case 33: return [4 /*yield*/, flow_runner_1.FlowRunner.startFlow(workspaceId, payload.contactId, payload.flowId)];
            case 34:
                result = _o.sent();
                return [3 /*break*/, 36];
            case 35:
                console.warn("[MetaAPIWorker] Unknown job type: ".concat(type));
                _o.label = 36;
            case 36:
                if (!(result && result.messages && result.messages.length > 0)) return [3 /*break*/, 51];
                metaMessageId = result.messages[0].id;
                console.log("[MetaAPIWorker] \u2705 SEND_TEMPLATE to: ".concat(to, " \u2192 Meta ID: ").concat(metaMessageId));
                chatPreviewBody_1 = "Template Message";
                chatButtons = [];
                _o.label = 37;
            case 37:
                _o.trys.push([37, 39, , 40]);
                return [4 /*yield*/, db_1.prisma.template.findFirst({
                        where: { workspace_id: workspaceId, name: payload.templateName }
                    })];
            case 38:
                template = _o.sent();
                if (template && template.components) {
                    components = template.components;
                    bodyComp = components.find(function (c) { return c.type === "BODY"; });
                    buttonComp = components.find(function (c) { return c.type === "BUTTONS"; });
                    if (bodyComp) {
                        chatPreviewBody_1 = bodyComp.text || chatPreviewBody_1;
                        bodyParams = ((_f = (_e = payload.components) === null || _e === void 0 ? void 0 : _e.find(function (c) { return c.type === "body"; })) === null || _f === void 0 ? void 0 : _f.parameters) || [];
                        bodyParams.forEach(function (p, idx) {
                            chatPreviewBody_1 = chatPreviewBody_1.replace("{{".concat(idx + 1, "}}"), p.text || "[var]");
                        });
                    }
                    if (buttonComp && buttonComp.buttons) {
                        chatButtons = buttonComp.buttons.map(function (b) { return ({
                            type: "REPLY",
                            reply: { title: b.text || b.label || "Button" }
                        }); });
                    }
                }
                return [3 /*break*/, 40];
            case 39:
                e_1 = _o.sent();
                console.warn("[MetaAPIWorker] Failed to resolve template content for chat preview:", e_1);
                return [3 /*break*/, 40];
            case 40: return [4 /*yield*/, db_1.prisma.conversation.findFirst({
                    where: { contact_id: payload.contactId, status: "OPEN" }
                })];
            case 41:
                conversation = _o.sent();
                if (!!conversation) return [3 /*break*/, 43];
                return [4 /*yield*/, db_1.prisma.conversation.create({
                        data: { workspace_id: workspaceId, contact_id: payload.contactId, status: "OPEN" }
                    })];
            case 42:
                conversation = _o.sent();
                _o.label = 43;
            case 43: 
            // 2. ☢️ NUCLEAR FIX: Persist with proper content for Live Chat
            return [4 /*yield*/, db_1.prisma.message.create({
                    data: {
                        workspace_id: workspaceId,
                        contact_id: payload.contactId,
                        conversation_id: conversation.id,
                        meta_id: metaMessageId,
                        type: type === "SEND_TEMPLATE" ? "TEMPLATE" :
                            type === "SEND_INTERACTIVE" ? "INTERACTIVE" : "TEXT",
                        direction: "OUTBOUND",
                        status: "SENT",
                        sent_at: new Date(),
                        campaign_id: campaignId || null,
                        content: {
                            template_name: payload.templateName,
                            body: chatPreviewBody_1,
                            buttons: chatButtons
                        },
                        template_name: payload.templateName,
                        conversation_category: category,
                    }
                }).catch(function (e) { return console.error("[MetaAPIWorker] Failed to save message record:", e.message); })];
            case 44:
                // 2. ☢️ NUCLEAR FIX: Persist with proper content for Live Chat
                _o.sent();
                if (!(category === "MARKETING")) return [3 /*break*/, 46];
                return [4 /*yield*/, redis_status_1.CampaignStatusCache.trackFatigue(payload.contactId)];
            case 45:
                _o.sent();
                _o.label = 46;
            case 46:
                if (!campaignId) return [3 /*break*/, 51];
                return [4 /*yield*/, db_1.prisma.campaignStats.update({
                        where: { campaign_id: campaignId },
                        data: { sent: { increment: 1 } }
                    }).catch(function (e) { return null; })];
            case 47:
                _o.sent();
                return [4 /*yield*/, db_1.prisma.campaignStats.findUnique({ where: { campaign_id: campaignId } })];
            case 48:
                stats = _o.sent();
                return [4 /*yield*/, db_1.prisma.campaign.findUnique({ where: { id: campaignId }, select: { status: true } })];
            case 49:
                campaign = _o.sent();
                if (!(stats && campaign && campaign.status === "PROCESSING")) return [3 /*break*/, 51];
                processed = (stats.sent || 0) + (stats.failed || 0);
                if (!(stats.total > 0 && processed >= stats.total)) return [3 /*break*/, 51];
                return [4 /*yield*/, db_1.prisma.campaign.update({
                        where: { id: campaignId },
                        data: { status: "COMPLETED" }
                    }).catch(function (e) { return null; })];
            case 50:
                _o.sent();
                console.log("[MetaAPIWorker] \uD83C\uDFC1 Campaign ".concat(campaignId, " marked COMPLETED (").concat(processed, "/").concat(stats.total, ")"));
                _o.label = 51;
            case 51: return [2 /*return*/, result];
            case 52:
                err_2 = _o.sent();
                console.error("[MetaAPIWorker] \u274C Failed to process ".concat(type, ":"), ((_g = err_2.response) === null || _g === void 0 ? void 0 : _g.data) || err_2.message);
                if (!payload.campaignId) return [3 /*break*/, 57];
                responseData = (_j = (_h = err_2.response) === null || _h === void 0 ? void 0 : _h.data) === null || _j === void 0 ? void 0 : _j.error;
                metaErrorCode = (responseData === null || responseData === void 0 ? void 0 : responseData.code) || ((_k = err_2.response) === null || _k === void 0 ? void 0 : _k.status);
                metaErrorMessage = (responseData === null || responseData === void 0 ? void 0 : responseData.message) || err_2.message || "";
                isTemplateError = metaErrorMessage.includes("Translation does not exist") || metaErrorCode === 132001;
                isBillingError = metaErrorMessage.startsWith("BILLING_ERROR:") ||
                    metaErrorMessage.includes("Insufficient balance") ||
                    metaErrorMessage.includes("Trial limit exceeded") ||
                    metaErrorMessage.includes("Wallet frozen") ||
                    metaErrorMessage.includes("Account suspended") ||
                    metaErrorCode === 131031 ||
                    metaErrorCode === 131999 ||
                    ((_l = err_2.response) === null || _l === void 0 ? void 0 : _l.status) === 402;
                isFatal = isTemplateError
                    || isBillingError
                    || metaErrorCode === 131031
                    || metaErrorCode === 131999
                    || ((_m = err_2.response) === null || _m === void 0 ? void 0 : _m.status) === 401;
                if (!isFatal) return [3 /*break*/, 57];
                console.error("[MetaAPIWorker] \uD83D\uDD34 FATAL ERROR for Campaign ".concat(payload.campaignId, ": [").concat(metaErrorCode, "] ").concat(metaErrorMessage));
                if (isTemplateError) {
                    console.warn("[MetaAPIWorker] \uD83D\uDCA1 PRO-TIP: Meta India templates require 'en_US'. Your template '".concat(payload.templateName, "' might be mislabeled as 'en'."));
                }
                if (isBillingError) {
                    console.warn("[MetaAPIWorker] \uD83D\uDCB3 \u2622\uFE0F Billing/Credit issue blocked this broadcast message. Check balance or Meta payment method.");
                }
                // ☢️ FIX #2: ALWAYS increment stats.failed for fatal errors
                return [4 /*yield*/, db_1.prisma.campaignStats.update({
                        where: { campaign_id: payload.campaignId },
                        data: { failed: { increment: 1 } }
                    }).catch(function (e) { return null; })];
            case 53:
                // ☢️ FIX #2: ALWAYS increment stats.failed for fatal errors
                _o.sent();
                return [4 /*yield*/, db_1.prisma.campaignStats.findUnique({ where: { campaign_id: payload.campaignId } })];
            case 54:
                updatedStats = _o.sent();
                if (!updatedStats) return [3 /*break*/, 56];
                processed = (updatedStats.sent || 0) + (updatedStats.failed || 0);
                if (!(updatedStats.total > 0 && processed >= updatedStats.total)) return [3 /*break*/, 56];
                return [4 /*yield*/, db_1.prisma.campaign.update({
                        where: { id: payload.campaignId },
                        data: { status: "COMPLETED" }
                    }).catch(function (e) { return null; })];
            case 55:
                _o.sent();
                console.log("[MetaAPIWorker] \uD83C\uDFC1 Campaign ".concat(payload.campaignId, " COMPLETED (all messages processed, some failed)."));
                _o.label = 56;
            case 56: return [2 /*return*/]; // Gracefully end job — no BullMQ retry
            case 57: throw err_2; // Trigger BullMQ retry for transient network errors only
            case 58: return [2 /*return*/];
        }
    });
}); }, {
    connection: REDIS_CONNECTION,
    limiter: { max: 80, duration: 1000 }, // Global Throttling for Meta API
    concurrency: 20
});
// ☢️ SAFETY NET: BullMQ failed event handler
// When a job exhausts ALL retries (transient network errors), this catches it
// and ensures stats.failed is incremented so the campaign can reach COMPLETED.
metaApiWorker.on("failed", function (job, err) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, type, payload, campaignId, maxAttempts, stats, campaign, processed, e_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!job)
                    return [2 /*return*/];
                _a = job.data || {}, type = _a.type, payload = _a.payload;
                campaignId = payload === null || payload === void 0 ? void 0 : payload.campaignId;
                if (!campaignId)
                    return [2 /*return*/];
                maxAttempts = ((_b = job.opts) === null || _b === void 0 ? void 0 : _b.attempts) || 5;
                if ((job.attemptsMade || 0) < maxAttempts)
                    return [2 /*return*/]; // More retries pending, skip
                console.error("[MetaAPIWorker] \u2620\uFE0F Job exhausted all ".concat(maxAttempts, " retries for Campaign ").concat(campaignId, ". Incrementing failed count."));
                _c.label = 1;
            case 1:
                _c.trys.push([1, 7, , 8]);
                return [4 /*yield*/, db_1.prisma.campaignStats.update({
                        where: { campaign_id: campaignId },
                        data: { failed: { increment: 1 } }
                    }).catch(function () { return null; })];
            case 2:
                _c.sent();
                return [4 /*yield*/, db_1.prisma.campaignStats.findUnique({ where: { campaign_id: campaignId } })];
            case 3:
                stats = _c.sent();
                return [4 /*yield*/, db_1.prisma.campaign.findUnique({ where: { id: campaignId }, select: { status: true } })];
            case 4:
                campaign = _c.sent();
                if (!(stats && campaign && campaign.status === "PROCESSING")) return [3 /*break*/, 6];
                processed = (stats.sent || 0) + (stats.failed || 0);
                if (!(stats.total > 0 && processed >= stats.total)) return [3 /*break*/, 6];
                return [4 /*yield*/, db_1.prisma.campaign.update({
                        where: { id: campaignId },
                        data: { status: "COMPLETED" }
                    }).catch(function () { return null; })];
            case 5:
                _c.sent();
                console.log("[MetaAPIWorker] \uD83C\uDFC1 Campaign ".concat(campaignId, " force-COMPLETED via safety net (").concat(processed, "/").concat(stats.total, ")."));
                _c.label = 6;
            case 6: return [3 /*break*/, 8];
            case 7:
                e_2 = _c.sent();
                console.error("[MetaAPIWorker] Failed event handler error:", e_2.message);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
// ---------------------------------------------------------
// 2. CAMPAIGN DISPATCHER (The Unroller)
// ---------------------------------------------------------
/**
 * ☢️ CAMPAIGN UNROLLER (Phase 1: Starter)
 * Initializes campaign stats and enqueues the first batch job.
 */
exports.campaignWorker = new bullmq_1.Worker("campaign-queue", function (job) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, campaignId_1, workspaceId_1, segmentId, targetStatus, course, offset, batchSize, runEpoch_1, isEdu, preUploadedMediaId_1, _b, metaApiQueue, campaignQueue, isStillActive, campaign_1, waba_1, decrypt_1, decryptedToken_1, batchPeople, leads, CommerceSegmentation, filters, campaignAny_1, jobs, error_1, _c, campaignId, workspaceId, segmentId, targetStatus, course, campaign, totalCount, CommerceSegmentation, filters, preUploadedMediaId, campaignAny, waba, decrypt_2, decryptedToken, finalUrl, host, WhatsAppService_1, err_3, batchSize, campaignQueue, error_2;
    var _d, _e, _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                if (!(job.name === "dispatch-batch")) return [3 /*break*/, 19];
                _a = job.data, campaignId_1 = _a.campaignId, workspaceId_1 = _a.workspaceId, segmentId = _a.segmentId, targetStatus = _a.targetStatus, course = _a.course, offset = _a.offset, batchSize = _a.batchSize, runEpoch_1 = _a.runEpoch, isEdu = _a.isEdu, preUploadedMediaId_1 = _a.preUploadedMediaId;
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/queue"); })];
            case 1:
                _b = _j.sent(), metaApiQueue = _b.metaApiQueue, campaignQueue = _b.campaignQueue;
                _j.label = 2;
            case 2:
                _j.trys.push([2, 17, , 18]);
                return [4 /*yield*/, redis_status_1.CampaignStatusCache.isActive(campaignId_1)];
            case 3:
                isStillActive = _j.sent();
                if (!isStillActive) {
                    console.warn("[BatchWorker] \uD83D\uDED1 Kill switch detected for Campaign ".concat(campaignId_1, ". Stopping."));
                    return [2 /*return*/];
                }
                return [4 /*yield*/, db_1.prisma.campaign.findUnique({
                        where: { id: campaignId_1 },
                        include: { workspace: { include: { waba: true } } }
                    })];
            case 4:
                campaign_1 = _j.sent();
                if (!campaign_1 || !((_d = campaign_1.workspace) === null || _d === void 0 ? void 0 : _d.waba) || campaign_1.status === 'CANCELLED')
                    return [2 /*return*/];
                waba_1 = campaign_1.workspace.waba;
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/security/encryption"); })];
            case 5:
                decrypt_1 = (_j.sent()).decrypt;
                decryptedToken_1 = decrypt_1(waba_1.access_token);
                batchPeople = [];
                if (!isEdu) return [3 /*break*/, 7];
                return [4 /*yield*/, db_1.prisma.eduLead.findMany({
                        where: __assign(__assign({ workspace_id: workspaceId_1 }, (targetStatus && targetStatus.length > 0 ? { status: { in: targetStatus } } : {})), (course ? { course_interested: course } : {})),
                        skip: offset,
                        take: batchSize
                    })];
            case 6:
                leads = _j.sent();
                batchPeople = leads.map(function (l) { return (__assign(__assign({}, l), { phone: l.whatsapp_number, name: l.student_name })); });
                return [3 /*break*/, 12];
            case 7:
                if (!(segmentId || ((_e = campaign_1.filters) === null || _e === void 0 ? void 0 : _e.segment_id) || ((_f = campaign_1.filters) === null || _f === void 0 ? void 0 : _f.retarget_campaign_id))) return [3 /*break*/, 10];
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/commerce/segmentation"); })];
            case 8:
                CommerceSegmentation = (_j.sent()).CommerceSegmentation;
                filters = campaign_1.filters || { segment_id: segmentId };
                return [4 /*yield*/, CommerceSegmentation.getSegmentContacts(workspaceId_1, filters, offset, batchSize)];
            case 9:
                batchPeople = _j.sent();
                return [3 /*break*/, 12];
            case 10: return [4 /*yield*/, db_1.prisma.contact.findMany({
                    where: { workspace_id: workspaceId_1, blocked: false, opt_in: { not: false } },
                    skip: offset,
                    take: batchSize
                })];
            case 11:
                batchPeople = _j.sent();
                _j.label = 12;
            case 12:
                if (!(batchPeople.length === 0)) return [3 /*break*/, 14];
                console.log("[BatchWorker] \u2705 Finished Campaign ".concat(campaignId_1, ". No more contacts."));
                return [4 /*yield*/, db_1.prisma.campaign.update({ where: { id: campaignId_1 }, data: { status: "COMPLETED" } })];
            case 13:
                _j.sent();
                return [2 /*return*/];
            case 14:
                campaignAny_1 = campaign_1;
                jobs = batchPeople.map(function (person) {
                    var _a;
                    var variableMapping = campaignAny_1.variable_mapping || {};
                    var bodyParams = Object.entries(variableMapping)
                        .sort(function (_a, _b) {
                        var a = _a[0];
                        var b = _b[0];
                        return parseInt(a) - parseInt(b);
                    })
                        .map(function (_a) {
                        var _b;
                        var index = _a[0], source = _a[1];
                        var value = "Customer";
                        if (source.startsWith("static:")) {
                            value = source.replace("static:", "");
                        }
                        else {
                            var personAny = person;
                            value = personAny[source] || ((_b = personAny.attributes) === null || _b === void 0 ? void 0 : _b[source]) || personAny.name || "Customer";
                        }
                        return { type: "text", text: String(value || "Customer").trim().slice(0, 1024) };
                    });
                    var components = [];
                    if (campaignAny_1.header_media_url) {
                        var isImage = campaignAny_1.header_media_url.match(/\.(jpg|jpeg|png|webp)$/i);
                        var mediaType = isImage ? "image" : "video";
                        components.push({
                            type: "header",
                            parameters: [(_a = {
                                        type: mediaType
                                    },
                                    _a[mediaType] = preUploadedMediaId_1 ? { id: preUploadedMediaId_1 } : { link: campaignAny_1.header_media_url },
                                    _a)]
                        });
                    }
                    if (bodyParams.length > 0) {
                        components.push({ type: "body", parameters: bodyParams });
                    }
                    return {
                        name: "send-template",
                        data: {
                            type: "SEND_TEMPLATE",
                            payload: {
                                campaignId: campaignId_1,
                                workspaceId: workspaceId_1,
                                contactId: person.id,
                                phoneNumberId: waba_1.phone_number_id,
                                accessToken: decryptedToken_1,
                                to: person.phone,
                                templateName: campaign_1.template_name,
                                langCode: "en", // default
                                components: components,
                                skipFatigue: true
                            }
                        },
                        opts: {
                            priority: queue_1.PRIORITY_LOW,
                            jobId: "CAMP-".concat(campaignId_1, "-").concat(person.id, "-").concat(runEpoch_1),
                            messageId: "cmp_".concat(campaignId_1, "_").concat(person.id),
                            attempts: 3,
                            backoff: { type: "exponential", delay: 2000 }
                        }
                    };
                });
                return [4 /*yield*/, metaApiQueue.addBulk(jobs)];
            case 15:
                _j.sent();
                // Enqueue Next Batch
                return [4 /*yield*/, campaignQueue.add("dispatch-batch", {
                        campaignId: campaignId_1,
                        workspaceId: workspaceId_1,
                        segmentId: segmentId,
                        targetStatus: targetStatus,
                        course: course,
                        offset: offset + batchSize,
                        batchSize: batchSize,
                        runEpoch: runEpoch_1,
                        isEdu: isEdu,
                        preUploadedMediaId: preUploadedMediaId_1 // ☢️ Continue passing the media ID
                    }, {
                        jobId: "BATCH-".concat(campaignId_1, "-").concat(offset + batchSize),
                        attempts: 5,
                        backoff: { type: "exponential", delay: 5000 }
                    })];
            case 16:
                // Enqueue Next Batch
                _j.sent();
                console.log("[BatchWorker] \u2705 Batch ".concat(offset, " processed for Campaign ").concat(campaignId_1));
                return [3 /*break*/, 18];
            case 17:
                error_1 = _j.sent();
                console.error("[BatchWorker] \u274C Error processing batch ".concat(offset, ":"), error_1.message);
                throw error_1;
            case 18: return [3 /*break*/, 44];
            case 19:
                _c = job.data, campaignId = _c.campaignId, workspaceId = _c.workspaceId, segmentId = _c.segmentId, targetStatus = _c.targetStatus, course = _c.course;
                _j.label = 20;
            case 20:
                _j.trys.push([20, 43, , 44]);
                console.log("[CampaignWorker] \uD83D\uDE80 Starting Unroll for Campaign: ".concat(campaignId));
                return [4 /*yield*/, db_1.prisma.campaign.findUnique({
                        where: { id: campaignId },
                        include: { workspace: true }
                    })];
            case 21:
                campaign = _j.sent();
                if (!campaign)
                    throw new Error("Campaign not found");
                if (campaign.status === 'CANCELLED')
                    return [2 /*return*/];
                totalCount = 0;
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/commerce/segmentation"); })];
            case 22:
                CommerceSegmentation = (_j.sent()).CommerceSegmentation;
                if (!(job.name === "edu-bulk-broadcast")) return [3 /*break*/, 24];
                return [4 /*yield*/, db_1.prisma.eduLead.count({
                        where: __assign(__assign({ workspace_id: workspaceId }, (targetStatus && targetStatus.length > 0 ? { status: { in: targetStatus } } : {})), (course ? { course_interested: course } : {}))
                    })];
            case 23:
                totalCount = _j.sent();
                return [3 /*break*/, 28];
            case 24:
                if (!(segmentId || ((_g = campaign.filters) === null || _g === void 0 ? void 0 : _g.segment_id) || ((_h = campaign.filters) === null || _h === void 0 ? void 0 : _h.retarget_campaign_id))) return [3 /*break*/, 26];
                filters = campaign.filters || { segment_id: segmentId };
                return [4 /*yield*/, CommerceSegmentation.getSegmentCount(workspaceId, filters)];
            case 25:
                totalCount = _j.sent();
                return [3 /*break*/, 28];
            case 26: return [4 /*yield*/, db_1.prisma.contact.count({
                    where: { workspace_id: workspaceId, blocked: false, opt_in: { not: false } }
                })];
            case 27:
                totalCount = _j.sent();
                _j.label = 28;
            case 28:
                if (!(totalCount === 0)) return [3 /*break*/, 30];
                console.log("[CampaignWorker] \u26A1 Fast-completing Campaign ".concat(campaignId, " with 0 recipients."));
                return [4 /*yield*/, db_1.prisma.campaign.update({
                        where: { id: campaignId },
                        data: { status: "COMPLETED", stats: { upsert: { create: { total: 0, sent: 0, failed: 0 }, update: { total: 0 } } } }
                    })];
            case 29:
                _j.sent();
                return [2 /*return*/];
            case 30: 
            // Initialize Status
            return [4 /*yield*/, redis_status_1.CampaignStatusCache.set(campaignId, "PROCESSING")];
            case 31:
                // Initialize Status
                _j.sent();
                return [4 /*yield*/, db_1.prisma.campaign.update({
                        where: { id: campaignId },
                        data: {
                            status: "PROCESSING",
                            stats: { upsert: { create: { total: totalCount }, update: { total: totalCount } } }
                        }
                    })];
            case 32:
                _j.sent();
                preUploadedMediaId = null;
                campaignAny = campaign;
                if (!campaignAny.header_media_url) return [3 /*break*/, 40];
                _j.label = 33;
            case 33:
                _j.trys.push([33, 39, , 40]);
                return [4 /*yield*/, db_1.prisma.whatsAppAccount.findFirst({ where: { workspace_id: workspaceId } })];
            case 34:
                waba = _j.sent();
                if (!waba) return [3 /*break*/, 38];
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/security/encryption"); })];
            case 35:
                decrypt_2 = (_j.sent()).decrypt;
                decryptedToken = decrypt_2(waba.access_token);
                finalUrl = campaignAny.header_media_url;
                if (!finalUrl.startsWith("http")) {
                    host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                    finalUrl = "".concat(host).concat(finalUrl.startsWith("/") ? "" : "/").concat(finalUrl);
                }
                console.log("[CampaignWorker] \uD83D\uDE80 Hardening Media: ".concat(finalUrl));
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/whatsapp/service"); })];
            case 36:
                WhatsAppService_1 = (_j.sent()).WhatsAppService;
                return [4 /*yield*/, WhatsAppService_1.uploadMediaFromUrl(finalUrl, waba.phone_number_id, decryptedToken)];
            case 37:
                preUploadedMediaId = _j.sent();
                if (preUploadedMediaId) {
                    console.log("[CampaignWorker] \u2705 Media Hardened: ".concat(preUploadedMediaId));
                }
                _j.label = 38;
            case 38: return [3 /*break*/, 40];
            case 39:
                err_3 = _j.sent();
                console.error("[CampaignWorker] \u26A0\uFE0F Media Hardening failed (falling back to link):", err_3.message);
                return [3 /*break*/, 40];
            case 40:
                batchSize = 500;
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/queue"); })];
            case 41:
                campaignQueue = (_j.sent()).campaignQueue;
                return [4 /*yield*/, campaignQueue.add("dispatch-batch", {
                        campaignId: campaignId,
                        workspaceId: workspaceId,
                        segmentId: segmentId,
                        targetStatus: targetStatus,
                        course: course,
                        offset: 0,
                        batchSize: batchSize,
                        runEpoch: campaign.created_at.getTime(),
                        isEdu: job.name === "edu-bulk-broadcast",
                        preUploadedMediaId: preUploadedMediaId // ☢️ Pass the hardened ID
                    }, {
                        jobId: "BATCH-".concat(campaignId, "-0"),
                        attempts: 5,
                        backoff: { type: "exponential", delay: 5000 }
                    })];
            case 42:
                _j.sent();
                console.log("[CampaignWorker] \u2705 Initialized Campaign ".concat(campaignId, ". First batch queued."));
                return [3 /*break*/, 44];
            case 43:
                error_2 = _j.sent();
                console.error("[CampaignWorker] \u274C Fatal Starter Error:", error_2.message);
                throw error_2;
            case 44: return [2 /*return*/];
        }
    });
}); }, { connection: REDIS_CONNECTION, concurrency: 5 });
/**
 * ☢️ CAMPAIGN BATCH DISPATCHER (Phase 2: Chunker)
 * Processes 500 contacts and enqueues the next batch until finished.
 */
// ☢️ SAFETY NET: If the campaign unroller exhausts all retries,
// reset campaign from PROCESSING → FAILED so it doesn't get stuck forever.
exports.campaignWorker.on("failed", function (job, err) { return __awaiter(void 0, void 0, void 0, function () {
    var campaignId, maxAttempts, campaign, e_3;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!job)
                    return [2 /*return*/];
                campaignId = (_a = job.data) === null || _a === void 0 ? void 0 : _a.campaignId;
                if (!campaignId)
                    return [2 /*return*/];
                maxAttempts = ((_b = job.opts) === null || _b === void 0 ? void 0 : _b.attempts) || 5;
                if ((job.attemptsMade || 0) < maxAttempts)
                    return [2 /*return*/]; // More retries pending
                console.error("[CampaignWorker] \u2620\uFE0F Unroller exhausted all ".concat(maxAttempts, " retries for Campaign ").concat(campaignId, ". Marking FAILED."));
                _c.label = 1;
            case 1:
                _c.trys.push([1, 5, , 6]);
                return [4 /*yield*/, db_1.prisma.campaign.findUnique({
                        where: { id: campaignId },
                        select: { status: true }
                    })];
            case 2:
                campaign = _c.sent();
                if (!((campaign === null || campaign === void 0 ? void 0 : campaign.status) === "PROCESSING")) return [3 /*break*/, 4];
                return [4 /*yield*/, db_1.prisma.campaign.update({
                        where: { id: campaignId },
                        data: { status: "FAILED" }
                    })];
            case 3:
                _c.sent();
                console.log("[CampaignWorker] \uD83D\uDD34 Campaign ".concat(campaignId, " set to FAILED after unroller crash."));
                _c.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                e_3 = _c.sent();
                console.error("[CampaignWorker] Failed-event handler error:", e_3.message);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// ---------------------------------------------------------
// 3. DRIP DISPATCHER (Repeatable Pulse)
// ---------------------------------------------------------
var dripDispatchWorker = new bullmq_1.Worker("drip-dispatch-queue", function (job) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, metaApiQueue, campaignQueue, dueEnrollments, _i, dueEnrollments_1, enrollment, step, template, nextIdx, nextStep, e_4;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log("[Drip Dispatcher] Executing Pulse: ".concat(job.id));
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/queue"); })];
            case 1:
                _a = _c.sent(), metaApiQueue = _a.metaApiQueue, campaignQueue = _a.campaignQueue;
                return [4 /*yield*/, db_1.prisma.dripEnrollment.findMany({
                        where: { is_stopped: false, next_run_at: { lte: new Date() } },
                        include: {
                            drip: { include: { steps: { orderBy: { step_order: 'asc' } } } },
                            contact: { include: { workspace: { include: { waba: true } } } }
                        },
                        take: 100
                    })];
            case 2:
                dueEnrollments = _c.sent();
                _i = 0, dueEnrollments_1 = dueEnrollments;
                _c.label = 3;
            case 3:
                if (!(_i < dueEnrollments_1.length)) return [3 /*break*/, 11];
                enrollment = dueEnrollments_1[_i];
                step = enrollment.drip.steps[enrollment.current_step];
                if (!step || !((_b = enrollment.contact.workspace) === null || _b === void 0 ? void 0 : _b.waba))
                    return [3 /*break*/, 10];
                _c.label = 4;
            case 4:
                _c.trys.push([4, 9, , 10]);
                if (!step.template_id) return [3 /*break*/, 7];
                return [4 /*yield*/, db_1.prisma.template.findUnique({ where: { id: step.template_id } })];
            case 5:
                template = _c.sent();
                if (!template) return [3 /*break*/, 7];
                return [4 /*yield*/, metaApiQueue.add("drip-send", {
                        type: "SEND_TEMPLATE",
                        payload: {
                            phoneNumberId: enrollment.contact.workspace.waba.phone_number_id,
                            accessToken: (0, encryption_1.decrypt)(enrollment.contact.workspace.waba.access_token),
                            to: enrollment.contact.phone,
                            templateName: template.name,
                            workspaceId: enrollment.contact.workspace_id,
                            contactId: enrollment.contact.id
                        }
                    })];
            case 6:
                _c.sent();
                _c.label = 7;
            case 7:
                nextIdx = enrollment.current_step + 1;
                nextStep = enrollment.drip.steps[nextIdx];
                return [4 /*yield*/, db_1.prisma.dripEnrollment.update({
                        where: { id: enrollment.id },
                        data: {
                            current_step: nextIdx,
                            next_run_at: nextStep ? new Date(Date.now() + nextStep.delay_hours * 3600000) : undefined,
                            is_stopped: !nextStep,
                            // @ts-ignore
                            stop_reason: nextStep ? null : "COMPLETED"
                        }
                    })];
            case 8:
                _c.sent();
                return [3 /*break*/, 10];
            case 9:
                e_4 = _c.sent();
                console.error("[Drip Dispatcher] Failed ".concat(enrollment.id), e_4);
                return [3 /*break*/, 10];
            case 10:
                _i++;
                return [3 /*break*/, 3];
            case 11: return [2 /*return*/];
        }
    });
}); }, { connection: REDIS_CONNECTION });
// ---------------------------------------------------------
// 4. AUTOMATION WORKER
// ---------------------------------------------------------
var automationWorker = new bullmq_1.Worker("automation-queue", function (job) { return __awaiter(void 0, void 0, void 0, function () {
    var ResellerFinanceEngine, _a, workspaceId, orderId, order, recoveryFlow, contact, _b, workspaceId, contactId, messageBody, _c, workspaceId, contactId, orderPayload, CatalogEngine, PaymentEngine, order, paymentResult, err_4, orderId, PaymentEngine, result, err_5, _d, workspaceId, wabaId, message, contactProfile, metadata, waba, token, phone, contact, conversation, msgContent, msgType, localUrl, localUrl, localUrl, localUrl, normalizedMsg, err_6, statusUpdate, messageMetaId, statusStr, timestamp, updateData, err, existingMsg, cmpId, err_7, EduAutomation;
    var _e, _f, _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                if (!(job.name === "nightly-reconciliation")) return [3 /*break*/, 3];
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/reseller/finance-engine"); })];
            case 1:
                ResellerFinanceEngine = (_h.sent()).ResellerFinanceEngine;
                console.log("🌙 [Worker] Starting Nightly Financial Audit...");
                return [4 /*yield*/, ResellerFinanceEngine.auditAllWallets()];
            case 2:
                _h.sent();
                console.log("✅ [Worker] Nightly Audit Complete.");
                _h.label = 3;
            case 3:
                if (!(job.name === "abandoned-cart-recovery")) return [3 /*break*/, 8];
                _a = job.data, workspaceId = _a.workspaceId, orderId = _a.orderId;
                return [4 /*yield*/, db_1.prisma.commerceOrder.findUnique({
                        where: { id: orderId }
                    })];
            case 4:
                order = _h.sent();
                if (!(order && order.status === "PLACED")) return [3 /*break*/, 8];
                return [4 /*yield*/, db_1.prisma.flow.findFirst({
                        where: { workspace_id: workspaceId, name: { contains: "Abandoned", mode: "insensitive" } }
                    })];
            case 5:
                recoveryFlow = _h.sent();
                if (!recoveryFlow) return [3 /*break*/, 8];
                return [4 /*yield*/, db_1.prisma.contact.findFirst({
                        where: { workspace_id: workspaceId, phone: order.customer_phone || "" }
                    })];
            case 6:
                contact = _h.sent();
                if (!contact) return [3 /*break*/, 8];
                return [4 /*yield*/, flow_runner_1.FlowRunner.startFlow(workspaceId, contact.id, recoveryFlow.id)];
            case 7:
                _h.sent();
                console.log("\uD83D\uDCB8 Processing Abandoned Recovery for Order ".concat(orderId));
                _h.label = 8;
            case 8:
                if (!(job.name === "process-flow")) return [3 /*break*/, 10];
                _b = job.data, workspaceId = _b.workspaceId, contactId = _b.contactId, messageBody = _b.messageBody;
                console.log("[Worker] Executing Flow for contact ".concat(contactId));
                return [4 /*yield*/, flow_runner_1.FlowRunner.processMessage(workspaceId, contactId, messageBody)];
            case 9:
                _h.sent();
                _h.label = 10;
            case 10:
                if (!(job.name === "process-meta-cart-order")) return [3 /*break*/, 17];
                _c = job.data, workspaceId = _c.workspaceId, contactId = _c.contactId, orderPayload = _c.orderPayload;
                console.log("[Worker] \uD83D\uDED2 Processing native WhatsApp cart order for contact ".concat(contactId));
                _h.label = 11;
            case 11:
                _h.trys.push([11, 16, , 17]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/commerce/catalog-engine"); })];
            case 12:
                CatalogEngine = (_h.sent()).CatalogEngine;
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/commerce/payment-engine"); })];
            case 13:
                PaymentEngine = (_h.sent()).PaymentEngine;
                return [4 /*yield*/, CatalogEngine.processMetaCartOrder(workspaceId, contactId, orderPayload)];
            case 14:
                order = _h.sent();
                console.log("[Worker] \u2705 Cart order created: ".concat(order.order_number));
                return [4 /*yield*/, PaymentEngine.createAndSendPaymentLink(order.id)];
            case 15:
                paymentResult = _h.sent();
                console.log("[Worker] \uD83D\uDCB3 Payment link sent via ".concat(paymentResult.gateway, ": ").concat(paymentResult.paymentUrl));
                return [3 /*break*/, 17];
            case 16:
                err_4 = _h.sent();
                console.error("[Worker] \u274C Cart order processing failed:", err_4.message);
                throw err_4; // Allow BullMQ retry
            case 17:
                if (!(job.name === "send-payment-link")) return [3 /*break*/, 22];
                orderId = job.data.orderId;
                console.log("[Worker] \uD83D\uDCB3 Generating payment link for order: ".concat(orderId));
                _h.label = 18;
            case 18:
                _h.trys.push([18, 21, , 22]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/commerce/payment-engine"); })];
            case 19:
                PaymentEngine = (_h.sent()).PaymentEngine;
                return [4 /*yield*/, PaymentEngine.createAndSendPaymentLink(orderId)];
            case 20:
                result = _h.sent();
                console.log("[Worker] \u2705 Payment link sent via ".concat(result.gateway));
                return [3 /*break*/, 22];
            case 21:
                err_5 = _h.sent();
                console.error("[Worker] \u274C Payment link failed:", err_5.message);
                throw err_5;
            case 22:
                if (!(job.name === "process-whatsapp-message")) return [3 /*break*/, 43];
                _d = job.data, workspaceId = _d.workspaceId, wabaId = _d.wabaId, message = _d.message, contactProfile = _d.contactProfile, metadata = _d.metadata;
                _h.label = 23;
            case 23:
                _h.trys.push([23, 42, , 43]);
                return [4 /*yield*/, db_1.prisma.whatsAppAccount.findUnique({
                        where: { id: wabaId },
                        select: { id: true, phone_number_id: true, access_token: true, opt_out_keywords: true, opt_out_reply: true, phone_number: true }
                    })];
            case 24:
                waba = _h.sent();
                if (!waba)
                    return [2 /*return*/];
                token = (0, encryption_1.decrypt)(waba.access_token);
                phone = message.from;
                return [4 /*yield*/, db_1.prisma.contact.upsert({
                        where: { workspace_id_phone: { workspace_id: workspaceId, phone: phone } },
                        update: { name: ((_e = contactProfile === null || contactProfile === void 0 ? void 0 : contactProfile.profile) === null || _e === void 0 ? void 0 : _e.name) || undefined, updated_at: new Date() },
                        create: { workspace_id: workspaceId, phone: phone, name: ((_f = contactProfile === null || contactProfile === void 0 ? void 0 : contactProfile.profile) === null || _f === void 0 ? void 0 : _f.name) || "Unknown", opt_in: true },
                    })];
            case 25:
                contact = _h.sent();
                return [4 /*yield*/, db_1.prisma.conversation.findFirst({
                        where: { contact_id: contact.id, status: "OPEN" }
                    })];
            case 26:
                conversation = _h.sent();
                if (!!conversation) return [3 /*break*/, 28];
                return [4 /*yield*/, db_1.prisma.conversation.create({
                        data: { workspace_id: workspaceId, contact_id: contact.id, status: "OPEN" }
                    })];
            case 27:
                conversation = _h.sent();
                _h.label = 28;
            case 28:
                msgContent = {};
                msgType = "TEXT";
                if (!message.text) return [3 /*break*/, 29];
                msgContent = { body: message.text.body };
                msgType = "TEXT";
                return [3 /*break*/, 38];
            case 29:
                if (!message.image) return [3 /*break*/, 31];
                return [4 /*yield*/, media_downloader_1.WhatsAppMediaDownloader.downloadAndSaveMedia(message.image.id, token, workspaceId)];
            case 30:
                localUrl = _h.sent();
                msgContent = { media_id: message.image.id, caption: message.image.caption, link: localUrl };
                msgType = "IMAGE";
                return [3 /*break*/, 38];
            case 31:
                if (!message.document) return [3 /*break*/, 33];
                return [4 /*yield*/, media_downloader_1.WhatsAppMediaDownloader.downloadAndSaveMedia(message.document.id, token, workspaceId)];
            case 32:
                localUrl = _h.sent();
                msgType = "DOCUMENT";
                msgContent = { media_id: message.document.id, filename: message.document.filename, link: localUrl };
                return [3 /*break*/, 38];
            case 33:
                if (!message.audio) return [3 /*break*/, 35];
                return [4 /*yield*/, media_downloader_1.WhatsAppMediaDownloader.downloadAndSaveMedia(message.audio.id, token, workspaceId)];
            case 34:
                localUrl = _h.sent();
                msgType = "AUDIO";
                msgContent = { media_id: message.audio.id, link: localUrl };
                return [3 /*break*/, 38];
            case 35:
                if (!message.video) return [3 /*break*/, 37];
                return [4 /*yield*/, media_downloader_1.WhatsAppMediaDownloader.downloadAndSaveMedia(message.video.id, token, workspaceId)];
            case 36:
                localUrl = _h.sent();
                msgType = "VIDEO";
                msgContent = { media_id: message.video.id, link: localUrl };
                return [3 /*break*/, 38];
            case 37:
                if (message.interactive) {
                    msgType = "INTERACTIVE";
                    msgContent = message.interactive;
                }
                else if (message.button) {
                    msgType = "INTERACTIVE";
                    msgContent = { button_text: message.button.text, button_payload: message.button.payload };
                }
                _h.label = 38;
            case 38: 
            // 4. Save to Database
            return [4 /*yield*/, db_1.prisma.message.create({
                    data: {
                        workspace_id: workspaceId,
                        contact_id: contact.id,
                        conversation_id: conversation.id,
                        meta_id: message.id,
                        type: msgType,
                        direction: "INBOUND",
                        content: msgContent,
                        status: "DELIVERED"
                    }
                })];
            case 39:
                // 4. Save to Database
                _h.sent();
                // 4.5 🐛 HARD FIX: Force updating the Conversation timestamp!
                return [4 /*yield*/, db_1.prisma.conversation.update({
                        where: { id: conversation.id },
                        data: { updated_at: new Date() }
                    })];
            case 40:
                // 4.5 🐛 HARD FIX: Force updating the Conversation timestamp!
                _h.sent();
                normalizedMsg = (0, message_normalizer_1.normalizeMessage)(message, { metadata: metadata });
                return [4 /*yield*/, flow_runner_1.FlowRunner.processMessage(workspaceId, contact.id, normalizedMsg)];
            case 41:
                _h.sent();
                return [3 /*break*/, 43];
            case 42:
                err_6 = _h.sent();
                console.error("[Worker \u2622\uFE0F] Inbound message failed for ".concat(message.id, ":"), err_6 === null || err_6 === void 0 ? void 0 : err_6.message);
                throw err_6; // Allow BullMQ retry
            case 43:
                if (!(job.name === "process-whatsapp-status")) return [3 /*break*/, 56];
                statusUpdate = job.data.statusUpdate;
                messageMetaId = statusUpdate.id;
                statusStr = statusUpdate.status.toUpperCase();
                timestamp = statusUpdate.timestamp ? new Date(parseInt(statusUpdate.timestamp) * 1000) : new Date();
                updateData = {};
                if (statusStr === "FAILED" && ((_g = statusUpdate.errors) === null || _g === void 0 ? void 0 : _g.length) > 0) {
                    err = statusUpdate.errors[0];
                    updateData = { error_code: "".concat(err.code), error_message: err.title || err.message, failed_at: timestamp };
                }
                if (statusStr === "SENT")
                    updateData.sent_at = timestamp;
                if (statusStr === "DELIVERED")
                    updateData.delivered_at = timestamp;
                if (statusStr === "READ")
                    updateData.read_at = timestamp;
                _h.label = 44;
            case 44:
                _h.trys.push([44, 55, , 56]);
                return [4 /*yield*/, db_1.prisma.message.findUnique({
                        where: { meta_id: messageMetaId },
                        select: { id: true, campaign_id: true }
                    })];
            case 45:
                existingMsg = _h.sent();
                if (!existingMsg) return [3 /*break*/, 53];
                return [4 /*yield*/, db_1.prisma.message.update({
                        where: { id: existingMsg.id },
                        data: __assign({ status: statusStr }, updateData)
                    })];
            case 46:
                _h.sent();
                cmpId = existingMsg.campaign_id;
                if (!cmpId) return [3 /*break*/, 52];
                if (!(statusStr === "DELIVERED")) return [3 /*break*/, 48];
                return [4 /*yield*/, db_1.prisma.campaignStats.update({ where: { campaign_id: cmpId }, data: { delivered: { increment: 1 } } }).catch(function (e) { return null; })];
            case 47:
                _h.sent();
                return [3 /*break*/, 52];
            case 48:
                if (!(statusStr === "READ")) return [3 /*break*/, 50];
                return [4 /*yield*/, db_1.prisma.campaignStats.update({ where: { campaign_id: cmpId }, data: { read: { increment: 1 } } }).catch(function (e) { return null; })];
            case 49:
                _h.sent();
                return [3 /*break*/, 52];
            case 50:
                if (!(statusStr === "FAILED")) return [3 /*break*/, 52];
                // Atomic Truth Bridging: move from sent to failed
                return [4 /*yield*/, db_1.prisma.campaignStats.update({ where: { campaign_id: cmpId }, data: { failed: { increment: 1 }, sent: { decrement: 1 } } }).catch(function (e) { return null; })];
            case 51:
                // Atomic Truth Bridging: move from sent to failed
                _h.sent();
                _h.label = 52;
            case 52: return [3 /*break*/, 54];
            case 53:
                console.log("[Worker] Status arrived but message not yet in DB ".concat(messageMetaId, " \u2014 throwing to retry."));
                throw new Error("P2025");
            case 54: return [3 /*break*/, 56];
            case 55:
                err_7 = _h.sent();
                // message might not be in DB yet if status arrives very fast
                if (err_7.code === 'P2025' || err_7.message === 'P2025') {
                    console.log("[Worker] Retrying status update...");
                    throw new Error("Message not found yet, retrying status update...");
                }
                return [3 /*break*/, 56];
            case 56:
                if (!(job.name === "edu-lead-reminder")) return [3 /*break*/, 58];
                EduAutomation = require("@/lib/edu/automation").EduAutomation;
                return [4 /*yield*/, EduAutomation.handleReminder(job.data)];
            case 57:
                _h.sent();
                _h.label = 58;
            case 58: return [2 /*return*/];
        }
    });
}); }, { connection: REDIS_CONNECTION });
/**
 * ☢️ KNOWLEDGE INGESTION WORKER
 * Offloads heavy document processing (PDF parsing, OCR, Embeddings)
 * to prevent web process locking and bundle-missing issues.
 */
var knowledgeWorker = new bullmq_1.Worker("knowledge-queue", function (job) { return __awaiter(void 0, void 0, void 0, function () {
    var sourceId, KnowledgeEngine, result, err_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                sourceId = job.data.sourceId;
                console.log("[KnowledgeWorker] \uD83E\uDDE0 Ingesting Source: ".concat(sourceId));
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require("@/lib/ai/knowledge-engine"); })];
            case 2:
                KnowledgeEngine = (_a.sent()).KnowledgeEngine;
                return [4 /*yield*/, KnowledgeEngine.ingest(sourceId)];
            case 3:
                result = _a.sent();
                console.log("[KnowledgeWorker] \u2705 Ingestion Complete for ".concat(sourceId, ":"), result);
                return [3 /*break*/, 5];
            case 4:
                err_8 = _a.sent();
                console.error("[KnowledgeWorker] \u274C Ingestion Failed for ".concat(sourceId, ":"), err_8.message);
                throw err_8; // Trigger BullMQ retry
            case 5: return [2 /*return*/];
        }
    });
}); }, {
    connection: REDIS_CONNECTION,
    concurrency: 5 // Process up to 5 documents in parallel
});
console.log("🚀 Enterprise Workers (Drip Pulse + Meta API + Campaign Dispatch + Knowledge) Active");
