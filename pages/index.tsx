import type { NextPage } from 'next';
import Shopify from '@shopify/shopify-api';
import React, { useEffect } from 'react';
import Pusher from 'pusher-js';

type HomePageProps = {
  orders: Array<Order>
}

function getRandomId() {
  return String(Math.floor(Math.random() * 10000));
}

const Home: NextPage<HomePageProps> = ({ orders }) => {
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

      setOrdersState((currentOrdersState) => [newOrder, ...currentOrdersState]);
    });
  }

  useEffect(() => {socketInitializer()}, []);

  return (
      <div>

        <div className="container">

          <div className="columns is-multiline mt-3">
            {ordersState.map((order) => (
              <div
                key={order.id}
                className="column is-full"
              >
                <div className="box">
                  <div className="columns has-text-centered">
                    <div className="column">{order.name}</div>
                    <div className="column">{order.customerName}</div>
                    <div className="column">{order.price}</div>
                    <div className="column">{order.processedAt}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

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
      orders(first: 30, reverse: true) {
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

export async function getServerSideProps() {
  const orders = await getOrderData();

  return { props: { orders } }
}

export default Home
