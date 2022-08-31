import db from "../../config/config";

class HomeController {
    
    async index(req, res) {
        try{
            //get all posts censorship =  1
           const posts = await db.collection('posts').where('censorship', '==', 1).get();
            const categories = await db.collection("categories").get();
            const cd = categories.docs.map(category => {
                return {
                    id: category.id,
                    ...category.data()
                }
            });

            if(posts.empty){
                res.render("post/index", {
                    title: "Trang chủ",
                    posts: []
                });
            }
            else{
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
                    userName: user.data(),
                    createdAt: createdAt
                }
                }));
                res.render("index", {
                posts: postsRef,
                categories: cd,
                bestPost: bestPostRef,
                title: "Trang chủ"
                });
            }
 
         }
         catch(error){
             console.log(error);
         }
    }
}

export default new HomeController();