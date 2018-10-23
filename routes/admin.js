module.exports = function (app) {

    app.get('/', function (req, res) {
        res.render('client2/pages/index', {
            title: 'Index',
            desc: '',
            keywords: '',
            nav: ''
        });
    });

    app.get('/info', function (req, res) {
        res.render('client2/pages/info', {
            title: 'Info',
            desc: '',
            keywords: '',
            nav: ''
        });
    });

    //Student new
    app.get('/admin/students/new', function (req, res) {
        res.render('admin/pages/stu_new', {
            title: 'New Student',
            desc: '',
            keywords: '',
            nav: 'stu_new'
        });
    });

    //Student detail
    app.get('/admin/stu/:id/:type', function (req, res) {
        var _id = req.params.id;
        var _type = req.params.type;
        res.render('admin/pages/stu_detail', {
            title: 'Student Detail',
            desc: '',
            keywords: '',
            nav: 'stu_detail',
            id: _id,
            type: _type
        });
    });

    app.get('/dynamic', function (req, res) {
        res.render('client2/pages/dynamic_list', {
            title: 'Dynamic List',
            desc: 'Dynamic List',
            keywords: '',
            nav: 'dynamic_list'
        });
    });

    app.get('/dynamic/:id', function (req, res) {
        var _id = req.params.id;
        res.render('client2/pages/dynamic', {
            title: 'Dynamic',
            desc: 'Dynamic',
            keywords: '',
            nav: 'dynamic',
            id: _id
        });
    });

    app.get('/category', function (req, res) {
        res.render('client2/pages/category', {
            title: 'Category',
            desc: '',
            keywords: '',
            nav: 'category'
        });
    });

    app.get('/major', function (req, res) {
        res.render('client2/pages/major', {
            title: 'Major',
            desc: '',
            keywords: '',
            nav: 'major'
        });
    });

    app.get('/teacher', function (req, res) {
        res.render('client2/pages/teacher', {
            title: 'Teacher',
            desc: '',
            keywords: '',
            nav: 'teacher'
        });
    });

    app.get('/teacher/:id', function (req, res) {
        var _id = req.params.id;
        res.render('client2/pages/teacher_detail', {
            title: 'Teacher Detail',
            desc: 'Teacher Detail',
            keywords: '',
            nav: 'teacher_detail',
            id: _id
        });
    });

    app.get('/student', function (req, res) {
        res.render('client2/pages/student', {
            title: 'Student',
            desc: '',
            keywords: '',
            nav: 'student'
        });
    });

    app.get('/student/:id', function (req, res) {
        var _id = req.params.id;
        res.render('client2/pages/student_detail', {
            title: 'Student Detail',
            desc: 'Student Detail',
            keywords: '',
            nav: 'student_detail',
            id: _id
        });
    });

    app.get('/comment', function (req, res) {
        res.render('client2/pages/comment', {
            title: 'Comment',
            desc: '',
            keywords: '',
            nav: 'comment'
        });
    });

    app.get('/comment/:id', function (req, res) {
        var _id = req.params.id;
        res.render('client2/pages/comment_detail', {
            title: 'Comment Detail',
            desc: 'Comment Detail',
            keywords: '',
            nav: 'comment_detail',
            id: _id
        });
    });

    //login
    app.get('/admin/login', function (req, res) {
        res.render('admin/login', {
            title: 'Login',
            desc: '',
            keywords: '',
            nav: ''
        });
    });

    //index
    app.get('/admin', function (req, res) {
        res.render('admin/pages/index', {
            title: 'Dashboard',
            desc: 'dashboard for administration',
            keywords: '',
            nav: 'dashboard'
        });
    });

    app.get('/admin/info/:type', function (req, res) {
        var _type = req.params.type;
        res.render('admin/pages/info', {
            title: 'Info Detail',
            desc: 'Info Detail',
            keywords: '',
            nav: 'info_detail',
            type: _type
        });
    });

    //Category
    app.get('/admin/category', function (req, res) {
        res.render('admin/pages/category', {
            title: 'Category',
            desc: 'Category',
            keywords: '',
            nav: 'category'
        });
    });

    //Category Detail
    app.get('/admin/category/:id', function (req, res) {
        var _id = req.params.id;
        res.render('admin/pages/category_detail', {
            title: 'Category Detail',
            desc: 'Category',
            keywords: '',
            nav: 'category_detail',
            id: _id
        });
    });


    //Comment
    app.get('/admin/comment/list', function (req, res) {
        res.render('admin/pages/comment_list', {
            title: 'Comment List',
            desc: 'Comment List',
            keywords: '',
            nav: 'comment_list'
        });
    });

    app.get('/admin/comment/new', function (req, res) {
        res.render('admin/pages/comment_new', {
            title: 'Comment New',
            desc: 'Comment New',
            keywords: '',
            nav: 'comment_new'
        });
    });

    //Comment Detail
    app.get('/admin/comment/:id', function (req, res) {
        var _id = req.params.id;
        res.render('admin/pages/comment_detail', {
            title: 'Comment Detail',
            desc: 'Comment',
            keywords: '',
            nav: 'comment_detail',
            id: _id
        });
    });

    //Dynamic List
    app.get('/admin/dynamic/list', function (req, res) {
        res.render('admin/pages/dynamic_list', {
            title: 'Dynamic List',
            desc: 'Dynamic List',
            keywords: '',
            nav: 'dynamic_list'
        });
    });

    // Dynamic Add
    app.get('/admin/dynamic/new', function (req, res) {
        res.render('admin/pages/dynamic_new', {
            title: 'Dynamic New',
            desc: 'Dynamic New',
            keywords: '',
            nav: 'dynamic_new'
        });
    });

    //Dynamic Detail
    app.get('/admin/dynamic/:id', function (req, res) {
        var _id = req.params.id;
        res.render('admin/pages/dynamic_detail', {
            title: 'Dynamic Detail',
            desc: 'Dynamic',
            keywords: '',
            nav: 'dynamic_detail',
            id: _id
        });
    });



    app.get('/admin/category1', function (req, res) {
        res.render('admin/pages/category1', {
            title: 'Category1',
            desc: 'Category1',
            keywords: '',
            nav: 'category1'
        });
    });



    //User admin
    app.get('/admin/user/admin', function (req, res) {
        res.render('admin/pages/admin_list', {
            title: 'Admin List',
            desc: '',
            keywords: '',
            nav: 'admin_list'
        });
    });

    //User referee
    app.get('/admin/user/referee', function (req, res) {
        res.render('admin/pages/referee_list', {
            title: 'Referee List',
            desc: '',
            keywords: '',
            nav: 'referee_list'
        });
    });

    //User teacher
    app.get('/admin/user/teacher', function (req, res) {
        res.render('admin/pages/teacher_list', {
            title: 'Teacher List',
            desc: '',
            keywords: '',
            nav: 'Teacher_list'
        });
    });

    //User student
    app.get('/admin/user/student', function (req, res) {
        res.render('admin/pages/student_list', {
            title: 'Student List',
            desc: '',
            keywords: '',
            nav: 'Student_list'
        });
    });

    //User detail
    app.get('/admin/users/:id/:type', function (req, res) {
        var _id = req.params.id;
        var _type = req.params.type;
        res.render('admin/pages/user_detail', {
            title: 'User Detail',
            desc: '',
            keywords: '',
            nav: 'user_detail',
            id: _id,
            type: _type
        });
    });

    //Student List
    app.get('/admin/student/list', function (req, res) {
        res.render('admin/pages/stu_list', {
            title: 'Student List',
            desc: '',
            keywords: '',
            nav: 'stu_list'
        });
    });


    //Personal Center
    app.get('/admin/me/:id/:type', function (req, res) {
        var _id = req.params.id;
        var _type = req.params.type;
        if (_type == 1) {
            res.render('admin/pages/user_detail', {
                title: 'Personal Center',
                desc: 'Personal Center',
                keywords: '',
                nav: 'personal_center',
                id: _id,
                type: _type
            });
        } else if (_type == 2) {
            res.render('admin/pages/stu_detail', {
                title: 'Personal Center',
                desc: 'Personal Center',
                keywords: '',
                nav: 'personal_center',
                id: _id,
                type: _type
            });
        }
    });
};