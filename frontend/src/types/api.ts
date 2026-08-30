export interface BaseResponse<T> {
  data?: T;
  success: boolean;
  error?: string;
}
