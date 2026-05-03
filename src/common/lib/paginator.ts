export function paginate(
  per_page: number,
  page: number,
  total: number,
  data?: any,
) {
  return {
    data,
    meta: {
      total: per_page,
      totalPages: Math.ceil(total / per_page),
      currentPage: page,
      perPage: per_page,
    },
  };
}
