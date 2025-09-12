export declare function toLowerCase<T extends string>(str: T): Lowercase<T>;
/**
 * Get the type of an input element.
 * This takes care of the case where a password input is changed to a text input.
 * In this case, we continue to consider this of type password, in order to avoid leaking sensitive data
 * where passwords should be masked.
 */
export declare function getInputType(element: HTMLElement): Lowercase<string> | null;
//# sourceMappingURL=get-input-type.d.ts.map