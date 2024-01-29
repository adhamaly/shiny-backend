export interface IPagination {
  page: string;
  limit: string;
  modelName: any;
  queryOptions?: object | unknown;
  populate?: string | unknown;
}

export async function pagination({
  page,
  limit,
  modelName,
  queryOptions,
  populate,
}: IPagination) {
  const parsedPage = parseInt(page) || 1;
  const prasedLimit = parseInt(limit) || 20;
  const startIndex = (parsedPage - 1) * prasedLimit;

  const query = await modelName
    .find(queryOptions)
    .skip(startIndex)
    .limit(prasedLimit);
  const populatedQuery = await modelName
    .find(queryOptions)
    .skip(startIndex)
    .limit(prasedLimit)
    .populate(`${populate}`);

  const data = populate ? populatedQuery : query;

  const count = await modelName.find(queryOptions).count();

  const totalPages = Math.ceil(count / prasedLimit);

  return { data, count, totalPages };
}
