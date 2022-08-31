import db from "../../config/config";
import slugify from "slugify";
import axios from "axios";
class PostController {

    //[GET] /index Posts
    async index(req, res) {
        try{
           const posts = await db.collection("posts").get();
           
            if(posts.empty){
                res.render("post/index", {
                    title: "Danh sách bài viết",
                    posts: []
                });
            }
            else{
                const postsRef = await Promise.all(posts.docs.map(async post => {
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
                        createdAt: createdAt
                    }
                }));
                res.render("post/index", {
                    posts: postsRef,
                    title: "Danh sách bài viết"
                });
            }

        }
        catch(error){
            console.log(error);
        }
    }

    //[GET] / censorship Posts
    async censorship(req, res) {
        try{
            const id = req.params.id;
            const post = await db.collection("posts").doc(`${id}`).get();
            if(post.exists){
                if(post.data().censorship == 1){
                    await db.collection("posts").doc(`${id}`).update({
                        censorship: 0
                    });
                    req.flash('success', 'Đã bỏ duyệt bài viết')
                    res.redirect('back')
                }
                else{
                    await db.collection("posts").doc(`${id}`).update({
                        censorship: 1
                    });
                    req.flash('success', 'Bài viết đã được duyệt!')
                    res.redirect('back')
                }
            }
        }
        catch(error){
            console.log(error);
            req.flash('error', 'Duyệt bài viết thất bại!')
            res.redirect('back')
        }
    }

    //[GET] /create Post
    async create(req, res) {
        try{
            const categories = await db.collection("categories").get();
            const cd = categories.docs.map(category => {
                return {
                    id: category.id,
                    ...category.data()
                }
            });

            res.render("post/post_create", {
                title: "Tạo bài viết",
                categories: cd
            });
        }
        catch(error){
            console.log(error);
        }
    }
    async store(req, res) {
        try{
            const body = req.body;
            const slug  = slugify(body.title, {
                replacement: '-',
                remove: /[*+~.()'"!:@]/g,
                strict: true,
                lower: true,
                locale: 'vi',
                trim: true
            });
            // check if the slug is existed
            const checkSlug = await db.collection("posts").where("slug", "==", slug).get();
            if(checkSlug.empty){
                await db.collection("posts").add({
                    categoryId: db.doc(`categories/${body.categoryId}`),
                    title: body.title,
                    slug: slug,
                    censorship: 0,
                    summary: body.summary,
                    content: body.content,
                    view: 0,
                    userId: db.doc(`users/${req.session.userId}`),
                });
                req.flash('success', 'Đã tạo bài viết')
                res.redirect('back');
            }
            else{
                req.flash('error', 'Tên bài viết đã tồn tại!')
                res.redirect('back');
            }

        }
        catch(error){
            console.log(error);
            req.flash('error', 'Tạo bài viết thất bại!')
            res.redirect('back')
        }
    }

    //[GET] /edit Post
    async edit(req, res) {
        try{
            const id = req.params.id;
            const post = await db.collection("posts").doc(`${id}`).get();
            if(post.exists){
                const categories = await db.collection("categories").get();
                const cd = categories.docs.map(category => {
                    return {
                        id: category.id,
                        ...category.data()
                    }
                });

                res.render("post/post_edit", {
                    title: "Chỉnh sửa bài viết",
                    categoryId: post.data().categoryId.path.split("/").pop(),
                    post: post.data(),
                    categories: cd
                });
            }
        }
        catch(error){
            console.log(error);
            req.flash('error', 'Chỉnh sửa bài viết thất bại!')
            res.redirect('back')
        }
    }
    //[POST] /update Post
    async update(req, res) {
        try{
            const id = req.params.id;
            const body = req.body;
            const slug  = slugify(body.title, {
                replacement: '-',
                remove: /[*+~.()'"!:@]/g,
                strict: true,
                lower: true,
                locale: 'vi',
                trim: true
            });

            const pots = await db.collection("posts").doc(id).get();
            if(pots){
                await db.collection("posts").doc(id).update({
                    categoryId: db.doc(`categories/${body.categoryId}`),
                    title: body.title,
                    slug: slug,
                    censorship: 0,
                    summary: body.summary,
                    content: body.content,
                });
                req.flash('success', 'Đã chỉnh sửa bài viết')
                res.redirect('back');
            }
                else{
                    req.flash('error', 'Tên bài viết đã tồn tại!')
                    res.redirect('back');
                }
            
            

        }
        catch(error){
            console.log(error);
            req.flash('error', 'Chỉnh sửa bài viết thất bại!')
            res.redirect('back')
        }
    }

    //[GET] /delete Post
    async delete(req, res) {
        try{
            const id = req.params.id;
            const post = await db.collection("posts").doc(id).get();
            if(post){
                await db.collection("posts").doc(id).delete();
                req.flash('success', 'Đã xóa bài viết')
                res.redirect('back');
            }
        }
        catch(error){
            console.log(error);
            req.flash('error', 'Xóa bài viết thất bại!')
            res.redirect('back')
        }
    }

    //[GET] /myPost
    async myPost(req, res) {
        try{
            const id = req.session.userId;
            const posts = await db.collection("posts").where("userId", "==", db.doc(`users/${id}`)).get();
            // const posts = await db.collection("posts").get(); 
            if(posts.empty){
                res.render("post/my_post", {
                    title: "Danh sách bài viết của bạn",
                    posts: []
                });
            }
            else{
                const postsRef = await Promise.all(posts.docs.map(async post => {
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
                        createdAt: createdAt
                    }
                }));
                res.render("post/my_post", {
                    posts: postsRef,
                    title: "Danh sách bài viết của bạn"
                });
            }
        }
        catch(error){
            console.log(error);
        }
    }

    //[GET] /details Post
    async details(req, res) {
        try{
            const slug = req.params.slug;
            //get post by slug
            const post = await db.collection("posts").where("slug", "==", slug).get();

            if(post.empty){
                req.flash('error', 'Không tìm thấy bài viết!')
                res.redirect('back');
            }
            else{
                // check session view posts
                req.session.viewPosts = req.session.viewPosts || [];
                //check post is viewed
                const isViewed = req.session.viewPosts.find(id => id === post.docs[0].id);
                if(!isViewed){
                    //add post viewed
                    req.session.viewPosts.push(post.docs[0].id);
                    //update view
                    await db.collection("posts").doc(post.docs[0].id).update({
                        view: post.docs[0].data().view + 1
                    });
                }
                // Get name category
                const categories = await db.collection("categories").get();

                // get views the best post
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
                const postRef = await Promise.all(post.docs.map(async post => {
                    const postData = post.data();

                    const categoryId = postData.categoryId.path.split("/").pop();
                    const userId = postData.userId.path.split("/").pop();
    
                    const category = await db.collection("categories").doc(`${categoryId}`).get();
                    const user = await db.collection("users").doc(`${userId}`).get();
                  
                    //convert createdAt time VietNam to UTC
                    const createdAt = new Date(post.createTime.toDate()).toLocaleString("vi-VN")

                    //get comments by postId censorship = true
                    const comments = await db.collection("comments").where("postId", "==", db.doc(`posts/${post.id}`)).where("censorship", "==", true).get();
                  
                    //get userName by userId in comments
                    const commentsRef = await Promise.all(comments.docs.map(async comment => {
                        const commentData = comment.data();
                        const userId = commentData.userId.path.split("/").pop();
                        const user = await db.collection("users").doc(`${userId}`).get();
                        const createdAt = new Date(comment.createTime.toDate()).toLocaleString("vi-VN")
                        return {
                            content: commentData.content,
                            userName: user.data().full_name,
                            createdAt: createdAt
                        }
                    }));
    

                    return {
                        id: post.id,
                        ...postData,
                        categoryName: category.data().name,
                        categorySlug: category.data().slug,
                        userName: user.data().full_name,
                        createdAt: createdAt,
                        comments: commentsRef
                    }
                }));
                
                res.render("post/post_detail", {
                    post: postRef[0],
                    title: "Chi tiết bài viết",
                    bestPost: bestPostRef,
                    categories: categories.docs.map(category => category.data())
                });
              
                
            }
        }
        catch(error){
            console.log(error);
        }
    }

    //[GET] /comment Post
    async indexComment(req, res) {
        try{
            // get all comments 
            const comments = await db.collection("comments").get();
            // get userName by userId in comments
            const commentsRef = await Promise.all(comments.docs.map(async comment => {
                const commentData = comment.data();
                const userId = commentData.userId.path.split("/").pop();
                const user = await db.collection("users").doc(`${userId}`).get();
                const createdAt = new Date(comment.createTime.toDate()).toLocaleString("vi-VN")
                return {
                    id: comment.id,
                    content: commentData.content,
                    userName: user.data().full_name,
                    createdAt: createdAt,
                    censorship: commentData.censorship
                }
            }));

            res.render("comment/index", {
                comments: commentsRef,
                title: "Danh sách bình luận"
            })
        }
        catch(error){
            console.log(error);
        }
    }

    //[GET] /censorshipComment
    async censorshipComment(req, res) {
        try{
            const id = req.params.id;
            // get comment by id
            const comment = await db.collection("comments").doc(id).get();
            if(comment.empty){
                req.flash('error', 'Không tìm thấy bình luận!')
                res.redirect('back');
            }
            else{
                if(comment.data().censorship == true){
                    await db.collection("comments").doc(`${id}`).update({
                        censorship: false
                    });
                    req.flash('success', 'Đã khoá bình luận!')
                    res.redirect('back')
                }
                else{
                    await db.collection("comments").doc(`${id}`).update({
                        censorship: true
                    });
                    req.flash('success', 'Đã duyệt bình luận!')
                    res.redirect('back')
                }
            }
        }
        catch(error){
            console.log(error);
        }
    }

    //[POST] /comment Post
    async createComment(req, res) {
        try{
            const id = req.params.id;
            const post = await db.collection("posts").doc(id).get();
            if(post){
                const comment = await db.collection("comments").add({
                    postId: db.doc(`posts/${id}`),
                    userId: db.doc(`users/${req.session.userId}`),
                    content: req.body.content,
                    censorship: false,
                    createdAt: new Date()
                });
                req.flash('success', 'Đã bình luận thành công và đang chờ xét duyệt!')
                res.redirect('back');
            }
            else{
                req.flash('error', 'Không tìm thấy bài viết!')
                res.redirect('back');
            }
        }
        catch(error){
            console.log(error);
            req.flash('error', 'Bình luận thất bại!')
            res.redirect('back')
        }
    }
    //[GET] /deleteComment
    async deleteComment(req, res) {
        try{
            const id = req.params.id;
            const comment = await db.collection("comments").doc(id).get();
            if(comment.empty){
                req.flash('error', 'Không tìm thấy bình luận!')
                res.redirect('back');
            }
            else{
                await db.collection("comments").doc(`${id}`).delete();
                req.flash('success', 'Đã xóa bình luận!')
                res.redirect('back');
            }
        }
        catch(error){
            console.log(error);
            req.flash('error', 'Xóa bình luận thất bại!')
            res.redirect('back')
        }
    }

    //[GET] /search Post
    async searchPost(req, res) {
        try{
            const search = req.query.kw;
            // get posts by search keyword near same
            const posts = await db.collection("posts").where("title", ">=", search).where("title", "<=", search + "\uf8ff").get();
          
            if(posts.empty){
                const categories = await db.collection("categories").get();
                
                res.render("post/search", {
                    posts: [],
                    categories: categories.docs.map(category => category.data()),
                    bestPost: [],
                    title: "Tìm kiếm bài viết",
                })
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


                const postsRef = await Promise.all(posts.docs.map(async post => {
                    const postData = post.data();
                    const categoryId = postData.categoryId.path.split("/").pop();
                    const category = await db.collection("categories").doc(`${categoryId}`).get();
                    const userId = postData.userId.path.split("/").pop();
                    const user = await db.collection("users").doc(`${userId}`).get();
                    const createdAt = new Date(post.createTime.toDate()).toLocaleString("vi-VN")
                    return {
                        id: post.id,
                        title: postData.title,
                        content: postData.content,
                        categoryName: category.data().name,
                        userName: user.data().full_name,
                        createdAt: createdAt,
                        slug: postData.slug,
                    }
                }));

                res.render("post/search", {
                    posts: postsRef,
                    title: "Tìm kiếm bài viết",
                    categories: categories.docs.map(category => category.data()),
                    bestPost: bestPostRef,
                })
            }

            
        }
        catch(error){
            console.log(error);
        }
    }

    //[GET] /create audio
    async createAudio(req, res) {
        try{
            const id = req.params.id;
            const post = await db.collection("posts").doc(id).get();
            const content = post.data().content;
            
            //get text only, remove html tags in content
            const text = content.replace(/<(?:.|\n)*?>/gm, '');
           
            const url = 'https://api.fpt.ai/hmi/tts/v5'
            const data = await axios({
				method: 'post',
				url: url,
				headers : {
					'api-key': 'UnyyO3LwdWK7NFWldf0f0EHMKXM502dd',
					'speed': '-H',
					'voice': 'banmai'
				},
				data: text
			})
            // console.log(data.data.async);
            if(data){
                await db.collection("posts").doc(`${id}`).update({
                    audio: data.data.async
                });
                req.flash('success', 'Đã tạo audio thành công!')
                res.redirect('back');
            }else{
                req.flash('error', 'Tạo audio thất bại!')
                res.redirect('back');
            }
        }
        catch(error){
            console.log(error);
        }
    }

    //[GET] /delete audio
    async deleteAudio(req, res) {
        try{
            const id = req.params.id;
            const post = await db.collection("posts").doc(id).get();
            if(post.empty){
                req.flash('error', 'Không tìm thấy bài viết!')
                res.redirect('back');
            }
            else{
                await db.collection("posts").doc(`${id}`).update({
                    audio: ""
                });
                req.flash('success', 'Đã xóa audio!')
                res.redirect('back');
            }
        }
        catch(error){
            console.log(error);
            req.flash('error', 'Xóa audio thất bại!')
            res.redirect('back')
        }
    }
}
export default new PostController();