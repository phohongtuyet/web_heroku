import db from "../../config/config";
import hash from "../../utils/hashPassword";
class UserController {

    //[GET] index 
    async index(req, res) {
        try{
            // get all users is_deleted = false
            const users = await db.collection("users").where("is_deleted", "==", false).get();

            if(users.empty){
                res.render("user/index", {
                    title: "Danh sách người dùng",
                    users: []
                });
            }
            else{
                const usersArray = users.docs.map(doc => {
                    return {
                        id: doc.id,
                        ...doc.data()
                    }
                });
                res.render("user/index", {
                    users: usersArray,
                    title: "Danh sách người dùng"
                });
            }
        }catch(err){
            console.log(err);
        }
    }

    //[GET] index/ restore
    async indexRestore(req, res) {
        try{
            // get all users is_deleted = false
            const users = await db.collection("users").where("is_deleted", "==", true).get();

            if(users.empty){
                res.render("user/index_restore", {
                    title: "Danh sách người dùng",
                    users: []
                });
            }
            else{
                const usersArray = users.docs.map(doc => {
                    return {
                        id: doc.id,
                        ...doc.data()
                    }
                });
                res.render("user/index_restore", {
                    users: usersArray,
                    title: "Danh sách người dùng"
                });
            }
        }catch(err){
            console.log(err);
        }
    }
    async restore(req, res) {
        try{
            const id = req.params.id;
            const user = await db.collection("users").doc(id).get();
            if(user.exists){
                await db.collection("users").doc(id).update({
                    is_deleted: false,
                    is_locked: false
                });
                req.flash('success', 'Khôi phục tài khoản thành công')
                res.redirect("back");
            }
            else{
                req.flash('error', 'Không tìm thấy tài khoản')
                res.redirect("back");
            }
        }
        catch(err){
            console.log(err);
        }
    }

    //[GET] /use/create
    async create(req, res) {
        try{
            res.render("user/user_create", {
                title: "Tạo tài khoản"
            });
        }
        catch(err){
            console.log(err);
        }
    }
    async store(req, res) {
        try{
            const body = req.body;
            if(body.password !== body.re_password){
                req.flash('error', 'Mật khẩu không khớp')
                res.redirect("back");
                return;
            }
            // check username
            const user = await db.collection("users").where("username", "==", body.username).get();
            if(!user.empty){
                req.flash('error', 'Tên đăng nhập đã tồn tại')
                res.redirect("back");
                return;
            }
            const hashPassword = await hash(body.password);
            await db.collection("users").add({
                full_name: body.full_name,
                username: body.username,
                role: body.role,
                password: hashPassword,
                is_locked: false,
                is_deleted: false
            });
            req.flash('success', 'Tạo tài khoản thành công')
            res.redirect("/admin/user");
        }
        catch(err){
            console.log(err);
        }
    }

    //[GET] /use/edit/:id
    async edit(req, res) {
        try{
            const id = req.params.id;
            const user = await db.collection("users").doc(id).get();
            if(user.exists){
                res.render("user/user_edit", {
                    title: "Sửa thông tin người dùng",
                    user: user.data()
                });
            }else{
                req.flash('error', 'Không tìm thấy tài khoản')
                res.redirect("back");
            }
        }
        catch(err){
            console.log(err);
        }
    }
    //[POST] /use/edit/:id
    async update(req, res) {
        try{
            const id = req.params.id;
            const body = req.body;
            const user = await db.collection("users").doc(id).get();
            if(user.exists){
                
                if(!body.password){
                    await db.collection("users").doc(id).update({
                        full_name: body.full_name,
                        username: body.username,
                        role: body.role,
                    });
                    req.flash('success', 'Sửa thông tin thành công')
                    res.redirect("back");
                    return;
                }
                else{
                    if(body.password !== body.re_password){
                        req.flash('error', 'Mật khẩu không khớp')
                        res.redirect("back");
                        return;
                    }
                    const hashPassword = await hash(body.password);
                    await db.collection("users").doc(id).update({
                        full_name: body.full_name,
                        username: body.username,
                        role: body.role,
                        password: hashPassword
                    });
                    req.flash('success', 'Sửa thông tin thành công')
                    res.redirect("/admin/user");
                }
                
            }
            else{
                req.flash('error', 'Không tìm thấy tài khoản')
                res.redirect("back");
            }
           
        }
        catch(err){
            console.log(err);
        }
    }

    //[GET] /use/delete/:id
    async delete(req, res) {
        try{
            const id = req.params.id;
            const user = await db.collection("users").doc(id).get();
            if(user.exists){
                await db.collection("users").doc(id).update({
                    is_deleted: true,
                    is_locked: true
                });
                req.flash('success', 'Xóa tài khoản thành công')
                res.redirect("back");
            }
            else{
                req.flash('error', 'Không tìm thấy tài khoản')
                res.redirect("back");
            }
        }
        catch(err){
            console.log(err);
        }
    }

    //[GET] use/censorship
    async censorship(req, res) {
        try{
            const id = req.params.id;
            const user = await db.collection("users").doc(id).get();
            if(user.exists){
                if(user.data().is_locked == true){
                    await db.collection("users").doc(id).update({
                        is_locked: false
                    });
                    req.flash('success', 'Đã mở khoá tài khoản')
                    res.redirect("back");
                }
                else{
                    await db.collection("users").doc(id).update({
                        is_locked: true
                    });
                    req.flash('success', 'Đã khóa tài khoản')
                    res.redirect("back");
                }
            }
            else{
                req.flash('error', 'Không tìm thấy tài khoản')
                res.redirect("back");
            }

        }
        catch(err){
            console.log(err);
        }
    }
}
export default new UserController();
