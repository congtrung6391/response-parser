Example

```ts
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
```
