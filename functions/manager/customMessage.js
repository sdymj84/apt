import { success, failure } from "../../libs/response-lib";

export function main(event, context, callback) {
  console.log("custom message handler triggered", event)
  /* if (event.triggerSource === "CustomMessage_SignUp") {
    // Ensure that your message contains event.request.codeParameter. This is the placeholder for code that will be sent
    const { codeParameter } = event.request
    const { userName, region } = event
    const { clientId } = event.callerContext
    const { email } = event.request.userAttributes
    const url = 'https://example.com/api/confirmSignup'
    const link = `<a href="${url}?code=${codeParameter}&username=${userName}&clientId=${clientId}&region=${region}&email=${email}" target="_blank">here</a>`
    event.response.emailSubject = "Your verification link"; // event.request.codeParameter
    event.response.emailMessage = `Thank you for signing up. Click ${link} to verify your email.`;
  } */

  callback(null, event)
}
