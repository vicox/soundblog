(function() {

    var next = window.location.hash = (window.location.hash != '#/login') ? window.location.hash : '';
    window.location.hash = '#/login';

    var repo;

    var LoginView = Backbone.View.extend({
        el: '.posts',
        events: {
            'submit .login': 'submit'
        },
        submit: function (e) {
            e.preventDefault();

            var $form = $(e.currentTarget);
            disableForm($form);

            var username = $form.find('#username').val();
            var password = $form.find('#password').val();

            if (username && password) {
                var octo = new Octokat({
                    username: username,
                    password: password
                });

                repo = octo.repos(this.$el.data('github-username'), this.$el.data('github-repo'));

                repo.collaborators.contains(username).then(function(isCollaborator) {
                    if (isCollaborator) {
                        window.location.hash = next;

                    } else {
                        formError($form, 'You are not a collaborator of this repository');
                    }
                }).fail(function() {
                    formError($form, 'Incorrect Github credentials');
                });

            } else {
                formError($form, 'Username and password are required');
            }
        },
        render: function (options) {
            this.$el.html($('#login-template').html());
        }
    });

    var PostsView = Backbone.View.extend({
        el: '.posts',
        render: function (options) {
            var that = this;
            repo.contents('_posts').fetch()
                .then(function (files) {
                    files = _.sortBy(files, function(file){ return file.name });
                    files.reverse();
                    var template = _.template($('#posts-template').html(), {files: files});
                    that.$el.html(template);
                }).fail(function() {
                    var template = _.template($('#posts-template').html());
                    that.$el.html(template);
                });
        }
    });

    var PostShowView = Backbone.View.extend({
        el: '.posts',
        render: function (options) {
            var that = this;
            repo.contents('_posts/' + options.fileName).fetch()
                .then(function (file) {
                    var content = Base64.decode(file.content);
                    var template = _.template($('#post-show-template').html(), {post: {
                        fileName: options.fileName,
                        meta: contentToMap(content, true)}});
                    that.$el.html(template);
                });
        }
    });

    var PostEditView = Backbone.View.extend({
        el: '.posts',
        events: {
            'submit .edit-post': 'submit'
        },
        submit: function (e) {
            e.preventDefault();

            var $form = $(e.currentTarget);
            disableForm($form);

            var fileName = $form.find('#fileName').val();
            var title = $form.find('#title').val();
            var date = $form.find('#date').val();

            repo.contents('_posts/' + fileName).fetch()
                .then(function (file) {
                    var content = Base64.decode(file.content);
                    var metaMap = contentToMap(content);
                    metaMap['title'] = '"' + title + '"';
                    metaMap['date'] = date;

                    var newContent = mapToContent(metaMap);

                    var dayFromDate = date.substring(0, 10);
                    if (fileName.indexOf(dayFromDate) == 0) {
                        repo.contents('_posts/' + fileName).add({
                            path: '_posts/' + fileName,
                            message: 'edit post',
                            content: Base64.encode(newContent),
                            sha: file.sha
                        }).then(function() {
                                window.location.hash = '#/show/' +fileName;
                            });
                    } else {
                        var newFileName = dayFromDate + fileName.substring(10, fileName.length);
                        repo.contents('_posts/' + newFileName).add({
                            path: '_posts/' + newFileName,
                            message: 'create post',
                            content: Base64.encode(newContent)
                        }).then(function() {
                                repo.contents('_posts/' + fileName).remove({
                                    path: '_posts/' + fileName,
                                    message: 'delete post',
                                    sha: file.sha
                                }).then(function() {
                                        window.location.hash = '#/show/' + newFileName;
                                    });
                            });
                    }
                });


        },
        render: function (options) {
            var that = this;
            repo.contents('_posts/' + options.fileName).fetch()
                .then(function (file) {
                    var content = Base64.decode(file.content);
                    var template = _.template($('#post-edit-template').html(), {post: {
                        fileName: options.fileName,
                        meta: contentToMap(content, true)}});
                    that.$el.html(template);
                });
        }
    });

    var PostDeleteView = Backbone.View.extend({
        el: '.posts',
        events: {
            'submit .delete-post': 'submit'
        },
        submit: function (e) {
            e.preventDefault();

            var $form = $(e.currentTarget);
            disableForm($form);

            var fileName = $form.find('#fileName').val();

            repo.contents('_posts/' + fileName).fetch()
                .then(function (file) {
                    repo.contents('_posts/' + fileName).remove({
                        path: '_posts/' + fileName,
                        message: 'delete post',
                        sha: file.sha
                    }).then(function() {
                        window.location.hash = '#';
                    });
                });
        },
        render: function (options) {
            var that = this;
            repo.contents('_posts/' + options.fileName).fetch()
                .then(function (file) {
                    var content = Base64.decode(file.content);
                    var template = _.template($('#post-delete-template').html(), {post: {
                        fileName: options.fileName,
                        meta: contentToMap(content, true)}});
                    that.$el.html(template);
                });
        }
    });

    var PostCreateView = Backbone.View.extend({
        el: '.posts',
        events: {
            'submit .create-post': 'submit',
            'submit .docreate-post': 'create'
        },
        submit: function (e) {
            e.preventDefault();

            var $form = $(e.currentTarget);
            disableForm($form);

            var url = $form.find('#url').val();

            SC.initialize({
                client_id: this.$el.data('soundcloud-client-id')
            });

            var that = this;
            SC.get("/resolve", {url: url}, function(track){
                var template = _.template($('#post-docreate-template').html(), {
                    title: track.title,
                    date: formatLocalDate(),
                    id: track.id,
                    kind: track.kind,
                    permalink: track.user.permalink + '-' + track.permalink,
                    url: url
                });
                that.$el.html(template);
            });


        },
        create: function (e) {
            e.preventDefault();

            var $form = $(e.currentTarget);
            disableForm($form);

            var title = $form.find('#title').val();
            var date = $form.find('#date').val();
            var id = $form.find('#id').val();
            var kind = $form.find('#kind').val();
            var url = $form.find('#url').val();

            var map = {};
            map['layout'] = 'post';
            map['title'] = '"' + title + '"';
            map['date'] = date;
            map['track_id'] = id;
            if ('track' != kind) {
                map['track_kind'] = kind;

            }
            map['track_url'] = url;

            var dayFromDate = date.substring(0, 10);
            var fileName = dayFromDate + '-' + $form.find('#permalink').val() + '.md';

            repo.contents('_posts/' + fileName).add({
                path: '_posts/' + fileName,
                message: 'new post',
                content: Base64.encode(mapToContent(map))
            }).then(function() {
                    window.location.hash = '#/show/' + fileName;
                });


        },
        render: function () {
            this.$el.html($('#post-create-template').html());
        }
    });

    var Router = Backbone.Router.extend({
        routes: {
            "login": "login",
            "": "posts",
            "show/:fileName": "show",
            "edit/:fileName": "edit",
            "delete/:fileName": "delete",
            "create": "create"
        }
    });

    var router = new Router();
    router.on('route:login', function () {
        new LoginView().render();
    });
    router.on('route:posts', function () {
        new PostsView().render();
    });
    router.on('route:show', function (fileName) {
        new PostShowView().render({fileName: fileName});
    });
    router.on('route:edit', function (fileName) {
        new PostEditView().render({fileName: fileName});
    });
    router.on('route:delete', function (fileName) {
        new PostDeleteView().render({fileName: fileName});
    });

    router.on('route:create', function () {
        new PostCreateView().render();
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

    function disableForm($form) {
        $form.find('button[type=submit]').button('loading');
        $form.find('input').prop('disabled', true);
    }

    function enableForm($form) {
        $form.find('button[type=submit]').button('reset');
        $form.find('input').prop('disabled', false);
    }

    function formError($form, error) {
        $form.find('.error').remove();
        $form.prepend(_.template($('#error-template').html(), {error: error}));
        enableForm($form);
    }

    function pad(num) {
        norm = Math.abs(Math.floor(num));
        return (norm < 10 ? '0' : '') + norm;
    }

    function formatLocalDate() {
        var local = new Date();
        var tzo = -local.getTimezoneOffset();
        var sign = tzo >= 0 ? '+' : '-';
        return local.getFullYear()
            + '-' + pad(local.getMonth()+1)
            + '-' + pad(local.getDate())
            + ' ' + pad(local.getHours())
            + ':' + pad(local.getMinutes())
            + ':' + pad(local.getSeconds())
            + ' ' +sign + pad(tzo / 60) + pad(tzo % 60);
    }

})();