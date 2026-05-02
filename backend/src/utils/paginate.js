const getPagination = (page, limit) => {
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 20;

  const skip = (pageNumber - 1) * limitNumber;

  return { skip, take: limitNumber };
};

const getPaginationMeta = (total, page, limit) => {
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 20;
  
  return {
    page: pageNumber,
    limit: limitNumber,
    total,
    totalPages: Math.ceil(total / limitNumber),
  };
};

module.exports = { getPagination, getPaginationMeta };
