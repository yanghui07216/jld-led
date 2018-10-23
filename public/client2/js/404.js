(function() {

    $(function() {

        var TPL_IMG_ITEM = [
            '<div class="article right hidden" type="image" articleid="${id}">',
            '   <div class="cover"></div>',
            '   <div class="title limit-row-2">${title}</div>',
            '</div>'
        ].join('');

        var TPL_VIDEO_ITEM = [
            '<div class="article right hidden" type="video" articleid="${id}">',
            '   <div class="cover no-loading">',
            '       <div class="player"></div>',
            '   </div>',
            '   <div class="title limit-row-2">${title}</div>',
            '</div>'
        ].join('');


        /**
         * 内存数据
         */

        var $page = $('.index');
        var _recommendArticles = [];
        var _uid;

        /**
         * 页面方法
         */

        getRecommendArticles();

        /**
         * 获取推荐区域内容列表
         */

        function getRecommendArticles(args) {
            var obj = {
                url: GI.webapi.base + GI.webapi.article.right,
                data: {
                    pagenum: 1,
                    pagesize: 8
                }
            };

            if (args) {
                obj.data = args;
            }

            GI.req(obj, function(result) {
                console.log(result);
                if (!result.data.length) {
                    return;
                }

                for (var i = 0, l = result.data.length; i < l; i++) {

                    /**
                     * 添加到本地缓存的条目中，防止重复
                     */

                    var item = result.data[i];
                    var exist = false;

                    for (var j = 0, k = _recommendArticles.length; j < k; j++) {
                        if (item.id === _recommendArticles[j].id) {
                            exist = true;
                            break;
                        }
                    }

                    if (!exist) {
                        _recommendArticles.push(item);

                        console.log('....', i, item);

                        if (item.coverStyle == 1) {

                            /**
                             * Video
                             */

                            var $item = $(GI.util.formatTpl(TPL_VIDEO_ITEM, item)).appendTo($page.find('.recommend-content'));

                        } else {

                            /**
                             * Image
                             */

                            var $item = $(GI.util.formatTpl(TPL_IMG_ITEM, item)).appendTo($page.find('.recommend-content'));
                        }

                        $item.removeClass('hidden');

                        if (item.imgArray.length) {
                            var coverImg = item.imgArray[0].url;
                            if (coverImg) {
                                $item.find('.cover').attr('url', coverImg);
                                GI.util.loadImage(coverImg, 'recommend');
                            }
                        }
                    }
                }
            })
        }

        /**
         * 监听事件
         */

        GI.Event.addListener('image.load', function(data) {

            var img = data.img;

            /**
             * 加载失败，获取到的type为fail
             */

            if (data.type == 'fail') {
                var $cover = $page.find('.cover[url="' + data.src + '"]');
                if ($cover.length) {
                    $cover.css({
                        background: '#FEFEFE url("/public/client2/img/fail.png") center center no-repeat',
                        backgroundSize: '150px auto'
                    })
                }
            }

            /**
             * 加载推荐区域的图片
             */

            if (data.type == 'recommend') {
                var $cover = $page.find('.recommend-content .cover[url="' + data.src + '"]');
                if ($cover.length) {
                    $cover.css({
                        background: '#fff url(' + img.src + ') center center no-repeat',
                        backgroundSize: 'cover'
                    })
                }
            }
        });


        /**
         * DOM 事件
         */

        $page.click(function(e) {
            var t = $(e.target);

            /**
             * 点击推荐条目
             */

            if (t.closest('.recommend-content').length) {
                if (t.closest('.article').attr('type') == 'image') {
                    var _type = 'item_404_bottom_recommend_image_link_click';
                } else if (t.closest('.article').attr('type') == 'video') {
                    var _type = 'item_404_bottom_recommend_video_link_click';
                }

                var _aid = t.closest('.article').attr('articleid');

                GI.Event.fireEvent('gi.kibana.statistics', {
                    type: _type,
                    id: _aid
                });

                GI.Event.fireEvent('gi.google.stat', {
                    event: _type,
                    obj: {
                        'event_category': 'user_click_item',
                        'env': GI.ENV,
                        'page_id': _aid
                    }
                });

                if (_aid) {
                    GI.ui.go('/article/' + _aid);
                } else {
                    GI.ui.go('/404');
                }
            }

            /**
             * Home
             */

            if (t.closest('.home-link').length) {
                GI.ui.go('/');
            }

            /**
             * Events
             */

            GI.Event.addListener('gi.kibana.statistics', function(data) {
                if (!data.device) {
                    data.device = GI.DEVICE();
                }
                if (!data.env) {
                    data.env = GI.ENV;
                }

                $.ajax({
                    url: GI.webapi.base + GI.webapi.es.stat,
                    method: 'POST',
                    data: {
                        data: JSON.stringify(data)
                    },
                    success: function(rst) {}
                })
            });

            GI.Event.addListener('gi.google.stat', function(data) {
                try {
                    return;
                    gtag('event', data.event, data.obj);
                } catch (e) {
                    console.log('GOOGLE ANALYTICS', e)
                }
            })

        });
    })
})();