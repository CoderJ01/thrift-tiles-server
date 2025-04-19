// Express.js
const router = require('express').Router();

// other Node.js packages
const paypal = require('paypal-rest-sdk');

// payment configuration
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_SECRET_KEY
});

router.post('/checkout', (req, res) => {
    let items = [];

    // variables 'name', 'sku', etc. are needed for the PayPal payment json
    for(let i = 0; i < req.body.items.length; i++) {
        items[i] = {
            "name": req.body.items[i].name,
            "sku": req.body.items[i].id,
            // for live environment, replace 0 with req.body.items[i].cost 
            "price": 0,
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
          "return_url": `${process.env.BACKEND_URL}/success`,
          "cancel_url": `${process.env.BACKEND_URL}/cancel`
      },
      "transactions": [{
          "item_list": {
              "items": items
          },
          "amount": {
              "currency": "USD",
              "total": 0 // use req.body.total in live environment
          },
          "description": "Items for Thrift Tiles customer"
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
                    "total": 0 // use req.body.total in live environment 
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
                // res.redirect(payment.links[i].href); // res.redirect does not work due to some CORS related issue
                res.send({ link: payment.links[i].href });
              }
            }
        }
    });
});
router.get('/cancel', (req, res) => res.send('Cancelled'));

module.exports = router;
