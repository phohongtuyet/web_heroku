/** @format */

const authMiddleware = {
 
    roleAdmin: (req, res, next) => {
        if (req.session.isLoggedIn) {
            if (req.session.user.role == 'admin') {
                next();
            } else {
                // res.redirect('/login');
                res.render('err/403', {title: '403 - Không có quyền truy cập'});
            }
        } else {
            res.redirect('/login');
        }
    },

    roleUser: (req, res, next) => {
        if (req.session.isLoggedIn) {
            if (req.session.user.role == 'user') {
                next();
            } else {
                // res.redirect('/login');
                res.render('err/403', {title: '403 - Không có quyền truy cập'});
            }
        } else {
            res.redirect('/login');
        }
    },

    roleAdminOrUser: (req, res, next) => {
        if (req.session.isLoggedIn) {
            if (req.session.user.role == 'admin' || req.session.user.role == 'user') {
                next();
            } else {
                // res.redirect('/login');
                res.render('err/403', {title: '403 - Không có quyền truy cập'});
            }
        } else {
            res.redirect('/login');
        }
    }

    
    

};

export default authMiddleware;

