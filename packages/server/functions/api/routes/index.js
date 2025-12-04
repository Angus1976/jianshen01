"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const level_routes_1 = __importDefault(require("./level.routes"));
const points_routes_1 = __importDefault(require("./points.routes"));
const checkin_routes_1 = __importDefault(require("./checkin.routes"));
const benefits_routes_1 = __importDefault(require("./benefits.routes"));
const meals_routes_1 = __importDefault(require("./meals.routes"));
const referral_routes_1 = __importDefault(require("./referral.routes"));
const feedback_routes_1 = __importDefault(require("./feedback.routes"));
const brand_routes_1 = __importDefault(require("./brand.routes"));
const admin_1 = __importDefault(require("./admin"));
const router = (0, express_1.Router)();
// 会员端路由
router.use('/auth', auth_routes_1.default);
router.use('/level', level_routes_1.default);
router.use('/points', points_routes_1.default);
router.use('/checkin', checkin_routes_1.default);
router.use('/benefits', benefits_routes_1.default);
router.use('/meals', meals_routes_1.default);
router.use('/referral', referral_routes_1.default);
router.use('/feedback', feedback_routes_1.default);
router.use('/brand', brand_routes_1.default);
// 管理后台路由
router.use('/admin', admin_1.default);
exports.default = router;
