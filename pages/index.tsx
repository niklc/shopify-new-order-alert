import type { GetServerSideProps, NextPage } from 'next';
import Shopify from '@shopify/shopify-api';
import React, { useEffect } from 'react';
import Pusher from 'pusher-js';
import moment from 'moment';

const ORDER_LIMIT = 15;

type DashboardPageProps = {
  orders: Order[]
}

function getRandomId() {
  return String(Math.floor(Math.random() * 10000));
}

function limitOrderCount(orders: Order[]) {
  return orders.length > ORDER_LIMIT
    ? orders.slice(0, ORDER_LIMIT)
    : orders;
}

function formatDate(date: string) {
  return moment(date).fromNow();
}

function getColorCodeFromDate(date: string) {
  const dateLastWeek = moment().subtract(1, 'weeks');
  const dateNow = moment();
  const minutesSinceLastWeek = dateNow.diff(dateLastWeek, 'minutes');
  const minutesOrder = dateNow.diff(moment(date), 'minutes');

  const orderPercentElapsedSinceWeek = minutesOrder / minutesSinceLastWeek;

  const elapsedSinceNowInWeek = orderPercentElapsedSinceWeek < 1
    ? Math.abs(orderPercentElapsedSinceWeek - 1) 
    : 0;

  const valueMinimum = 99;
  const valueMaximum = 85;
  const valueRange = valueMaximum - valueMinimum;

  const appliedValueRange = valueRange * elapsedSinceNowInWeek;

  return valueMinimum + appliedValueRange;
}

const DashboardPage: NextPage<DashboardPageProps> = ({ orders }) => {
  const [ordersState, setOrdersState] = React.useState(orders);

  const socketInitializer = async () => {
    const pusher = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
      { cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER }
    );

    const channel = pusher.subscribe('default');
    channel.bind('order-created', function(order: Order) {
      const randomId = getRandomId();

      const newOrder = order;
      newOrder.id = randomId;
      newOrder.name = randomId;

      setOrdersState((currentOrdersState) => limitOrderCount([newOrder, ...currentOrdersState]));

      ringBell();
    });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {socketInitializer()}, []);

  function ringBell() {
    const audio = document.getElementById('bell') as HTMLMediaElement;

    audio.play();
  }

  const [time, setTime] = React.useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <audio
        id='bell'
        src='/bronze-bell.mp3'
      />

      <div className="container">
        <div className="columns is-multiline mt-3">
          {ordersState.map((order) => (
            <div
              key={order.id}
              className="column is-full"
            >
              <div className="box" style={{backgroundColor: `hsl(75, 85%, ${getColorCodeFromDate(order.processedAt)}%)`}}>
                <div className="columns is-mobile has-text-centered">
                  <div className="column">{order.name}</div>
                  <div className="column">{order.customerName}</div>
                  <div className="column">{order.price}</div>
                  <div className="column">{formatDate(order.processedAt)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        html {
            overflow: hidden;
        }
      `}</style>
    </div>
  )
}

type OrderResponse = {
  data: {
    orders: {
      edges: [
        {
          node: {
            id: string,
            name: string,
            test: boolean,
            customer: {
              displayName: string
            },
            totalPriceSet: {
              shopMoney: {
                amount: string
              }
            },
            processedAt: string,
            displayFinancialStatus: string
          }
        }
      ]
    }
  }
}

type Order = {
  id: string,
  name: string,
  isTest: boolean,
  customerName: string,
  price: number,
  processedAt: string,
  financialStatus: string
}

async function getOrderData(): Promise<Array<Order>> {
  const client = new Shopify.Clients.Graphql(
    process.env.SHOP_URL as string,
    process.env.SHOP_API_SECRET_KEY
  );
  const responseData: OrderResponse = await client.query({
    data: `{
      orders(first: ${ORDER_LIMIT}, reverse: true) {
        edges {
          node {
            id
            name
            test
            customer {
                displayName
            }
            totalPriceSet {
                shopMoney {
                    amount
                }
            }
            processedAt
            displayFinancialStatus
          }
        }
      }
    }`,
  })
  .then((data) => data.body) as OrderResponse;

  const orders = responseData.data.orders.edges.map((edge: any) => {
    const node = edge.node;
    return {
      id: node.id,
      name: node.name,
      isTest: node.test,
      customerName: node.customer.displayName,
      price: Number(node.totalPriceSet.shopMoney.amount),
      processedAt: node.processedAt,
      financialStatus: node.displayFinancialStatus
    }
  });

  return orders;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const authHeader = context.req.cookies['key'];
  if (typeof authHeader == 'undefined' || authHeader !== process.env.AUTH_KEY) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  const orders = await getOrderData();

  return { props: { orders } }
}

export default DashboardPage;
