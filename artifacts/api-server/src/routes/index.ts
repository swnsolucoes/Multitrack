import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import catalogRouter from "./catalog";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import downloadsRouter from "./downloads";
import subscriptionsRouter from "./subscriptions";
import creditsRouter from "./credits";
import rateiosRouter from "./rateios";
import wishlistRouter from "./wishlist";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(catalogRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(downloadsRouter);
router.use(subscriptionsRouter);
router.use(creditsRouter);
router.use(rateiosRouter);
router.use(wishlistRouter);
router.use(adminRouter);

export default router;
