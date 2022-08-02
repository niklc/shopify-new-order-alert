import type { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<null>
) {
  let io = res.socket.server.io;
  if (!io) {
    io = new Server(res.socket.server);
    res.socket.server.io = io;
  }

  if (req.method === 'POST') {
    console.log(req.body);

    io.emit('order-created', req.body)
  }

  res.send(null);
}
