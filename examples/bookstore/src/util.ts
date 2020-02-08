interface Author {
    firstName: string;
    lastName: string;
}

export function assertIsAuthor (val): asserts val is Author {
    if (typeof val.firstName !== 'string') {
        throw new Error('firstName is not a string');
    }
    if (typeof val.lastName !== 'string') {
        throw new Error('lastName is not a string');
    }
}
