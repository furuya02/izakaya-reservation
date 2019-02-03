import Reserve from './Reserve';
import ConnectRequest from './ConnectRequest';

declare var exports: any;
exports.handle = async (event: ConnectRequest) => {

  console.log(JSON.stringify(event));

  const phoneNumber = event.Details.ContactData.CustomerEndpoint.Address; // 顧客の発信番号
  const params = event.Details.Parameters; // 入力パラメータ

  const reserve = new Reserve(params.reserve, phoneNumber); // 予約クラスの生成（前回エクスポートしたデータで初期化する）
  const message = await reserve.input(params.inputData); // inputDataを処理する

  return {
    reserve: reserve.exportData, // データのエクスポート
    next: reserve.next, // 次のアクション
    message: message // 再生するメッセージ
  };
}
