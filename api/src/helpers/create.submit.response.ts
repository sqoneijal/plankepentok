export default function createSubmitResponse(success: boolean, message: string, errors: Record<string, any> | {}) {
   return {
      success,
      message,
      errors: { ...errors },
   };
}
