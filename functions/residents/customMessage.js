export function main(event, context, callback) {
  console.log("custom message handler triggered", event)
  if (event.triggerSource === "CustomMessage_SignUp") {
    // Ensure that your message contains event.request.codeParameter. This is the placeholder for code that will be sent
    const { codeParameter } = event.request
    const { userName, region } = event
    const { clientId } = event.callerContext
    const { email } = event.request.userAttributes

    const url = 'http://apt-client-resident.s3-website.us-east-2.amazonaws.com/resident/initial-password-setup'
    const link = `<a href="${url}?code=${codeParameter}&username=${userName}&clientId=${clientId}&region=${region}&email=${email}" target="_blank">here</a>`
    event.response.emailSubject = "Welcome to Savoy Apartment. Please setup the account"; // event.request.codeParameter
    event.response.emailMessage = `<p>Thank you for signing up. 
    Click ${link} to verify your email and change password.</p>
    <p>Please use temporary password you received from the office.</p>
    <p>Thank you,</p><p>Savoy</p>`
  }
  callback(null, event)

}


/*

http://localhost:3001/resident/initial-password-setup
?code=853009
&username=d0d1cfaf-3b63-4449-8777-fbfc9083c208
&clientId=8s72qccqdrvlekacimtuol1kl
&region=us-east-2
&email=sdymj84@gmail.com

*/