export default function createGetOneResponse(data?: Record<string, any> | null) {
   return {
      success: true,
      data,
   };
}
