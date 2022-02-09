import { Shopify } from "@shopify/shopify-api";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SHOPIFY_API_SCOPES,
  HOST_NAME,
  SHOPIFY_STORE_URL,
} = process.env;

Shopify.Context.initialize({
  API_KEY: SHOPIFY_API_KEY,
  API_SECRET_KEY: SHOPIFY_API_SECRET,
  SCOPES: [SHOPIFY_API_SCOPES],
  HOST_NAME: HOST_NAME,
  IS_EMBEDDED_APP: false,
});

const ACTIVE_SHOPIFY_SHOPS = {};

app.get("/", async (req, res) => {
  // This shop hasn't been seen yet, go through OAuth to create a session
  if (ACTIVE_SHOPIFY_SHOPS[SHOPIFY_STORE_URL] === undefined) {
    // not logged in, redirect to login
    res.redirect(`/login`);
  } else {
    res.send("Hello world!");
    // Load your app skeleton page with App Bridge, and do something amazing!
    res.end();
  }
});

app.get("/login", async (req, res) => {
  let authRoute = await Shopify.Auth.beginAuth(
    req,
    res,
    SHOPIFY_STORE_URL,
    "/auth/callback",
    false
  );
  return res.redirect(authRoute);
});

app.get("/auth/callback", async (req, res) => {
  try {
    const session = await Shopify.Auth.validateAuthCallback(
      req,
      res,
      req.query
    ); // req.query must be cast to unkown and then AuthQuery in order to be accepted
    ACTIVE_SHOPIFY_SHOPS[SHOPIFY_STORE_URL] = session.scope;
    console.log(session.accessToken);
  } catch (error) {
    console.error(error); // in practice these should be handled more gracefully
  }
  return res.redirect(`/?host=${req.query.host}&shop=${req.query.shop}`); // wherever you want your user to end up after OAuth completes
});

app.listen(3000, () => {
  console.log("your app is now listening on port 3000");
});
