import db from "../../config/config";
import bcrypt from 'bcrypt';
import hash from "../../utils/hashPassword";
class LoginController {

    //[GET] /login
    async index(req, res) {
        try{
           res.render("auth/login", {
                title: "Đăng nhập"
            });
        }
        catch(error){
            console.log(error);
        }
    }
    //[POST] /login
    async login(req, res) {
        try{
            const { username, password } = req.body;
           // get user by username firebase
            const users = await db.collection("users").get();

            const user = users.docs.find(doc => doc.data().username === username);
            if(user){
               const isMatch = await bcrypt.compare(password, user.data().password);
             
                if(isMatch){
                    // set session
                    req.session.isLoggedIn = true;
                    req.session.user = user.data();
                    req.session.userId = user.id;
                    //check role
                    if(user.data().role === "admin"){
                        res.redirect("/admin");
                    }
                    else{
                        res.redirect('/');
                    }
                }else{
                    req.flash('error', 'Mật khẩu không chính xác!')
                    res.redirect('back')
                }
            }else{
                req.flash('error', 'Tài khoản hoặc mật khẩu không chính xác!')
                res.redirect('back')
            }
            
        }
        catch(error){
            console.log(error);
        }
    }

    //[GET] /register
    async indexRegister(req, res) {
        try{
            res.render("auth/register", {
                title: "Đăng ký"
            });
        }
        catch(error){
            console.log(error);
        }
    }
    //[POST] /register
    async register(req, res) {
        try{
            const { username, password, full_name } = req.body;
            // get user by username firebase
            const users = await db.collection("users").get();
            const user = users.docs.find(doc => doc.data().username === username);
            if(user){
                req.flash('error', 'Tài khoản đã tồn tại!')
                res.redirect('back')
            }else{
                // create user
                const hashPassword = await hash(password);
                const newUser = {
                    username: username,
                    password: hashPassword,
                    full_name: full_name,
                    role: "user"
                }
                await db.collection("users").add(newUser);
                req.flash('success', 'Đăng ký tài khoản thành công!')
                res.redirect('back')
            }
            // res.redirect('/login');
        }
        catch(error){
            console.log(error);
        }
    }

    //[GET] /logout
    async logout(req, res) {
        try{
            req.session.destroy();
            res.redirect('/login');
        }
        catch(error){
            console.log(error);
        }
    }

    //[GET] /admin index
    async indexAdmin(req, res) {
        try{
            res.redirect('/admin/post');
        }
        catch(error){
            console.log(error);
        }
    }
}
export default new LoginController();
