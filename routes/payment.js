const router = require("express").Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
console.log("KEY_ID:", process.env.KEY_ID);
console.log("KEY_SECRET:", process.env.KEY_SECRET);


router.post("/create-order", async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });

    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };
    instance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ messege: "Something went wrong!" });
      }
      return res.status(200).json({ data: order });
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/verify-order", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(sign.toString())
      .digest("hex");
    if (razorpay_signature === expectedSign) {
      res.status(200).json({ messege: "Payment verified successfully" });
    } else {
      res.status(500).json({ messege: "Internal Server Error!" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
