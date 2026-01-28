export const paginationQuerySchema = {
   type: "object",
   properties: {
      page: {
         type: "integer",
         errorMessage: {
            type: "Page harus berupa angka",
            minimum: "Page minimal 1",
         },
      },
      limit: {
         type: "integer",
         minimum: 1,
         maximum: 100,
         default: 10,
         errorMessage: {
            type: "Limit harus berupa angka",
            minimum: "Limit minimal 1",
            maximum: "Limit maksimal 100",
         },
      },
      search: { type: "string" },
      sortBy: { type: "string" },
      sortOrder: {
         type: "string",
         enum: ["asc", "desc"],
         default: "desc",
         errorMessage: {
            enum: "Sort order harus asc atau desc",
         },
      },
   },
};

export const idParamsSchema = {
   type: "object",
   required: ["id"],
   properties: {
      id: {
         type: "integer",
         errorMessage: {
            type: "ID harus berupa angka",
         },
      },
   },
   errorMessage: {
      required: {
         id: "ID wajib diisi",
      },
   },
};

export const successResponseSchema = {
   type: "object",
   properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: {
         type: "object",
         additionalProperties: true,
      },
      refetchQuery: { type: "array" },
   },
};

export const errorResponseSchema = {
   type: "object",
   required: ["success", "message"],
   properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      errors: {
         type: "object",
         additionalProperties: { type: "string" },
      },
   },
};

export const listResponseSchema = {
   type: "object",
   properties: {
      success: { type: "boolean" },
      message: { type: "string" },
      data: { type: "array" },
      meta: {
         type: "object",
         properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
         },
      },
   },
};
