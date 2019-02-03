import AWS = require("aws-sdk");

export default class SNS {
    // 東京リージョンが一番安定して送信できる
    private _sns = new AWS.SNS({ apiVersion: '2010-03-31', region: 'ap-northeast-1'} );
    
    async send(phoneNumber: string, message: string) {

        const params = {
            Message: message,
            PhoneNumber: phoneNumber
        };
        return await this._sns.publish(params).promise();
    }
}
