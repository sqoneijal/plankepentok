export default function createListResponse(data?: Array<Record<string, any>>, page?: null, limit?: number, total?: number) {
   return {
      success: true,
      data,
      meta: {
         page,
         limit,
         total,
         totalPages: total && limit && Math.ceil(total / limit),
      },
   };
}
