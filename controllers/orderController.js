const Order = require("../models/order");
const Product = require("../models/product");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// Create a new order   =>  /api/v1/order/new
exports.newOrder = async (req, res, next) => {
  try {
    const newOrder = await Order.create({
      ...req.body,
      user: req.body.user,
    });
    // const order = await newOrder.save();
    res.status(201).send(newOrder);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Get single order   =>   /api/v1/order/:id
exports.getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ErrorHandler("product not found", 404));
    }
    res.json({
      order,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

// Get logged in user orders   =>   /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  // console.log("req is", req.user._id);
  // console.log("red body", req.body);
  const orders = await Order.find({ user: req.body.id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// Get all orders - ADMIN  =>   /api/v1/admin/orders/
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
  const orderCount = await Order.countDocuments();
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    orderCount,
    totalAmount,
    orders,
  });
});

// Update / Process order - ADMIN  =>   /api/v1/admin/order/:id
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  console.log("body", req.body);
  console.log("id", req.params.id);
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("order not found", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  order.orderItems.forEach(async (item) => {
    await updateStock(item.product, item.quantity);
  });

  (order.orderStatus = req.body.status), (order.deliveredAt = Date.now());

  await order.save();

  res.status(200).json({
    success: true,
    message: `${req.params.id} this order successfully deliverd now`,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}

// Delete order   =>   /api/v1/admin/order/:id
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});
