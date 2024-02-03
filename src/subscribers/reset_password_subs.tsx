import {
    CustomerService,
    SubscriberArgs,
    SubscriberConfig,
  } from "@medusajs/medusa";
  import Medusa from "@medusajs/medusa-js"

  type PasswordResetEvent = {
    email: string;
    id:string,
    first_name:string,
    last_name:string,
    token:string
  };




  export default async function resetPasswordHandler({
    data,
    eventName,
    container,
  }: SubscriberArgs<PasswordResetEvent>) {
   

    const {  
      id,
      email,
      first_name,
      last_name,
      token 
     } = data

    if (email && id ) {
      const sendOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: process.env.SENDGRID_CUSTOMER_PASSWORD_RESET_ID,
          from: "pixelsjourney.info@gmail.com",
          to: email,
          dynamic_template_data: {
            first_name: first_name,
            last_name: last_name,
            id: id,
            token: token,
          },
        }),
      };
    
      fetch('https://medudabackend-production.up.railway.app/store/custom/email', sendOptions)
        .then(response => response.json())
        .then(data => console.log('Email sent successfully:', data))
        .catch((error) => console.error('Error sending email:', error));
    }
 
  }

  export const config: SubscriberConfig = {
    event: CustomerService.Events.PASSWORD_RESET,
    
  };