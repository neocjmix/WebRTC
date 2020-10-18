const AWS = require('aws-sdk');

exports.handler = async (event) => {
  const from = event.requestContext.connectionId;
  const endpoint = `${event.requestContext.domainName}/${event.requestContext.stage}`;

  if(event.body){
    const {connectionId, message} = JSON.parse(event.body);
    await new AWS
      .ApiGatewayManagementApi({ endpoint })
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({ message, from }),
      })
      .promise();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ connectionId : from }),
  };
};
