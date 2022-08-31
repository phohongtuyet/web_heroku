import db from "../../config/config";
import slugify from "slugify";
class CategoryController {

    //[GET] Index Category
    async index(req, res) {
        try{
            const categories = await db.collection("categories").get();
            res.render("category/index", {
                title: "Danh sách chủ đề",
                categories: categories
            })
        }
        catch(error){
            console.log(error);
        }
    }
    //[GET] Create Category 
    async create(req, res) {
        try{
            res.render("category/category_create", {
                title: "Thêm chủ đề"
            })
        }
        catch(error){
            console.log(error);
        }
    }
    //[POST] Create Category
    async store(req, res) {
        try{
            const name  = req.body.name;
            const slug  = slugify(name, {
                replacement: '-',  
                remove: /[*+~.()'"!:@]/g,
                strict: true,
                lower: true,
                locale: 'vi',      
                trim: true  
            });
            // find slug in database 
            const slugExist = await db.collection("categories").where("slug", "==", slug).get();
            if(slugExist.empty){
                // insert data to database
                await db.collection("categories").add({
                    name: name,
                    slug: slug
                });
                req.flash('success', 'Thêm chủ đề thành công!')
                res.redirect('back')
            }
            else{
                req.flash('error', 'Chủ đề đã tồn tại!')
                res.redirect('back')
            }
        }
        catch(error){
            console.log(error);
            req.flash('error', 'Thêm chủ đề không thành công!')
            res.redirect('back')
        }
    }

    //[GET] Edit Category
    async edit(req, res) {
        try{
            const id = req.params.id;
            const category = await db.collection("categories").doc(id).get();
            if(category.exists){
                res.render("category/category_edit", {
                    title: "Sửa chủ đề",
                    category: category.data()
                })
            }

        }
        catch(error){
            console.log(error);
        }
    }
    //[POST] Edit Category
    async update(req, res) {
        try{
            const id = req.params.id;
            const name  = req.body.name;
            const slug  = slugify(name, {
                replacement: '-',  
                remove: /[*+~.()'"!:@]/g,
                strict: true,
                lower: true,
                locale: 'vi',      
                trim: true  
            });
            // find slug in database 
            const slugExist = await db.collection("categories").where("slug", "==", slug).get();
            if(slugExist.empty){
                // insert data to database
                await db.collection("categories").doc(id).update({
                    name: name,
                    slug: slug
                });
                req.flash('success', 'Sửa chủ đề thành công!')
                res.redirect('back')
            }
            else{
                req.flash('error', 'Chủ đề đã tồn tại!')
                res.redirect('back')
            }
        }
        catch(error){
            console.log(error);
            req.flash('error', 'Sửa chủ đề không thành công!')
            res.redirect('back')
        }
    }

    //[GET] Delete Category
    async delete(req, res) {
        try{
            const id = req.params.id;
            const category = await db.collection("categories").doc(id).get();
            if(category.exists){
                await db.collection("categories").doc(id).delete();
                req.flash('success', `Xóa chủ đề [${category.data().name}] thành công!`)
                res.redirect('back')
            }
        }
        catch(error){
            console.log(error);
            req.flash('error', `Xóa chủ đề không thành công!`)
            res.redirect('back')
        }
    }

    //[GET] get all post of category by slug
    async getPostByCategory(req, res) {
        try{
            const slug = req.params.slug;
            const category = await db.collection("categories").where("slug", "==", slug).get();
          
            if(category.empty){
                res.redirect('/404')
            }
            else{

                const categories = await db.collection("categories").get();

                const bestPost = await db.collection("posts").orderBy("view", "desc").limit(3).get();
                const bestPostRef = await Promise.all(bestPost.docs.map(async post => {
                    const postData = post.data();

                    const categoryId = postData.categoryId.path.split("/").pop();
                    const userId = postData.userId.path.split("/").pop();
    
                    const category = await db.collection("categories").doc(`${categoryId}`).get();
                    const user = await db.collection("users").doc(`${userId}`).get();
                  
                    //convert createdAt time VietNam to UTC
                    const createdAt = new Date(post.createTime.toDate()).toLocaleString("vi-VN")

                    return {
                        id: post.id,
                        ...postData,
                        categoryName: category.data().name,
                        userName: user.data().full_name,
                        createdAt: createdAt,
                        view: post.data().view
                    }
                }));

                const posts = await db.collection("posts").get();
                const postByCategory = posts.docs.filter(post => post.data().categoryId.path.split("/").pop() === category.docs[0].id);
               
                res.render("category/search", {
                    title: "Danh Mục",
                    posts: postByCategory.map(post => post.data()),
                    categories: categories.docs.map(category => category.data()),
                    bestPost: bestPostRef
                })
            }
        }
        catch(error){
            console.log(error);
        }
    }
}

export default new CategoryController();