export default class Utils {
    static camelToSnakeObject(obj, exclude = []) {
        const newObj = {};

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {

                if(exclude.includes(key)){
                    newObj[key] = obj[key];
                    continue;
                }

                const snakeCaseKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
                newObj[snakeCaseKey] = obj[key];
            }
        }

        return newObj;
    }

    static snakeToCamelObject(obj) {
        const newObj = {};

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const camelCaseKey = key.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
                newObj[camelCaseKey] = obj[key];
            }
        }

        return newObj;
    }

    static paginationHelper(page, limit, total) {
        const total_pages = Math.ceil(total / limit);
        const next = page < total_pages ? page + 1 : null;
        const prev = page > 1 ? page - 1 : null;
        return {
            page: parseInt(page),
            page_size: parseInt(limit),
            total_pages,
            total: total,
            next_page: next,
            prev_page: prev
        };
    }
}