export interface ApiResponse<T> {
  message: string;
  data: T;
}

export type MethodReturn<T extends (...args: any[]) => any> = Awaited<
  ReturnType<T>
>;
