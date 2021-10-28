export type Options = {
  transform: (data: {value: unknown; key: string}) => unknown;
};

/**
 * Template strings are a way to create a string from multiple values.
 * @param template The template string.
 * @param data The data to use in the template.
 * @param options The options to use when transforming the data.
 * @returns The transformed template string.
 * @author Maxime Scharwath
 */
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
