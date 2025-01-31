export class ControllerResponse<T> {
  success: boolean;
  data?: T;
  timestamp: string;

  constructor(success: boolean, data?: T) {
    this.success = success;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}
