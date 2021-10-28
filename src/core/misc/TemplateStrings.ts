export type Options = {
  transform: (data: {value: unknown; key: string}) => unknown;
};

export default function (
  template: string,
  data: unknown[] | Record<string, unknown>,
  options: Options = {transform: ({value}) => value}
) {
  const braceRegex = /{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}/gi;
  return template.replace(braceRegex, (placeholder: string, key: string) => {
    let value = data;
    for (const property of key.split('.')) {
      value = value ? value[property] : undefined;
    }
    const transformedValue = options.transform({value, key});
    return transformedValue === undefined ? placeholder : String(transformedValue);
  });
}
