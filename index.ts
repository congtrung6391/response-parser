// ================ String
interface PNullBranch {
  readonly PNullUnique: unique symbol;
};

type PNull = null & PNullBranch;

const isPNull = (obj: unknown): obj is PNull => {
  return obj === null;
};

export const parseNull = () => (obj: unknown): PNull | undefined => {
  return isPNull(obj) ? obj : undefined;
}

export const parseSafeNull = () => (obj: unknown): PNull => {
  if (isPNull(obj)) {
    return obj;
  }

  throw new Error('Invalid null');
}

// ================ String
interface PStringBranch {
  readonly PStringUnique: unique symbol;
};

type PString = string & PStringBranch;

const isPString = (str: unknown): str is PString => {
  return typeof str === 'string';
};

export const parseString = () => (str: unknown): PString | undefined => {
  return isPString(str) ? str : undefined;
}

export const parseSafeString = () => (str: unknown): PString => {
  if (isPString(str)) {
    return str;
  }

  throw new Error('Invalid string');
}

// ================ Number
interface PNumberBranch {
  readonly PNumberUnique: unique symbol;
};

type PNumber = number & PNumberBranch;

const isPNumber = (str: unknown): str is PNumber => {
  return typeof str === 'number';
};

export const parseNumber = () => (str: unknown): PNumber | undefined => {
  return isPNumber(str) ? str : undefined;
}

export const parseSafeNumber = () => (str: unknown): PNumber => {
  if (isPNumber(str)) {
    return str;
  }

  throw new Error('invalid number');
}

// ================ Boolean
interface PBooleanBranch {
  readonly PBooleanUnique: unique symbol;
};

type PBoolean = boolean & PBooleanBranch;

const isPBoolean = (b: unknown): b is PBoolean => {
  return typeof b === 'boolean';
};

export const parseBoolean = () => (b: unknown): PBoolean | undefined => {
  return isPBoolean(b) ? b : undefined;
}

export const parseSafeBoolean = () => (b: unknown): PBoolean => {
  if (isPBoolean(b)) {
    return b;
  }

  throw new Error('invalid boolean');
}

// =================== Object
type Parser = (value: unknown) => any | undefined;

interface PObjectBranch {
  readonly PObjectUnique: unique symbol;
};

type PObject<T extends Record<string, Parser>> = T & PObjectBranch;

const isPObject = <T extends Record<string, Parser>>(obj: unknown, schema: T): obj is PObject<T> => {
  if (typeof obj !== 'object') {
    return false;
  }

  for (const key of Object.keys(schema)) {
    const parserKey = schema[key];

    try {
      const val = parserKey(((obj as any)[key] || undefined) as unknown)
      Object.assign(obj as any, { [key]: val });
    } catch {
      return false;
    }
  }

  return true;
};

export const parseObject = <S extends Record<string, Parser> = Record<string, Parser>>(schema: S) => (obj: unknown): PObject<S> | undefined => {
  return isPObject(obj, schema) ? obj : undefined;
}

export const parseSafeObject = <S extends Record<string, Parser> = Record<string, Parser>>(schema: S) => (obj: unknown): PObject<S> => {
  if (isPObject(obj, schema)) {
    return obj;
  }

  throw new Error('invalid object');
}

// ======================== Array
interface PArrayBranch {
  readonly PArrayUnique: unique symbol;
};

type PArray<T extends Parser> = ReturnType<T>[] & PArrayBranch;

const isPArray = <T extends Parser>(obj: unknown): obj is PArray<T> => {
  if (!Array.isArray(obj)) {
    return false;
  }

  return true;
}

export const isType = <T>(obj: unknown): obj is T => !!obj;

export const parseArray = <S extends Parser>(schema: S) => (obj: unknown): PArray<S> | undefined => {
  if (isPArray<S>(obj)) {
    const newArr = obj.map<ReturnType<S> | undefined>(item => {
      try {
        return schema(item);
      } catch (err) {
        return undefined;
      }
    }).filter<ReturnType<S>>(item => isType<ReturnType<S>>(item));

    return newArr as PArray<S>;
  }

  return undefined;
}

export const parseSafeArray = <S extends Parser>(schema: S) => (obj: unknown): PArray<S> => {
  if (isPArray<S>(obj)) {
    const newArr = obj.map<ReturnType<S> | undefined>(item => {
      try {
        return schema(item);
      } catch (err) {
        throw new Error('invalid array');
      }
    }).filter<ReturnType<S>>(item => isType<ReturnType<S>>(item));

    return newArr as PArray<S>;
  }

  throw new Error('invalid array');
}

// ===================== Union
interface PUnionBranch {
  readonly PUnionUnique: unique symbol;
}

type PUnion<T extends Parser[]> = T & PUnionBranch;

