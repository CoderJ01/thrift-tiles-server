// Express.js
const router = require('express').Router();

// other Node.js packages
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_SECRET_KEY
});

router.post('/purchase', (req, res) => {
    let items = [];

    for(let i = 0; i < req.body.items.length; i++) {
        items[i] = {
            "name": req.body.items[i].name,
            "sku": req.body.items[i].id,
            "price": req.body.items[i].cost,
            "currency": "USD",
            "quantity": req.body.items[i].amount
        }
    }
  
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:3001/success",
          "cancel_url": "http://localhost:3001/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": items
          },
          "amount": {
              "currency": "USD",
              "total": req.body.total
          },
          "description": "Hat for the best team ever"
      }]
  };

    router.get('/success', (req, res) => {
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
    
        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": req.body.total
            }}]
        };
  
        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                console.log(JSON.stringify(payment));
                res.send('Success');
            }
        });
    });
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i = 0;i < payment.links.length;i++){
              if(payment.links[i].rel === 'approval_url'){
                res.redirect(payment.links[i].href);
              }
            }
        }
    });
});
router.get('/cancel', (req, res) => res.send('Cancelled'));

module.exports = router;
