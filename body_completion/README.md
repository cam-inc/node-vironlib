# body_completion

## Features

- Middlewares
  - Fill null or `x-completion-value` in undefined POST data.


## Configure

```
const vironlib = new VironLib({auth: {...}});
```

| property name | type | required | description |
| ------------- | ---- | -------- | ----------- |
| body_completion | Object | no | VironからPOST(PUT)されなかったデータを特定の値で補完するためのミドルウェア |
| body_completion.exclude_paths | Array<String> | no | 補完から除外するパス |


## OAS(ParameterObject)

```
{
  "type": "string",
  "required": false,
  "x-completion-value": "-"
}
```

When "required: false", Viron can post a undefined value.
Then `body-completion` fill `-` to this column.
