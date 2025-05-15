import Utils from "./utils.js";

const pagination = async (model, args, options) => {
  const page = parseInt(args.page || 1, 10);
  const limit = parseInt(args.limit || 10, 10);
  const offset = (page - 1) * limit;

  // Query untuk count total (tanpa limit/offset)
  const countQuery = await model.count({
    ...options,
    distinct: true,
    include: options.include?.filter((inc) => !inc.required), // Hanya include yang tidak required
  });

  // Query untuk data
  const dataQuery = await model.findAll({
    ...options,
    limit: limit,
    offset: offset,
    // distinct: true,
    // subQuery: false,
  });

  return {
    data: dataQuery.map((row) => Utils.camelToSnakeObject(row.toJSON())),
    pagination: Utils.paginationHelper(page, limit, countQuery),
  };
};

export default pagination;
