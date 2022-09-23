# Shopify New Order Alert

Notifies about new orders with a bell sound and visual indication.

The app is serverless, it uses spring animations and webhooks.


## Technical info

Required permissions Shopify: read_orders, read_customers.

Deploy:
```bash
vercel --prod
```

Create Shopify webhook with:
```webhook
mutation ($url: URL!) {
  webhookSubscriptionCreate(
    topic: ORDERS_CREATE
    webhookSubscription: {
      format: JSON,
      callbackUrl: $url
      includeFields: [
        "id",
        "name",
        "test",
        "customer",
        "total_price",
        "processed_at",
        "financial_status"
      ]}
  ) {
    userErrors {
      field
      message
    }
    webhookSubscription {
      id
    }
  }
}
```
