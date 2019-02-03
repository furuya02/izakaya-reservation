// ****************************************
// 予約クラス
// ****************************************

// ショートメール
import SNS from './SNS';

// 次のアクション
enum Next {
    Input_1 = 'input_1', // 1桁のカスタマー入力
    Input_4 = 'input_4', // 4桁のカスタマー入力
    Finish = 'finish', // アナウンスして終了
}

export default class Reserve {

    private _mode: number = 0; // 0:Welcome 1:Date 2:Time 3:Customers 4:Confirm
    private _numberOfPeople: number = 0;
    private _month: number = 0;
    private _day: number = 0;
    private _hour: number = 0;
    private _min: number = 0;

    private _phoneNumber: string = '';
    next: Next;
      
    // コンタクトフローに以前のデータが有る場合は、内部データを復元する
    constructor(data: string, phoneNumber: string) {
      
      this._phoneNumber = phoneNumber;

      if(data) {
        const tmp = JSON.parse(data);
        
        this._mode = tmp.mode;
        this._numberOfPeople = tmp.numberOfPeople;
        this._month = tmp.month;
        this._day = tmp.day;
        this._hour = tmp.hour;
        this._min = tmp.min;
      }
    }
  
    // コンタクトフローに保存するために、内部データをテキスト化する
    get exportData() {
      const tmp = {
        mode: this._mode,
        numberOfPeople: this._numberOfPeople,
        month: this._month,
        day: this._day,
        hour: this._hour,
        min: this._min,
      }
      return JSON.stringify(tmp);
    }
  
    private _welcomeMessage(): string {
      let message = '<break time="2s"/>お電話ありがとうございます。<p/>';
      message += '居酒屋クラメソ札幌南口店の電話予約システムです<p/>';
      return message;
    }
  
    private _dateMessage(): string {
      this.next = Next.Input_4;
      let message = '本日のご予約をご希望の場合は、1とシャープを<p/>';
      message += '明日以降のご予約をご希望の場合は、4桁の数字、たとえば、2月1日の場合は、ゼロ・ニー・ゼロ・イチと入力して下さい<p/>';
      return message;
    }
    
    private _timeMessage(): string {
      this.next = Next.Input_4;
      return 'ご希望の時間を4桁の数字で入力して下さい。<p/>たとえば、7時からの場合は、イチ・キュー・ゼロ・ゼロと入力して下さい。<p/>';
    }
  
    private _numberOfPeopleMessage(): string{
      this.next = Next.Input_1;
      return 'ご来店の人数を入力して下さい。<p/>';
    }
  
  
    private _goodbyMessage(): string{
      this.next = Next.Finish;
      let message = 'ご予約を承りました。<p/>';
      message += '予約の内容は、ショートメッセージでお送りさせて頂きました。<p/>';
      message += 'ご来店をお待ちしております。<p/>';
      return message;
    }
  
    private _againMessage() {
      return 'もう一度、最初からお伺いします。<p/>';
    }
  
    private _confirmMessage() {
      this.next = Next.Input_1;
      let message = 'ご予約は<p/>';
      message += this._month + '月';
      message += this._day + '日<p/>';
      message += this._hour + '時'
      if(this._min!=0){
        message += this._min + '分';
      }
      message += 'から<p/>';
      message += this._numberOfPeople +'名様<p/>';
      message += 'で宜しかったでしょうか<p/>';
      message += 'よろしければ1を<p/>最初からやり直す場合はゼロを<p/>入力して下さい。';
      return message;
    }

    private _dateStr(){
      const hour = ('00' + this._hour).slice(-2);
      const min = ('00' + this._min).slice(-2);
      return this._month + '月' + this._day + '日 ' + hour + ':' + min + ' \n';
    }
  
    // 入力を処理して、メッセージを生成する
    async input(inputData: string): Promise<string> {
      let message = '<speak>';
      let errorMessage = undefined;
  
      switch(this._mode) {
        case 0: //Welcome
          message += this._welcomeMessage();
          message += this._dateMessage();
          this._mode++;
          break;
        case 1: // SetDate
          errorMessage = this.setDate(inputData);
          if(errorMessage) {
            // 入力エラーなので、もう一度
            message += errorMessage + this._dateMessage();
          } else {
            message += this._timeMessage();
            this._mode++;
          }
          break;
        case 2 : // SetTime
          errorMessage = this.setTime(inputData);
          if(errorMessage) {
            // 入力エラーなので、もう一度
            message += errorMessage + this._timeMessage();
          } else {
            message += this._numberOfPeopleMessage();
            this._mode++;
          }
          break;
        case 3 : // SetNumberOfPeople
          errorMessage = this.setNumberOfPeople(inputData);
          if(errorMessage) {
            // 入力エラーなので、もう一度
            message += errorMessage + this._numberOfPeopleMessage();
          } else {
            message += this._confirmMessage();
            this._mode++;
          }
          break;
        case 4 : // Confirm
          if(inputData != '1') {
            // 最初から
            message += this._againMessage() + this._dateMessage();
            this._mode = 1; //SetDate
          } else {
            // 終了

            // ショートメール送信
            const sns = new SNS();
            let body = '[予約メール確認]\n';
            body += '下記の内容でご予約を承りました。\n';
            body += '日時:' + this._dateStr() + ' \n';
            body += this._numberOfPeople + '名様\n';
            body += '居酒屋クラメソ\n';
            body += '札幌南口店 001-xxx-xxxx\n';
            await sns.send(this._phoneNumber, body);

            message += this._goodbyMessage();
          }
          break;
      }
      message += '</speak>';
      return message;
    }
  
    // 以下、データの設定（軽易なバリデーションのみ）
  
    setDate(inputData: string): string|undefined {
      
      let errorMessage = '日付の入力が無効です。もう一度、お伺いします<p/>'
  
      if(inputData == '1'){
        const dt = new Date();
        // 正常値なので保存
        this._month = dt.getMonth() + 1
        this._day = dt.getDate();
        return undefined;
      } else {
        try{
          if(inputData.length == 4) {
            const month = Number(inputData.slice(0,2)); 
            const day = Number(inputData.slice(2,4)); 
            if(1 <= month && month <=12 && 1 <= day && day <=31) {
              // 正常値なので保存
              this._month = month;
              this._day = day;
              return undefined; 
            } 
          }
        } catch (error) {
        }
      }
      return errorMessage;
    }
  
    setTime(inputData: string): string|undefined {
      let errorMessage = '時間の入力が無効です。もう一度、お伺いします<p/>';
      try{
        if(inputData.length == 4) {
          const hour = Number(inputData.slice(0,2)); 
          const min = Number(inputData.slice(2,4)); 
          if( 0 <= min && min < 60) {
            if(18 <= hour && hour <= 23) {
              if(min == 0 || min == 30){
                // 正常値なので保存
                this._hour = hour;
                this._min = min;
                return undefined; 
              }
              return '予約可能な時間は30分単位です。もう一度、お伺いします<p/>'
            } else {
              return '予約が可能な時間は18時から23時までです。もう一度、お伺いします<p/>'
            }
          }
        }
      } catch (error) {
      }
      return errorMessage;
    }
  
    setNumberOfPeople(inputData: string): string|undefined {
      let errorMessage = '人数の入力が無効です。もう一度、お伺いします<p/>';
      try{
        const numberOfPeople = Number(inputData);
        if(1 <= numberOfPeople && numberOfPeople < 10){
          this._numberOfPeople = numberOfPeople;
          return undefined;
        }
      }catch(error){
  
      }
      return errorMessage;
    }
  }
  