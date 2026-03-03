const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize razorpay instance
const initRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourKeySecretHere',
  });
};

exports.createOrder = async (req, res) => {
  try {
    const instance = initRazorpay();
    const { amount, currency } = req.body; // Amount is always going to be provided from frontend in rupees

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: currency || "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'YourKeySecretHere');
    
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature) {
      return res.status(400).json({ msg: "Transaction not legit!" });
    }

    res.json({
      msg: "success",
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
