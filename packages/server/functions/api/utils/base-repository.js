"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const database_1 = require("../config/database");
const uuid_1 = require("uuid");
// 已创建的集合缓存
const createdCollections = new Set();
/**
 * 基础仓库类 - 封装 TCB 数据库常用操作
 */
class BaseRepository {
    constructor(collectionName) {
        this.collectionName = collectionName;
    }
    /**
     * 确保集合存在
     */
    async ensureCollection() {
        if (createdCollections.has(this.collectionName)) {
            return;
        }
        try {
            const app = (0, database_1.getTCBApp)();
            await app.database().createCollection(this.collectionName);
            console.log(`✅ 集合 ${this.collectionName} 创建成功`);
        }
        catch (err) {
            const error = err;
            // 集合已存在则忽略
            if (error.code !== 'DATABASE_COLLECTION_EXIST' &&
                error.code !== 'DATABASE_COLLECTION_ALREADY_EXIST') {
                throw err;
            }
        }
        createdCollections.add(this.collectionName);
    }
    /**
     * 获取集合
     */
    get collection() {
        return database_1.db.collection(this.collectionName);
    }
    /**
     * 获取命令对象
     */
    get cmd() {
        return database_1.db.command;
    }
    /**
     * 生成 UUID
     */
    generateId() {
        return (0, uuid_1.v4)();
    }
    /**
     * 创建文档
     */
    async create(data) {
        const now = new Date();
        const doc = {
            _id: data._id || this.generateId(),
            ...data,
            createdAt: now,
            updatedAt: now,
        };
        await this.collection.add(doc);
        return doc;
    }
    /**
     * 批量创建
     */
    async createMany(dataList) {
        const now = new Date();
        const docs = dataList.map((data) => ({
            _id: this.generateId(),
            ...data,
            createdAt: now,
            updatedAt: now,
        }));
        // TCB 不支持批量插入，需要逐个插入
        for (const doc of docs) {
            await this.collection.add(doc);
        }
        return docs;
    }
    /**
     * 根据 ID 查询
     */
    async findById(id) {
        const { data } = await this.collection.doc(id).get();
        // TCB doc().get() may return array or single object depending on context
        if (Array.isArray(data)) {
            return data[0] || null;
        }
        return data || null;
    }
    /**
     * 根据条件查询单个
     */
    async findOne(query) {
        const { data } = await this.collection.where(query).limit(1).get();
        return data[0] || null;
    }
    /**
     * 根据条件查询多个
     */
    async find(query = {}) {
        const { data } = await this.collection.where(query).get();
        return data;
    }
    /**
     * 分页查询
     */
    async findPaginated(query = {}, { page = 1, pageSize = 20 } = {}, orderBy) {
        var _a;
        const skip = (page - 1) * pageSize;
        // 获取总数
        const countResult = await this.collection.where(query).count();
        const total = (_a = countResult.total) !== null && _a !== void 0 ? _a : 0;
        // 获取数据
        let queryBuilder = this.collection.where(query);
        if (orderBy) {
            queryBuilder = queryBuilder.orderBy(orderBy.field, orderBy.direction);
        }
        const { data } = await queryBuilder.skip(skip).limit(pageSize).get();
        return {
            list: data,
            total,
            page,
            pageSize,
        };
    }
    /**
     * 根据 ID 更新
     */
    async updateById(id, data) {
        var _a;
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };
        // 移除 _id 字段
        delete updateData._id;
        const result = await this.collection.doc(id).update(updateData);
        return ((_a = result.updated) !== null && _a !== void 0 ? _a : 0) > 0;
    }
    /**
     * 根据条件更新
     */
    async updateMany(query, data) {
        var _a;
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };
        delete updateData._id;
        const result = await this.collection.where(query).update(updateData);
        return (_a = result.updated) !== null && _a !== void 0 ? _a : 0;
    }
    /**
     * 根据 ID 删除
     */
    async deleteById(id) {
        const result = await this.collection.doc(id).remove();
        const deleted = typeof result.deleted === 'number' ? result.deleted : 0;
        return deleted > 0;
    }
    /**
     * 根据条件删除
     */
    async deleteMany(query) {
        const result = await this.collection.where(query).remove();
        return typeof result.deleted === 'number' ? result.deleted : 0;
    }
    /**
     * 统计数量
     */
    async count(query = {}) {
        var _a;
        const result = await this.collection.where(query).count();
        return (_a = result.total) !== null && _a !== void 0 ? _a : 0;
    }
    /**
     * 检查是否存在
     */
    async exists(query) {
        const count = await this.count(query);
        return count > 0;
    }
    /**
     * 自增字段
     */
    async increment(id, field, value = 1) {
        var _a;
        const result = await this.collection.doc(id).update({
            [field]: this.cmd.inc(value),
            updatedAt: new Date(),
        });
        return ((_a = result.updated) !== null && _a !== void 0 ? _a : 0) > 0;
    }
}
exports.BaseRepository = BaseRepository;
