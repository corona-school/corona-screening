import Koa from "koa";
import Router from "koa-router";
import koaBody from "koa-body";
import session from "koa-session";
import redisStore from "koa-redis";
import passport from "koa-passport";

import cors from "@koa/cors";
import dotenv from "dotenv";
dotenv.config();
import { sequelize } from "./database";
import screeningRouter from "./controller/screeningController";

const app = new Koa();
app.use(koaBody());
app.use(cors());

// sessions
app.keys = [process.env.COOKIE_SESSION_SECRET];
app.use(
	session(
		{
			renew: true,
			store: redisStore({})
		},
		app
	)
);

// authentication
require("./auth");
app.use(passport.initialize());
app.use(passport.session());

const router = new Router();
const PORT = process.env.PORT || 3000;

router.get("/", async ctx => {
	ctx.body = "Hello World";
});

app
	.use(router.routes())
	.use(screeningRouter.routes())
	.use(router.allowedMethods());

sequelize
	.sync()
	.then(() => {
		app.listen(PORT);
		console.log(`Server listening on ${PORT}`);
	})
	.catch(err => {
		console.error(err);
	});