const isPUnion = <T extends Parser[]>(obj: unknown, schemas: T): obj is PUnion<T> => {
  for (const parser of schemas) {
    try {
      if (parser(obj)) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

const parseUnion = <S extends Parser[]>(schemas: S) => (obj: unknown): PUnion<S> | undefined => {
  if (isPUnion<S>(obj, schemas)) {
    for (const parser of schemas) {
      try {
        const val = parser(obj);
        return val
      } catch (err) {
        continue;
      }
    }
  }

  return undefined;
}

const parseSafeUnion = <S extends Parser[]>(schemas: S) => (obj: unknown): PUnion<S> => {
  if (isPUnion<S>(obj, schemas)) {
    for (const parser of schemas) {
      try {
        const val = parser(obj);
        return val
      } catch (err) {
        continue;
      }
    }
  }

  throw new Error('invalid union');
}

// ===================== Literal
interface PLiteralBranch {
  readonly PLiteralUnique: unique symbol;
}

type ValueOf<O, V extends keyof O = keyof O> = O[V];

type PLiteral<T> = T & PLiteralBranch;

const isPLiteral = <T extends { readonly [key: string]: string }>(obj: unknown, constant: T): obj is PLiteral<T> => {
  if (typeof obj !== 'string') {
    return false;
  }

  for (const key of Object.keys(constant)) {
    if (constant[key] === obj) {
      return true;
    }
  }

  return false;
}

const parseLiteral = <T extends { readonly [key: string]: string }>(constant: T) => (obj: unknown): PLiteral<T> | undefined => {
  return isPLiteral<T>(obj, constant) ? obj : undefined;
}

const parseSafeLiteral = <T extends { readonly [key: string]: string }>(constant: T) => (obj: unknown): PLiteral<T> => {
  if (isPLiteral<T>(obj, constant)) {
    return obj;
  }

  throw new Error('invalid literal string');
}

// ==================== TypeScript

type PDataTypes = PString | PNumber | PBoolean | PObject<any> | PArray<any> | PUnion<any> | PLiteral<any>;

type InferBranchType<U extends PDataTypes> =
  U extends PString
  ? string
  : U extends PNumber
  ? number
  : U extends PBoolean
  ? boolean
  : U extends PObject<infer Schema>
  ? {
    [K in keyof Schema]: Schema[K] extends Parser ? InferType<Schema[K]> : never;
  }
  : U extends PArray<infer P>
  ? Array<InferType<P>>
  : U extends PUnion<infer SS>
  ? InferType<SS[number]>
  : U extends PLiteral<infer E>
  ? ValueOf<E>
  : never


type InferType<T extends Parser> =
  ReturnType<T> extends infer U
    ? undefined extends U
      ? U extends PDataTypes
        ? InferBranchType<U> | undefined
        : never
      : U extends PDataTypes
        ? InferBranchType<U>
        : never
    : never;

// ========================= Test
const JobType = {
  type1: 'type_1',
  type2: 'type_2',
} as const;

const parseJob = parseObject({
  id: parseSafeString(),
  uuid: parseString(),
  age: parseNumber(),
  archived: parseBoolean(),
  content: parseObject({
    msg: parseString(),
  }),
  arr: parseArray(parseObject({
    item_id: parseString(),
    item_content: parseObject({
      msg: parseString(),
    }),
    noti: parseArray(parseString()),
  })),
  metaData: parseUnion([
    parseString(),
    parseObject({
      year: parseNumber(),
      date: parseString(),
    }),
    parseArray(parseObject({
      style: parseString(),
    })),
  ]),
  type: parseLiteral(JobType)
});

const job1 = parseJob({
  id: 123,
  age: 123,
  archived: false,
  content: {
    msg: 'hello'
  },
  arr: [{
    item_id: 'item1',
    item_content: {
      msg: 'haha'
    },
    noti: ['a', 'b', 'c'],
  }],
  metaData: 'hi',
  type: 'type_2',
});

const job2 = parseJob({
  id: '123',
  age: 123,
  content: {
    msg: 'hello'
  },
  arr: [{
    item_id: 'item1',
    item_content: {
      msg: 'haha'
    },
    noti: ['a', 'b', 'c'],
  }],
  metaData: {
    year: 2023,
    date: '12-02',
  },
});

const job3 = parseJob({
  id: '123',
  age: 123,
  content: {
    msg: 'hello'
  },
  arr: [{
    item_id: 'item1',
    item_content: {
      msg: 'haha'
    },
    noti: ['a', 'b', 'c'],
  }],
  metaData: [{
    style: 'color: red',
  }],
});

type Job = InferType<typeof parseJob>;

console.log(parseJob(job1));
console.log(parseJob(job2));
console.log(parseJob(job3));
