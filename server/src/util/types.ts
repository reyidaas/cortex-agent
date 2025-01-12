type JsType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'undefined'
  | 'object'
  | 'function'
  | 'bigint'
  | 'symbol';

type TsTypeFromJsType<T extends JsType> = T extends 'string'
  ? string
  : T extends 'number'
    ? number
    : T extends 'boolean'
      ? boolean
      : T extends 'undefined'
        ? undefined
        : T extends 'object'
          ? object
          : T extends 'function'
            ? Function
            : T extends 'bigint'
              ? bigint
              : T extends 'symbol'
                ? symbol
                : never;

export const hasPropertyOfType =
  <T extends string, U extends JsType>(name: T, type: U) =>
  (value: unknown): value is { [Key in T]: TsTypeFromJsType<U> } => {
    if (typeof value !== 'object' || value === null) return false;
    if (!(name in value) || typeof value[name as keyof typeof value] !== type) return false;
    return true;
  };
