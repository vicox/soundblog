(function() {

    var redirectTo = window.location.hash || '#';
    window.location = '#/login';

    var github;
    var repo;
    var branch;

    var LoginView = Backbone.View.extend({
        el: '.github',
        events: {
            'submit .login': 'submit'
        },
        submit: function (e) {
            e.preventDefault();
            $(e.currentTarget).find('button[type=submit]').button('loading');
            $(e.currentTarget).find('input').prop('disabled', true);

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

    var PostEditView = Backbone.View.extend({
        el: '.github',
        events: {
            'submit .edit-post': 'submit'
        },
        submit: function (e) {
            e.preventDefault();
            $(e.currentTarget).find('button[type=submit]').button('loading');
            $(e.currentTarget).find('input').prop('disabled', true);

            var fileName = $(e.currentTarget).find('#fileName').val();
            var title = $(e.currentTarget).find('#title').val();

            console.log('_posts/' + fileName);
            branch.contents('_posts/' + fileName)
                .then(function (content) {
                    var metaMap = contentToMap(content);
                    metaMap['title'] = '"' + title + '"';
                    var newContent = mapToContent(metaMap);

                    branch.write('_posts/' + fileName, newContent, 'edit post', false)
                        .then(function() {
                            window.location = '#';
                        });
                });


        },
        render: function (options) {
            var that = this;
            branch.contents('_posts/' + options.fileName)
                .then(function (content) {
                    var template = _.template($('#post-edit-template').html(), {post: {
                        fileName: options.fileName,
                        meta: contentToMap(content, true)}});
                    that.$el.html(template);
                });
        }
    });

    var Router = Backbone.Router.extend({
        routes: {
            "login": "login",
            "": "posts",
            "edit/:fileName": "edit"
        }
    });

    var router = new Router();
    router.on('route:login', function () {
        new LoginView().render();
    });
    router.on('route:posts', function () {
        new PostsView().render();
    });
    router.on('route:edit', function (fileName) {
        new PostEditView().render({fileName: fileName});
    });

    Backbone.history.start();


    function contentToMap(content, shouldStripQuotes) {
        var map = {};
        var lines = content.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].indexOf(':') > 0) {
                var key = lines[i].substring(0, lines[i].indexOf(':'));
                var value = lines[i].substring(lines[i].indexOf(':') + 1, lines[i].length);
                value = stripWhitespaces(value);
                if (typeof shouldStripQuotes !== 'undefined' && shouldStripQuotes) {
                    value = stripQuotes(value);
                }
                map[key] = value;
            }
        }
        return map;
    }

    function mapToContent(map) {
        var content = '---\n';
        for (var key in map) {
            content += key +': ' + map[key] + '\n';
        }
        content += '---';
        return content;
    }

    function stripWhitespaces(s) {
        return s.replace(/^\s+|\s+$/g, '');
    }

    function stripQuotes(s) {
        return s.replace(/^"+|"+$/g, '');
    }

})();