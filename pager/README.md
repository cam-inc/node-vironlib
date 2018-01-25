# pager

## Features

- Helpers
  - Set response headers for pagination


## Configure

```
const vironlib = new VironLib({pager: {...}});
```

| property name | type | required | description |
| ------------- | ---- | -------- | ----------- |
| pager | Object | no | ページャー用ヘルパー関数 |
| pager.limit | Number | yes | 1ページあたりの件数 |
