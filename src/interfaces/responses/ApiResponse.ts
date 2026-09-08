export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface ApiResult<T> {
  statusCode: number;
  body: ApiResponse<T>;
}

export const successResponse = <T>(
  message: string,
  data: T,
  statusCode = 200,
): ApiResult<T> => ({
  statusCode,
  body: { success: true, message, data },
});

export const errorResponse = <T = null>(
  message: string,
  statusCode: number,
): ApiResult<T> => ({
  statusCode,
  body: { success: false, message, data: null },
});
