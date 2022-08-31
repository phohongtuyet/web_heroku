import express from "express";
const router = express.Router();

//import Routes Customer
import HomeRoute from "./homeRoute";

//import Routes Admin
import CategoryRoute from "./categoryRoute";
import PostRoute from "./postRoute";
import AuthRoute from "./authRoute";
import UserRoute from "./userRoute";
import AdminRoute from "./adminRoute";

const routes = (app) => {
    // Routes Customer
    app.use("/", HomeRoute);

    // Routes Admin
    app.use("/", CategoryRoute);
    app.use("/", PostRoute);
    app.use("/", AuthRoute);
    app.use("/", UserRoute);
    app.use("/", AdminRoute);

    // 404 page
    app.use((req, res) => {
        res.render('err/404', {title: '404 - Không tìm thấy trang'})
    });
    // 403 page;
};

export default routes;