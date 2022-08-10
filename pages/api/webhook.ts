import type { NextApiRequest, NextApiResponse } from 'next';
import Pusher from 'pusher';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<null>
) {
  if (req.method === 'POST') {
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID as string,
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
      secret: process.env.PUSHER_APP_SECRET as string,
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER as string,
      useTLS: true
    });

    const formatedOrder = {
      id: req.body.id,
      name: req.body.id,
      isTest: req.body.test,
      customerName: `${req.body.customer.first_name} ${req.body.customer.last_name}`,
      price: Number(req.body.total_price),
      processedAt: req.body.processed_at,
      financialStatus: req.body.financial_status
    }
    
    await pusher.trigger('default', 'order-created', formatedOrder);
  }

  res.send(null);
}
