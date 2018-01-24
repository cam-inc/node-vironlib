const helper = require('./helper');

/**
 * HTTP Response Error インスタンス生成
 * @param httpCode HTTP Response Code
 * @param kind 種別
 * @param number 連番
 * @param name エラー名
 * @param message エラーメッセージ
 * @param detail 詳細
 * @returns {Error}
 */
const genError = (httpCode, kind, number, name, message, detail) => {
  return helper.genError('F', httpCode, kind, number, name, message, detail);
};

module.exports = {
  /**
   * HTTPリクエストエラー全般に使用する。
   */
  BadRequest: () => genError(400, '0000', '0000', 'BadRequest', 'Bad Request'),
  /**
   * HTTPリクエストのクエリーエラー全般に使用する
   */
  InvalidRequestQuery: () => genError(400, '0000', '0001', 'InvalidRequestQuery', 'Invalid Request Query'),
  /**
   * HTTPリクエストの Credentials エラー全般に使用する
   */
  RequiredCredentials: () => genError(400, '0000', '0002', 'RequiredCredentials', 'Required Credentials'),
  /**
   * 認証失敗エラー全般に使用する。
   */
  Unauthorized: () => genError(401, '0000', '0003', 'Unauthorized', 'Unauthorized'),
  /**
   * パーミッションエラー全般に使用する。
   */
  Forbidden: () => genError(403, '0000', '0004', 'Forbidden', 'Forbidden'),
  /**
   * Not Found
   */
  NotFound: () => genError(404, '0000', '0005', 'NotFound', 'Not Found'),
  /**
   * HTTPリクエストのサイズエラー全般に使用する。
   */
  PayloadTooLarge: () => genError(413, '0000', '0006', 'PayloadTooLarge', 'Payload Too Large'),
  /**
   * アカウント停止エラー全般に使用する。
   */
  UnavailableForLegalReasons: () => genError(451, '0000', '0007', 'UnavailableForLegalReasons', 'Unavailable for Legal Reasons'),
  /**
   * バリデーションエラー
   */
  ValidationFailure: detail => genError(400, '0000', '0008', 'ValidationFailure', 'Validation Failure', detail),
  /**
   * サインイン失敗
   */
  SigninFailed: () => genError(400, '0001', '0000', 'SigninFailed', 'Signin Failed'),
  /**
   * Admin User Not Found
   */
  AdminUserNotFound: () => genError(404, '0001', '0001', 'AdminUserNotFound', 'Admin User Not Found'),
  /**
   * Currently Used Admin Role
   */
  CurrentlyUsedAdminRole: () => genError(400, '0001', '0002', 'CurrentlyUsedAdminRole', 'Currently Used Admin Role'),
  /**
   * Already Used Role ID
   */
  AlreadyUsedRoleID: () => genError(400, '0001', '0003', 'AlreadyUsedRoleID', 'Already Used Role ID'),
};
