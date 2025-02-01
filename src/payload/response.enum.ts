export default interface IResponse {
  status: number | string;
  message?: string;
  data?: {};
  success: boolean;
}
