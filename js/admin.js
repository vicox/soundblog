(function() {

    var redirectTo = window.location.hash || '#';
    window.location = '#/login';

    var github;
    var repo;
    var branch;

    var LoginView = Backbone.View.extend({
        el: '.github',
        events: {
            'submit': 'submit'
        },
        submit: function (e) {
            e.preventDefault();

            var username = $(e.currentTarget).find('#username').val();
            var password = $(e.currentTarget).find('#password').val();

            github = new Octokit({
                username: username,
                password: password
            });

            repo = github.getRepo(this.$el.data('username'), this.$el.data('repo'));
            branch = repo.getBranch("master");

            window.location = redirectTo;
        },
        render: function (options) {
            this.$el.html($('#login-template').html());
        }
    });

    var PostsView = Backbone.View.extend({
        el: '.github',
        render: function (options) {
            var that = this;
            branch.contents('_posts')
                .then(function (posts) {
                    posts = JSON.parse(posts);
                    var template = _.template($('#posts-template').html(), {posts: posts});
                    that.$el.html(template);
                });
        }
    });

    var Router = Backbone.Router.extend({
        routes: {
            "login": "login",
            "": "posts"
        }
    });

    var router = new Router();
    router.on('route:login', function () {
        new LoginView().render();
    });
    router.on('route:posts', function () {
        new PostsView().render();
    });

    Backbone.history.start();

})();