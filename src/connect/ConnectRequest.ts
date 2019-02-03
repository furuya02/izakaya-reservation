
// Amazon Connectのリクエストの型定義
export default interface ConectRequest {
    Details: {
      ContactData: {
        Attributes: {},
        Channel: string,
        ContactId: string,
        CustomerEndpoint: {
          Address: string,
          Type: string
        },
        InitialContactId: string,
        InitiationMethod: string,
        InstanceARN: string,
        MediaStreams: {
          Customer: {
              Audio: string|null
          }
        },
        PreviousContactId: string,
        Queue: string|null,
        SystemEndpoint: {
          Address: string,
          Type: string
        }
      }
      Parameters: {
        inputData: string,
        reserve: string
      }
    }
  }
  