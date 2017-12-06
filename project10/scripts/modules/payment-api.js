/*
Copyright 2016 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import sendToServer from 'merchant-server';

const SHIPPING_OPTIONS = {
  us: [
    {
      id: 'standard',
      label: 'Standard Shipping',
      price: 0
    },
    {
      id: 'express',
      label: 'Express Shipping',
      price: 10
    }
  ],
  international: [
    {
      id: 'international',
      label: 'International Shipping',
      price: 15
    }
  ]
};

export default class PaymentAPIWrapper {

  /*
  * Given a cart set up with an order, gets payment authorization.
  * Returns a promise that resolves when payment is complete, this
  * has a data object you can pass to the back-end payment server.
  */
  checkout(cart) {
    let request = this.buildPaymentRequest(cart);
    let response;
    // Show UI then continue with user payment info

    // TODO Android PAY 7.1 - display the PaymentRequest
     return request.show()
      .then(r => {
        // The UI will show a spinner to the user until
        // `request.complete()` is called.
        response = r;
        let data = r.toJSON();
        console.log(data);
        return data;
      })
      .then(data => {
        return sendToServer(data);
      })
      .then(() => {
        response.complete('success');
      })
      .catch(e => {
        response.complete('fail');
        console.error(e);
      });
    return request.show();

  }

  /*
   * Creates a PaymentRequest object including the event handlers used to
   * update the payment details as the user makes choices.
   */
  buildPaymentRequest(cart) {
    // Supported payment instruments
    const supportedInstruments = [

      // TODO Android PAY 4.1 - add support for Android Pay
      {
    supportedMethods: ['https://android.com/pay'],
    data: {
      environment: 'TEST',
      // Credit Cards allowed via Android Pay
      allowedCardNetworks: ['AMEX', 'MASTERCARD', 'VISA', 'DISCOVER'],
      paymentMethodTokenizationParameters: {
        tokenizationType: 'NETWORK_TOKEN',
        parameters: {
          'publicKey': 'BC9u7amr4kFD8qsdxnEfWV7RPDR9v4gLLkx3jfyaGOvxBoEuLZKE0Tt5O/2jMMxJ9axHpAZD2Jhi4E74nqxr944=',
        }
      }
    }
  },

      // TODO Android PAY 5.1 - add support for Basic-card
          {
      supportedMethods: ['basic-card'],
      data: {
        supportedNetworks: ['visa', 'mastercard', 'amex',
          'jcb', 'diners', 'discover', 'mir', 'unionpay']
      }
    }

    ];

    // Payment options
    const paymentOptions = {

      // TODO Android PAY 8.1 - allow shipping options

      // TODO Android PAY 10.1 - Add payment options


    };

    let shippingOptions = [];
    let selectedOption = null;

    let details = this.buildPaymentDetails(cart, shippingOptions, selectedOption);

    // TODO Android PAY 3.2 - initialize the PaymentRequest object
    let request = new PaymentRequest(supportedInstruments, details, paymentOptions);

    // TODO Android PAY 9.1 - add `shippingaddresschange` event handler

    // TODO Android PAY 9.2 - add `shippingoptionchange` event handler

    return request;
  }

  /*
   * Creates the PaymentDetails dictionary inside the PaymentRequest.
   * This can change as the user selects shipping options.
   */
  buildPaymentDetails(cart, shippingOptions, shippingOptionId) {

    // TODO Android PAY 6.1 - define the display items
    let displayItems = cart.cart.map(item => {
  return {
    label: `${item.sku}: ${item.quantity}x $${item.price}`,
    amount: {currency: 'USD', value: String(item.total)}
  };
});

    

    let total = cart.total;

    // TODO Android PAY 8.3 - allow shipping options

    let details = {
      displayItems: displayItems,
      total: {
        label: 'Total due',
        amount: {currency: 'USD', value: String(total)}
      }
      // TODO Android PAY 8.2 - allow shipping options
    };

    return details;
  }

  /*
   * Utility function to extract the correct shipping options for a country.
   */
  optionsForCountry(country) {
    country = country.toLowerCase();
    if (!country || !SHIPPING_OPTIONS.hasOwnProperty(country)) {
      country = 'international';
    }
    let options = SHIPPING_OPTIONS[country];
    // Sort by price, lowest first
    options.sort((a, b) => {
      return a.price - b.price;
    });
    return options;
  }

}
