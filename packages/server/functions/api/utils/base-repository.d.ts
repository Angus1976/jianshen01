/**
 * 分页参数
 */
export interface PaginationParams {
    page?: number;
    pageSize?: number;
}
/**
 * 分页结果
 */
export interface PaginatedResult<T> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
}
/**
 * 基础仓库类 - 封装 TCB 数据库常用操作
 */
export declare class BaseRepository<T extends {
    _id?: string;
}> {
    protected collectionName: string;
    constructor(collectionName: string);
    /**
     * 确保集合存在
     */
    ensureCollection(): Promise<void>;
    /**
     * 获取集合
     */
    protected get collection(): import("@cloudbase/node-sdk").Database.CollectionReference;
    /**
     * 获取命令对象
     */
    protected get cmd(): {
        eq(val: any): import("@cloudbase/node-sdk").Database.QueryCommand;
        neq(val: any): import("@cloudbase/node-sdk").Database.QueryCommand;
        lt(val: any): import("@cloudbase/node-sdk").Database.QueryCommand;
        lte(val: any): import("@cloudbase/node-sdk").Database.QueryCommand;
        gt(val: any): import("@cloudbase/node-sdk").Database.QueryCommand;
        gte(val: any): import("@cloudbase/node-sdk").Database.QueryCommand;
        in(val: any): import("@cloudbase/node-sdk").Database.QueryCommand;
        nin(val: any): import("@cloudbase/node-sdk").Database.QueryCommand;
        all(val: any): import("@cloudbase/node-sdk").Database.QueryCommand;
        elemMatch(val: any): import("@cloudbase/node-sdk").Database.QueryCommand;
        exists(val: boolean): import("@cloudbase/node-sdk").Database.QueryCommand;
        size(val: number): import("@cloudbase/node-sdk").Database.QueryCommand;
        mod(val: number[]): import("@cloudbase/node-sdk").Database.QueryCommand;
        geoNear(val: any): import("@cloudbase/node-sdk").Database.QueryCommand;
        geoWithin(val: any): import("@cloudbase/node-sdk").Database.QueryCommand;
        geoIntersects(val: any): import("@cloudbase/node-sdk").Database.QueryCommand;
        and(...__expressions__: import("@cloudbase/node-sdk").Database.IQueryCondition[]): import("@cloudbase/node-sdk").Database.LogicCommand;
        nor(...__expressions__: import("@cloudbase/node-sdk").Database.IQueryCondition[]): import("@cloudbase/node-sdk").Database.LogicCommand;
        or(...__expressions__: import("@cloudbase/node-sdk").Database.IQueryCondition[]): import("@cloudbase/node-sdk").Database.LogicCommand;
        not(...__expressions__: import("@cloudbase/node-sdk").Database.IQueryCondition[]): import("@cloudbase/node-sdk").Database.LogicCommand;
        set(val: any): import("@cloudbase/node-sdk").Database.UpdateCommand;
        remove(): import("@cloudbase/node-sdk").Database.UpdateCommand;
        inc(val: number): import("@cloudbase/node-sdk").Database.UpdateCommand;
        mul(val: number): import("@cloudbase/node-sdk").Database.UpdateCommand;
        push(...args: any[]): import("@cloudbase/node-sdk").Database.UpdateCommand;
        pull(values: any): import("@cloudbase/node-sdk").Database.UpdateCommand;
        pullAll(values: any): import("@cloudbase/node-sdk").Database.UpdateCommand;
        pop(): import("@cloudbase/node-sdk").Database.UpdateCommand;
        shift(): import("@cloudbase/node-sdk").Database.UpdateCommand;
        unshift(...__values__: any[]): import("@cloudbase/node-sdk").Database.UpdateCommand;
        addToSet(values: any): import("@cloudbase/node-sdk").Database.UpdateCommand;
        rename(values: any): import("@cloudbase/node-sdk").Database.UpdateCommand;
        bit(values: any): import("@cloudbase/node-sdk").Database.UpdateCommand;
        max(values: any): import("@cloudbase/node-sdk").Database.UpdateCommand;
        min(values: any): import("@cloudbase/node-sdk").Database.UpdateCommand;
        expr(values: import("@cloudbase/node-sdk").Database.AggregationOperator): {
            $expr: import("@cloudbase/node-sdk").Database.AggregationOperator;
        };
        jsonSchema(schema: any): {
            $jsonSchema: any;
        };
        text(values: string | {
            search: string;
            language?: string;
            caseSensitive?: boolean;
            diacriticSensitive: boolean;
        }): {
            $search: {
                (regexp: string | import("@cloudbase/node-sdk").Database.RegExp): number;
                (searcher: {
                    [Symbol.search](string: string): number;
                }): number;
            };
            $language?: undefined;
            $caseSensitive?: undefined;
            $diacriticSensitive?: undefined;
        } | {
            $search: string;
            $language: string;
            $caseSensitive: boolean;
            $diacriticSensitive: boolean;
        };
        aggregate: {
            pipeline(): import("@cloudbase/node-sdk").Database.Aggregation;
            abs: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            add: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            ceil: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            divide: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            exp: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            floor: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            ln: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            log: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            log10: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            mod: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            multiply: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            pow: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            sqrt: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            subtract: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            trunc: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            arrayElemAt: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            arrayToObject: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            concatArrays: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            filter: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            in: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            indexOfArray: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            isArray: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            map: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            range: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            reduce: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            reverseArray: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            size: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            slice: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            zip: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            and: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            not: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            or: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            cmp: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            eq: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            gt: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            gte: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            lt: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            lte: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            neq: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            cond: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            ifNull: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            switch: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            dateFromParts: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            dateFromString: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            dayOfMonth: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            dayOfWeek: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            dayOfYear: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            isoDayOfWeek: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            isoWeek: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            isoWeekYear: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            millisecond: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            minute: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            month: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            second: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            hour: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            week: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            year: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            literal: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            mergeObjects: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            objectToArray: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            allElementsTrue: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            anyElementTrue: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            setDifference: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            setEquals: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            setIntersection: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            setIsSubset: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            setUnion: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            concat: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            dateToString: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            indexOfBytes: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            indexOfCP: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            split: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            strLenBytes: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            strLenCP: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            strcasecmp: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            substr: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            substrBytes: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            substrCP: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            toLower: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            toUpper: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            meta: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            addToSet: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            avg: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            first: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            last: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            max: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            min: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            push: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            stdDevPop: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            stdDevSamp: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            sum: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
            let: (param: any) => import("@cloudbase/node-sdk").Database.AggregationOperator;
        };
        project: {
            slice: (param: any) => import("@cloudbase/node-sdk").Database.ProjectionOperator;
            elemMatch: (param: any) => import("@cloudbase/node-sdk").Database.ProjectionOperator;
        };
    };
    /**
     * 生成 UUID
     */
    protected generateId(): string;
    /**
     * 创建文档
     */
    create(data: Omit<T, '_id'> & {
        _id?: string;
    }): Promise<T>;
    /**
     * 批量创建
     */
    createMany(dataList: Array<Omit<T, '_id'>>): Promise<T[]>;
    /**
     * 根据 ID 查询
     */
    findById(id: string): Promise<T | null>;
    /**
     * 根据条件查询单个
     */
    findOne(query: Partial<T>): Promise<T | null>;
    /**
     * 根据条件查询多个
     */
    find(query?: Partial<T> | object): Promise<T[]>;
    /**
     * 分页查询
     */
    findPaginated(query?: Partial<T> | object, { page, pageSize }?: PaginationParams, orderBy?: {
        field: string;
        direction: 'asc' | 'desc';
    }): Promise<PaginatedResult<T>>;
    /**
     * 根据 ID 更新
     */
    updateById(id: string, data: Partial<T>): Promise<boolean>;
    /**
     * 根据条件更新
     */
    updateMany(query: Partial<T> | object, data: Partial<T>): Promise<number>;
    /**
     * 根据 ID 删除
     */
    deleteById(id: string): Promise<boolean>;
    /**
     * 根据条件删除
     */
    deleteMany(query: Partial<T> | object): Promise<number>;
    /**
     * 统计数量
     */
    count(query?: Partial<T> | object): Promise<number>;
    /**
     * 检查是否存在
     */
    exists(query: Partial<T> | object): Promise<boolean>;
    /**
     * 自增字段
     */
    increment(id: string, field: keyof T, value?: number): Promise<boolean>;
}
//# sourceMappingURL=base-repository.d.ts.map