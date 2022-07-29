import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<null>
) {
  console.log(req.body);

  res.send(null);
}
