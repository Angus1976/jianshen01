import cloudbase from '@cloudbase/node-sdk';
/**
 * 初始化 TCB
 */
export declare function initTCB(): cloudbase.CloudBase;
/**
 * 获取数据库实例
 */
export declare function getDatabase(): cloudbase.Database.Db;
/**
 * 获取 TCB 应用实例
 */
export declare function getTCBApp(): cloudbase.CloudBase;
export declare const db: {
    readonly command: {
        eq(val: any): cloudbase.Database.QueryCommand;
        neq(val: any): cloudbase.Database.QueryCommand;
        lt(val: any): cloudbase.Database.QueryCommand;
        lte(val: any): cloudbase.Database.QueryCommand;
        gt(val: any): cloudbase.Database.QueryCommand;
        gte(val: any): cloudbase.Database.QueryCommand;
        in(val: any): cloudbase.Database.QueryCommand;
        nin(val: any): cloudbase.Database.QueryCommand;
        all(val: any): cloudbase.Database.QueryCommand;
        elemMatch(val: any): cloudbase.Database.QueryCommand;
        exists(val: boolean): cloudbase.Database.QueryCommand;
        size(val: number): cloudbase.Database.QueryCommand;
        mod(val: number[]): cloudbase.Database.QueryCommand;
        geoNear(val: any): cloudbase.Database.QueryCommand;
        geoWithin(val: any): cloudbase.Database.QueryCommand;
        geoIntersects(val: any): cloudbase.Database.QueryCommand;
        and(...__expressions__: cloudbase.Database.IQueryCondition[]): cloudbase.Database.LogicCommand;
        nor(...__expressions__: cloudbase.Database.IQueryCondition[]): cloudbase.Database.LogicCommand;
        or(...__expressions__: cloudbase.Database.IQueryCondition[]): cloudbase.Database.LogicCommand;
        not(...__expressions__: cloudbase.Database.IQueryCondition[]): cloudbase.Database.LogicCommand;
        set(val: any): cloudbase.Database.UpdateCommand;
        remove(): cloudbase.Database.UpdateCommand;
        inc(val: number): cloudbase.Database.UpdateCommand;
        mul(val: number): cloudbase.Database.UpdateCommand;
        push(...args: any[]): cloudbase.Database.UpdateCommand;
        pull(values: any): cloudbase.Database.UpdateCommand;
        pullAll(values: any): cloudbase.Database.UpdateCommand;
        pop(): cloudbase.Database.UpdateCommand;
        shift(): cloudbase.Database.UpdateCommand;
        unshift(...__values__: any[]): cloudbase.Database.UpdateCommand;
        addToSet(values: any): cloudbase.Database.UpdateCommand;
        rename(values: any): cloudbase.Database.UpdateCommand;
        bit(values: any): cloudbase.Database.UpdateCommand;
        max(values: any): cloudbase.Database.UpdateCommand;
        min(values: any): cloudbase.Database.UpdateCommand;
        expr(values: cloudbase.Database.AggregationOperator): {
            $expr: cloudbase.Database.AggregationOperator;
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
                (regexp: string | cloudbase.Database.RegExp): number;
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
            pipeline(): cloudbase.Database.Aggregation;
            abs: (param: any) => cloudbase.Database.AggregationOperator;
            add: (param: any) => cloudbase.Database.AggregationOperator;
            ceil: (param: any) => cloudbase.Database.AggregationOperator;
            divide: (param: any) => cloudbase.Database.AggregationOperator;
            exp: (param: any) => cloudbase.Database.AggregationOperator;
            floor: (param: any) => cloudbase.Database.AggregationOperator;
            ln: (param: any) => cloudbase.Database.AggregationOperator;
            log: (param: any) => cloudbase.Database.AggregationOperator;
            log10: (param: any) => cloudbase.Database.AggregationOperator;
            mod: (param: any) => cloudbase.Database.AggregationOperator;
            multiply: (param: any) => cloudbase.Database.AggregationOperator;
            pow: (param: any) => cloudbase.Database.AggregationOperator;
            sqrt: (param: any) => cloudbase.Database.AggregationOperator;
            subtract: (param: any) => cloudbase.Database.AggregationOperator;
            trunc: (param: any) => cloudbase.Database.AggregationOperator;
            arrayElemAt: (param: any) => cloudbase.Database.AggregationOperator;
            arrayToObject: (param: any) => cloudbase.Database.AggregationOperator;
            concatArrays: (param: any) => cloudbase.Database.AggregationOperator;
            filter: (param: any) => cloudbase.Database.AggregationOperator;
            in: (param: any) => cloudbase.Database.AggregationOperator;
            indexOfArray: (param: any) => cloudbase.Database.AggregationOperator;
            isArray: (param: any) => cloudbase.Database.AggregationOperator;
            map: (param: any) => cloudbase.Database.AggregationOperator;
            range: (param: any) => cloudbase.Database.AggregationOperator;
            reduce: (param: any) => cloudbase.Database.AggregationOperator;
            reverseArray: (param: any) => cloudbase.Database.AggregationOperator;
            size: (param: any) => cloudbase.Database.AggregationOperator;
            slice: (param: any) => cloudbase.Database.AggregationOperator;
            zip: (param: any) => cloudbase.Database.AggregationOperator;
            and: (param: any) => cloudbase.Database.AggregationOperator;
            not: (param: any) => cloudbase.Database.AggregationOperator;
            or: (param: any) => cloudbase.Database.AggregationOperator;
            cmp: (param: any) => cloudbase.Database.AggregationOperator;
            eq: (param: any) => cloudbase.Database.AggregationOperator;
            gt: (param: any) => cloudbase.Database.AggregationOperator;
            gte: (param: any) => cloudbase.Database.AggregationOperator;
            lt: (param: any) => cloudbase.Database.AggregationOperator;
            lte: (param: any) => cloudbase.Database.AggregationOperator;
            neq: (param: any) => cloudbase.Database.AggregationOperator;
            cond: (param: any) => cloudbase.Database.AggregationOperator;
            ifNull: (param: any) => cloudbase.Database.AggregationOperator;
            switch: (param: any) => cloudbase.Database.AggregationOperator;
            dateFromParts: (param: any) => cloudbase.Database.AggregationOperator;
            dateFromString: (param: any) => cloudbase.Database.AggregationOperator;
            dayOfMonth: (param: any) => cloudbase.Database.AggregationOperator;
            dayOfWeek: (param: any) => cloudbase.Database.AggregationOperator;
            dayOfYear: (param: any) => cloudbase.Database.AggregationOperator;
            isoDayOfWeek: (param: any) => cloudbase.Database.AggregationOperator;
            isoWeek: (param: any) => cloudbase.Database.AggregationOperator;
            isoWeekYear: (param: any) => cloudbase.Database.AggregationOperator;
            millisecond: (param: any) => cloudbase.Database.AggregationOperator;
            minute: (param: any) => cloudbase.Database.AggregationOperator;
            month: (param: any) => cloudbase.Database.AggregationOperator;
            second: (param: any) => cloudbase.Database.AggregationOperator;
            hour: (param: any) => cloudbase.Database.AggregationOperator;
            week: (param: any) => cloudbase.Database.AggregationOperator;
            year: (param: any) => cloudbase.Database.AggregationOperator;
            literal: (param: any) => cloudbase.Database.AggregationOperator;
            mergeObjects: (param: any) => cloudbase.Database.AggregationOperator;
            objectToArray: (param: any) => cloudbase.Database.AggregationOperator;
            allElementsTrue: (param: any) => cloudbase.Database.AggregationOperator;
            anyElementTrue: (param: any) => cloudbase.Database.AggregationOperator;
            setDifference: (param: any) => cloudbase.Database.AggregationOperator;
            setEquals: (param: any) => cloudbase.Database.AggregationOperator;
            setIntersection: (param: any) => cloudbase.Database.AggregationOperator;
            setIsSubset: (param: any) => cloudbase.Database.AggregationOperator;
            setUnion: (param: any) => cloudbase.Database.AggregationOperator;
            concat: (param: any) => cloudbase.Database.AggregationOperator;
            dateToString: (param: any) => cloudbase.Database.AggregationOperator;
            indexOfBytes: (param: any) => cloudbase.Database.AggregationOperator;
            indexOfCP: (param: any) => cloudbase.Database.AggregationOperator;
            split: (param: any) => cloudbase.Database.AggregationOperator;
            strLenBytes: (param: any) => cloudbase.Database.AggregationOperator;
            strLenCP: (param: any) => cloudbase.Database.AggregationOperator;
            strcasecmp: (param: any) => cloudbase.Database.AggregationOperator;
            substr: (param: any) => cloudbase.Database.AggregationOperator;
            substrBytes: (param: any) => cloudbase.Database.AggregationOperator;
            substrCP: (param: any) => cloudbase.Database.AggregationOperator;
            toLower: (param: any) => cloudbase.Database.AggregationOperator;
            toUpper: (param: any) => cloudbase.Database.AggregationOperator;
            meta: (param: any) => cloudbase.Database.AggregationOperator;
            addToSet: (param: any) => cloudbase.Database.AggregationOperator;
            avg: (param: any) => cloudbase.Database.AggregationOperator;
            first: (param: any) => cloudbase.Database.AggregationOperator;
            last: (param: any) => cloudbase.Database.AggregationOperator;
            max: (param: any) => cloudbase.Database.AggregationOperator;
            min: (param: any) => cloudbase.Database.AggregationOperator;
            push: (param: any) => cloudbase.Database.AggregationOperator;
            stdDevPop: (param: any) => cloudbase.Database.AggregationOperator;
            stdDevSamp: (param: any) => cloudbase.Database.AggregationOperator;
            sum: (param: any) => cloudbase.Database.AggregationOperator;
            let: (param: any) => cloudbase.Database.AggregationOperator;
        };
        project: {
            slice: (param: any) => cloudbase.Database.ProjectionOperator;
            elemMatch: (param: any) => cloudbase.Database.ProjectionOperator;
        };
    };
    collection(name: string): cloudbase.Database.CollectionReference;
};
export declare function connectDatabase(): Promise<void>;
export default db;
//# sourceMappingURL=database.d.ts.map