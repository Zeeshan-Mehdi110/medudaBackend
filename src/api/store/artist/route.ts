import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const productService = req.scope.resolve("productService");
  const { attribute_id } = req.body
  const selector = {
    attributes: [attribute_id], // Specify the attribute ID
    int_attributes: {}, // If you have any integer attributes, you can specify them here
  };
  productService.listAndCount(selector)
    .then(([products, count]) => {
      res.json(products)
    })
    .catch((error) => {
      console.error('Error fetching products:', error);
    });
};


