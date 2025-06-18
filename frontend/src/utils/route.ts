
type ExtractRouteParams<T extends string> =
    T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
    ? Param
    : never;

export const buildRoute = <T extends string>(route: T, params: Record<ExtractRouteParams<T>, string | number>) => {
    let builtRoute: string = route;

    (Object.keys(params) as Array<ExtractRouteParams<T>>).forEach((key) => {
        builtRoute = builtRoute.replace(`:${key}`, String(params[key]));
    });

    return builtRoute;
};