# マイグレーション

## > 1.7.0

マイグレーション作業が必要な条件

- 1.7.0より低いバーションから、1.7.0以上へのアップグレード
- MySQL/MongoDBを使っている
- 既存の管理ユーザが存在する

### 変更点内容

admin_users.auth_type カラム(Required)が追加されました。
これにより、既存の管理ユーザへの認証タイプ情報の更新が必須になります。

手動で既存管理ユーザデータへ`update`を発行してください。

認証タイプ
- `google`
- `email`

> ドキュメント
> [https://github.com/cam-inc/node-vironlib/blob/master/admin_user/README.md](https://github.com/cam-inc/node-vironlib/blob/master/admin_user/README.md)
> 参考コード
> MySQL : [https://github.com/cam-inc/node-vironlib/blob/master/stores/mysql/models/admin_users.js](https://github.com/cam-inc/node-vironlib/blob/master/stores/mysql/models/admin_users.js)
> MongoDB : [https://github.com/cam-inc/node-vironlib/blob/master/stores/mongodb/models/admin_users.js](https://github.com/cam-inc/node-vironlib/blob/master/stores/mongodb/models/admin_users.js)

### 手動でカラム追加を行う場合

Sequelize には、CLIを利用したマイグレーションが提供されていますので、アップグレード作業中に手動で実行することが可能です。
[https://sequelize.org/master/manual/migrations.html](https://sequelize.org/master/manual/migrations.html)

----
