import type { MedusaRequest, MedusaResponse} from "@medusajs/medusa";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const sendgridService = req.scope.resolve("sendgridService");
    const sendOptions = req.body;
    await sendgridService.sendEmail(sendOptions); 
    res.json(sendOptions); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" }); 
  }
};


