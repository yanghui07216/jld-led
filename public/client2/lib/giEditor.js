/**
 * giEditor is a customed editor for GiGadgets.com
 */


(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (global.giEditor = factory());
}(this, (function() {

    'use strict';

    var polyfill = function() {
        if (typeof Object.assign != 'function') {
            Object.assign = function(target, varArgs) {
                if (target == null) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var to = Object(target);

                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];
                    if (nextSource != null) {
                        for (var nextKey in nextSource) {
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }
                return to;
            };
        }

        // IE 中兼容 Element.prototype.matches
        if (!Element.prototype.matches) {
            Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;
            };
        }
    };


    /**
     * DOM 操作 API
     */

    function createElemByHTML(html) {
        var div = void 0;
        div = document.createElement('div');
        div.innerHTML = html;
        return div.children;
    }


    function isDOMList(selector) {
        if (!selector) {
            return false;
        }
        if (selector instanceof HTMLCollection || selector instanceof NodeList) {
            return true;
        }
        return false;
    }

    function querySelectorAll(selector) {
        var result = document.querySelectorAll(selector);
        if (isDOMList(result)) {
            return result;
        } else {
            return [result];
        }
    }

    function DomElement(selector) {
        if (!selector) {
            return;
        }
        if (selector instanceof DomElement) {
            return selector;
        }

        this.selector = selector;
        var nodeType = selector.nodeType;

        var selectorResult = [];
        if (nodeType === 9) {
            selectorResult = [selector];
        } else if (nodeType === 1) {
            selectorResult = [selector];
        } else if (isDOMList(selector)) {
            selectorResult = selector;
        } else if (typeof selector === 'string') {
            selector = selector.replace('/\n/mg', '').trim();
            if (selector.indexOf('<') === 0) {
                selectorResult = createElemByHTML(selector);
            } else {
                selectorResult = querySelectorAll(selector);
            }
        }

        var length = selectorResult.length;
        if (!length) {
            return this;
        }

        var i = void 0;
        for (i = 0; i < length; i++) {
            this[i] = selectorResult[i];
        }
        this.length = length;
    }

    // 修改原型
    DomElement.prototype = {
        constructor: DomElement,

        forEach: function forEach(fn) {
            var i = void 0;
            for (i = 0; i < this.length; i++) {
                var elem = this[i];
                var result = fn.call(elem, elem, i);
                if (result === false) {
                    break;
                }
            }
            return this;
        },

        get: function get(index) {
            var length = this.length;
            if (index >= length) {
                index = index % length;
            }
            return $(this[index]);
        },

        first: function first() {
            return this.get(0);
        },

        last: function last() {
            var length = this.length;
            return this.get(length - 1);
        },

        on: function on(type, selector, fn) {
            if (!fn) {
                fn = selector;
                selector = null;
            }

            var types = [];
            types = type.split(/\s+/);

            return this.forEach(function(elem) {
                types.forEach(function(type) {
                    if (!type) {
                        return;
                    }

                    if (!selector) {
                        elem.addEventListener(type, fn, false);
                        return;
                    }

                    elem.addEventListener(type, function(e) {
                        var target = e.target;
                        if (target.matches(selector)) {
                            fn.call(target, e);
                        }
                    }, false);
                });
            });
        },

        off: function off(type, fn) {
            return this.forEach(function(elem) {
                elem.removeEventListener(type, fn, false);
            });
        },

        attr: function attr(key, val) {
            if (val == null) {
                return this[0].getAttribute(key);
            } else {
                return this.forEach(function(elem) {
                    elem.setAttribute(key, val);
                });
            }
        },

        addClass: function addClass(className) {
            if (!className) {
                return this;
            }
            return this.forEach(function(elem) {
                var arr = void 0;
                if (elem.className) {
                    arr = elem.className.split(/\s/);
                    arr = arr.filter(function(item) {
                        return !!item.trim();
                    });
                    if (arr.indexOf(className) < 0) {
                        arr.push(className);
                    }
                    elem.className = arr.join(' ');
                } else {
                    elem.className = className;
                }
            });
        },

        removeClass: function removeClass(className) {
            if (!className) {
                return this;
            }
            return this.forEach(function(elem) {
                var arr = void 0;
                if (elem.className) {
                    arr = elem.className.split(/\s/);
                    arr = arr.filter(function(item) {
                        item = item.trim();
                        // 删除 class
                        if (!item || item === className) {
                            return false;
                        }
                        return true;
                    });
                    elem.className = arr.join(' ');
                }
            });
        },

        css: function css(key, val) {
            var currentStyle = key + ':' + val + ';';
            return this.forEach(function(elem) {
                var style = (elem.getAttribute('style') || '').trim();
                var styleArr = void 0,
                    resultArr = [];
                if (style) {
                    styleArr = style.split(';');
                    styleArr.forEach(function(item) {
                        var arr = item.split(':').map(function(i) {
                            return i.trim();
                        });
                        if (arr.length === 2) {
                            resultArr.push(arr[0] + ':' + arr[1]);
                        }
                    });
                    resultArr = resultArr.map(function(item) {
                        if (item.indexOf(key) === 0) {
                            return currentStyle;
                        } else {
                            return item;
                        }
                    });
                    if (resultArr.indexOf(currentStyle) < 0) {
                        resultArr.push(currentStyle);
                    }
                    elem.setAttribute('style', resultArr.join('; '));
                } else {
                    elem.setAttribute('style', currentStyle);
                }
            });
        },

        show: function show() {
            return this.css('display', 'block');
        },

        hide: function hide() {
            return this.css('display', 'none');
        },

        children: function children() {
            var elem = this[0];
            if (!elem) {
                return null;
            }

            return $(elem.children);
        },

        // 增加子节点
        append: function append($children) {
            return this.forEach(function(elem) {
                $children.forEach(function(child) {
                    elem.appendChild(child);
                });
            });
        },

        // 移除当前节点
        remove: function remove() {
            return this.forEach(function(elem) {
                if (elem.remove) {
                    elem.remove();
                } else {
                    var parent = elem.parentElement;
                    parent && parent.removeChild(elem);
                }
            });
        },

        // 是否包含某个子节点
        isContain: function isContain($child) {
            var elem = this[0];
            var child = $child[0];
            return elem.contains(child);
        },

        // 尺寸数据
        getSizeData: function getSizeData() {
            var elem = this[0];
            return elem.getBoundingClientRect();
            // 可得到 bottom height left right top width 的数据
        },

        // 封装 nodeName
        getNodeName: function getNodeName() {
            var elem = this[0];
            return elem.nodeName;
        },

        // 从当前元素查找
        find: function find(selector) {
            var elem = this[0];
            return $(elem.querySelectorAll(selector));
        },

        // 获取当前元素的 text
        text: function text(val) {
            if (!val) {
                // 获取 text
                var elem = this[0];
                return elem.innerHTML.replace(/<.*?>/g, function() {
                    return '';
                });
            } else {
                // 设置 text
                return this.forEach(function(elem) {
                    elem.innerHTML = val;
                });
            }
        },

        // 获取 html
        html: function html(value) {
            var elem = this[0];
            if (value == null) {
                return elem.innerHTML;
            } else {
                elem.innerHTML = value;
                return this;
            }
        },

        // 获取 value
        val: function val() {
            var elem = this[0];
            return elem.value.trim();
        },

        // focus
        focus: function focus() {
            return this.forEach(function(elem) {
                elem.focus();
            });
        },

        // parent
        parent: function parent() {
            var elem = this[0];
            return $(elem.parentElement);
        },

        // parentUntil 找到符合 selector 的父节点
        parentUntil: function parentUntil(selector, _currentElem) {
            var results = document.querySelectorAll(selector);
            var length = results.length;
            if (!length) {
                // 传入的 selector 无效
                return null;
            }

            var elem = _currentElem || this[0];
            if (elem.nodeName === 'BODY') {
                return null;
            }

            var parent = elem.parentElement;
            var i = void 0;
            for (i = 0; i < length; i++) {
                if (parent === results[i]) {
                    // 找到，并返回
                    return $(parent);
                }
            }

            // 继续查找
            return this.parentUntil(selector, parent);
        },

        // 判断两个 elem 是否相等
        equal: function equal($elem) {
            if ($elem.nodeType === 1) {
                return this[0] === $elem;
            } else {
                return this[0] === $elem[0];
            }
        },

        // 将该元素插入到某个元素前面
        insertBefore: function insertBefore(selector) {
            var $referenceNode = $(selector);
            var referenceNode = $referenceNode[0];
            if (!referenceNode) {
                return this;
            }
            return this.forEach(function(elem) {
                var parent = referenceNode.parentNode;
                parent.insertBefore(elem, referenceNode);
            });
        },

        // 将该元素插入到某个元素后面
        insertAfter: function insertAfter(selector) {
            var $referenceNode = $(selector);
            var referenceNode = $referenceNode[0];
            if (!referenceNode) {
                return this;
            }
            return this.forEach(function(elem) {
                var parent = referenceNode.parentNode;
                if (parent.lastChild === referenceNode) {
                    // 最后一个元素
                    parent.appendChild(elem);
                } else {
                    // 不是最后一个元素
                    parent.insertBefore(elem, referenceNode.nextSibling);
                }
            });
        }
    };

    // new 一个对象
    function $(selector) {
        return new DomElement(selector);
    }

    /*
        配置信息
    */

    var config = {
        zIndex: 10000,
        pasteFilterStyle: false,
        pasteTextHandle: function pasteTextHandle(content) {
            return content;
        },
        showLinkImg: false,

        uploadImgMaxSize: 3 * 1024 * 1024,
        uploadImgMaxLength: 1,
        uploadImgShowBase64: false,

        // 上传图片的自定义参数
        uploadImgParams: {
            // token: 'abcdef12345'
        },

        // 上传图片的自定义header
        uploadImgHeaders: {
            Authorization: GI.util.ls.get('BASE').token
        },

        // 配置 XHR withCredentials
        withCredentials: false,

        // 自定义上传图片超时时间 ms
        uploadImgTimeout: 30000,

        // 上传图片 hook 
        uploadImgHooks: {
            // customInsert: function (insertLinkImg, result, editor) {
            //     console.log('customInsert')
            //     // 图片上传并返回结果，自定义插入图片的事件，而不是编辑器自动插入图片
            //     const data = result.data1 || []
            //     data.forEach(link => {
            //         insertLinkImg(link)
            //     })
            // },
            before: function before(xhr, editor, files) {
                // 图片上传之前触发

                // 如果返回的结果是 {prevent: true, msg: 'xxxx'} 则表示用户放弃上传
                // return {
                //     prevent: true,
                //     msg: '放弃上传'
                // }
            },
            success: function success(xhr, editor, result) {
                // 图片上传并返回结果，图片插入成功之后触发
            },
            fail: function fail(xhr, editor, result) {
                // 图片上传并返回结果，但图片插入错误时触发
            },
            error: function error(xhr, editor) {
                // 图片上传出错时触发
            },
            timeout: function timeout(xhr, editor) {
                // 图片上传超时时触发
            }
        },
    };

    /*
        工具
    */

    // 和 UA 相关的属性
    var UA = {
        _ua: navigator.userAgent,
        isWebkit: function isWebkit() {
            var reg = /webkit/i;
            return reg.test(this._ua);
        },
        isIE: function isIE() {
            return 'ActiveXObject' in window;
        }
    };

    // 遍历对象
    function objForEach(obj, fn) {
        var key = void 0,
            result = void 0;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                result = fn.call(obj, key, obj[key]);
                if (result === false) {
                    break;
                }
            }
        }
    }

    // 遍历类数组
    function arrForEach(fakeArr, fn) {
        var i = void 0,
            item = void 0,
            result = void 0;
        var length = fakeArr.length || 0;
        for (i = 0; i < length; i++) {
            item = fakeArr[i];
            result = fn.call(fakeArr, item, i);
            if (result === false) {
                break;
            }
        }
    }

    // 获取随机数
    function getRandom(prefix) {
        return prefix + Math.random().toString().slice(2);
    }

    // 替换 html 特殊字符
    function replaceHtmlSymbol(html) {
        if (html == null) {
            return '';
        }
        return html.replace(/</gm, '&lt;').replace(/>/gm, '&gt;').replace(/"/gm, '&quot;');
    }



    function Bold(editor) {
        this.editor = editor;
        var _elem = [
            '<div class="w-e-menu">',
            '   <i class="w-e-icon-bold"></i>',
            '</div>'
        ].join('');
        this.$elem = $(_elem);
        this.type = 'click';
        this._active = false;
    }
    Bold.prototype = {
        constructor: Bold,
        onClick: function onClick(e) {
            var editor = this.editor;
            var isSeleEmpty = editor.selection.isSelectionEmpty();

            if (isSeleEmpty) {
                editor.selection.createEmptyRange();
            }
            editor.cmd.do('bold');

            if (isSeleEmpty) {
                editor.selection.collapseRange();
                editor.selection.restoreSelection();
            }
        },
        tryChangeActive: function tryChangeActive(e) {
            var editor = this.editor;
            var $elem = this.$elem;
            if (editor.cmd.queryCommandState('bold')) {
                this._active = true;
                $elem.addClass('w-e-active');
            } else {
                this._active = false;
                $elem.removeClass('w-e-active');
            }
        }
    };



    // Replace multi language
    var replaceLang = function(editor, str) {
        var langArgs = editor.config.langArgs || [];
        var result = str;

        langArgs.forEach(function(item) {
            var reg = item.reg;
            var val = item.val;
            if (reg.test(result)) {
                result = result.replace(reg, function() {
                    return val;
                });
            }
        });

        return result;
    };

    // Droplist
    var _emptyFn = function _emptyFn() {};

    // 构造函数
    function DropList(menu, opt) {
        var _this = this;

        // droplist 所依附的菜单
        var editor = menu.editor;
        this.menu = menu;
        this.opt = opt;
        // 容器
        var $container = $('<div class="w-e-droplist"></div>');

        // 标题
        var $title = opt.$title;
        var titleHtml = void 0;
        if ($title) {
            // 替换多语言
            titleHtml = $title.html();
            titleHtml = replaceLang(editor, titleHtml);
            $title.html(titleHtml);

            $title.addClass('w-e-dp-title');
            $container.append($title);
        }

        var list = opt.list || [];
        var type = opt.type || 'list'; // 'list' 列表形式（如“标题”菜单） / 'inline-block' 块状形式（如“颜色”菜单）
        var onClick = opt.onClick || _emptyFn;

        // 加入 DOM 并绑定事件
        var $list = $('<ul class="' + (type === 'list' ? 'w-e-list' : 'w-e-block') + '"></ul>');
        $container.append($list);
        list.forEach(function(item) {
            var $elem = item.$elem;

            // 替换多语言
            var elemHtml = $elem.html();
            elemHtml = replaceLang(editor, elemHtml);
            $elem.html(elemHtml);

            var value = item.value;
            var $li = $('<li class="w-e-item"></li>');
            if ($elem) {
                $li.append($elem);
                $list.append($li);
                $elem.on('click', function(e) {
                    onClick(value);

                    // 隐藏
                    _this.hideTimeoutId = setTimeout(function() {
                        _this.hide();
                    }, 0);
                });
            }
        });

        // 绑定隐藏事件
        $container.on('mouseleave', function(e) {
            _this.hideTimeoutId = setTimeout(function() {
                _this.hide();
            }, 0);
        });

        // 记录属性
        this.$container = $container;

        // 基本属性
        this._rendered = false;
        this._show = false;
    }

    // 原型
    DropList.prototype = {
        constructor: DropList,

        // 显示（插入DOM）
        show: function show() {
            if (this.hideTimeoutId) {
                // 清除之前的定时隐藏
                clearTimeout(this.hideTimeoutId);
            }

            var menu = this.menu;
            var $menuELem = menu.$elem;
            var $container = this.$container;
            if (this._show) {
                return;
            }
            if (this._rendered) {
                // 显示
                $container.show();
            } else {
                // 加入 DOM 之前先定位位置
                var menuHeight = $menuELem.getSizeData().height || 0;
                var width = this.opt.width || 100; // 默认为 100
                $container.css('margin-top', menuHeight + 'px').css('width', width + 'px');

                // 加入到 DOM
                $menuELem.append($container);
                this._rendered = true;
            }

            // 修改属性
            this._show = true;
        },

        // 隐藏（移除DOM）
        hide: function hide() {
            if (this.showTimeoutId) {
                // 清除之前的定时显示
                clearTimeout(this.showTimeoutId);
            }

            var $container = this.$container;
            if (!this._show) {
                return;
            }
            // 隐藏并需改属性
            $container.hide();
            this._show = false;
        }
    };


    function Head(editor) {
        var _this = this;

        this.editor = editor;
        this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-header"><i/></div>');
        this.type = 'droplist';
        this._active = false;

        this.droplist = new DropList(this, {
            width: 100,
            $title: $('<p>Set Font</p>'),
            type: 'list', // droplist 以列表形式展示
            list: [{
                $elem: $('<h1>H1</h1>'),
                value: '<h1>'
            }, {
                $elem: $('<h2>H2</h2>'),
                value: '<h2>'
            }, {
                $elem: $('<h3>H3</h3>'),
                value: '<h3>'
            }, {
                $elem: $('<h4>H4</h4>'),
                value: '<h4>'
            }, {
                $elem: $('<h5>H5</h5>'),
                value: '<h5>'
            }, {
                $elem: $('<p>Normal</p>'),
                value: '<p>'
            }],
            onClick: function onClick(value) {
                _this._command(value);
            }
        });
    }
    Head.prototype = {
        constructor: Head,
        _command: function _command(value) {
            var editor = this.editor;

            var $selectionElem = editor.selection.getSelectionContainerElem();
            if (editor.$textElem.equal($selectionElem)) {
                return;
            }

            editor.cmd.do('formatBlock', value);
        },
        tryChangeActive: function tryChangeActive(e) {
            var editor = this.editor;
            var $elem = this.$elem;
            var reg = /^h/i;
            var cmdValue = editor.cmd.queryCommandValue('formatBlock');
            if (reg.test(cmdValue)) {
                this._active = true;
                $elem.addClass('w-e-active');
            } else {
                this._active = false;
                $elem.removeClass('w-e-active');
            }
        }
    };

    /*
        panel
    */

    var emptyFn = function emptyFn() {};

    // 记录已经显示 panel 的菜单
    var _isCreatedPanelMenus = [];

    // 构造函数
    function Panel(menu, opt) {
        this.menu = menu;
        this.opt = opt;
    }

    // 原型
    Panel.prototype = {
        constructor: Panel,

        // 显示（插入DOM）
        show: function show() {
            var _this = this;

            var menu = this.menu;
            if (_isCreatedPanelMenus.indexOf(menu) >= 0) {
                // 该菜单已经创建了 panel 不能再创建
                return;
            }

            var editor = menu.editor;
            var $body = $('body');
            var $textContainerElem = editor.$textContainerElem;
            var opt = this.opt;

            // panel 的容器
            var $container = $('<div class="w-e-panel-container"></div>');
            var width = opt.width || 300; // 默认 300px
            $container.css('width', width + 'px').css('margin-left', (0 - width) / 2 + 'px');

            // 添加关闭按钮
            var $closeBtn = $('<i class="w-e-icon-close w-e-panel-close"></i>');
            $container.append($closeBtn);
            $closeBtn.on('click', function() {
                _this.hide();
            });

            // 准备 tabs 容器
            var $tabTitleContainer = $('<ul class="w-e-panel-tab-title"></ul>');
            var $tabContentContainer = $('<div class="w-e-panel-tab-content"></div>');
            $container.append($tabTitleContainer).append($tabContentContainer);

            // 设置高度
            var height = opt.height;
            if (height) {
                $tabContentContainer.css('height', height + 'px').css('overflow-y', 'auto');
            }

            // tabs
            var tabs = opt.tabs || [];
            var tabTitleArr = [];
            var tabContentArr = [];
            tabs.forEach(function(tab, tabIndex) {
                if (!tab) {
                    return;
                }
                var title = tab.title || '';
                var tpl = tab.tpl || '';

                // 替换多语言
                title = replaceLang(editor, title);
                tpl = replaceLang(editor, tpl);

                // 添加到 DOM
                var $title = $('<li class="w-e-item">' + title + '</li>');
                $tabTitleContainer.append($title);
                var $content = $(tpl);
                $tabContentContainer.append($content);

                // 记录到内存
                $title._index = tabIndex;
                tabTitleArr.push($title);
                tabContentArr.push($content);

                // 设置 active 项
                if (tabIndex === 0) {
                    $title._active = true;
                    $title.addClass('w-e-active');
                } else {
                    $content.hide();
                }

                // 绑定 tab 的事件
                $title.on('click', function(e) {
                    if ($title._active) {
                        return;
                    }
                    // 隐藏所有的 tab
                    tabTitleArr.forEach(function($title) {
                        $title._active = false;
                        $title.removeClass('w-e-active');
                    });
                    tabContentArr.forEach(function($content) {
                        $content.hide();
                    });

                    // 显示当前的 tab
                    $title._active = true;
                    $title.addClass('w-e-active');
                    $content.show();
                });
            });

            // 绑定关闭事件
            $container.on('click', function(e) {
                // 点击时阻止冒泡
                e.stopPropagation();
            });
            $body.on('click', function(e) {
                _this.hide();
            });

            // 添加到 DOM
            $textContainerElem.append($container);

            // 绑定 opt 的事件，只有添加到 DOM 之后才能绑定成功
            tabs.forEach(function(tab, index) {
                if (!tab) {
                    return;
                }
                var events = tab.events || [];
                events.forEach(function(event) {
                    var selector = event.selector;
                    var type = event.type;
                    var fn = event.fn || emptyFn;
                    var $content = tabContentArr[index];
                    $content.find(selector).on(type, function(e) {
                        e.stopPropagation();
                        var needToHide = fn(e);
                        // 执行完事件之后，是否要关闭 panel
                        if (needToHide) {
                            _this.hide();
                        }
                    });
                });
            });

            // focus 第一个 elem
            var $inputs = $container.find('input[type=text],textarea');
            if ($inputs.length) {
                $inputs.get(0).focus();
            }

            // 添加到属性
            this.$container = $container;

            // 隐藏其他 panel
            this._hideOtherPanels();
            // 记录该 menu 已经创建了 panel
            _isCreatedPanelMenus.push(menu);
        },

        // 隐藏（移除DOM）
        hide: function hide() {
            var menu = this.menu;
            var $container = this.$container;
            if ($container) {
                $container.remove();
            }

            // 将该 menu 记录中移除
            _isCreatedPanelMenus = _isCreatedPanelMenus.filter(function(item) {
                if (item === menu) {
                    return false;
                } else {
                    return true;
                }
            });
        },

        // 一个 panel 展示时，隐藏其他 panel
        _hideOtherPanels: function _hideOtherPanels() {
            if (!_isCreatedPanelMenus.length) {
                return;
            }
            _isCreatedPanelMenus.forEach(function(menu) {
                var panel = menu.panel || {};
                if (panel.hide) {
                    panel.hide();
                }
            });
        }
    };

    /*
        menu - link
    */

    function Link(editor) {
        this.editor = editor;
        this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-link"><i/></div>');
        this.type = 'panel';

        this._active = false;
    }

    Link.prototype = {
        constructor: Link,

        onClick: function onClick(e) {
            var editor = this.editor;
            var $linkelem = void 0;

            if (this._active) {
                $linkelem = editor.selection.getSelectionContainerElem();
                if (!$linkelem) {
                    return;
                }
                editor.selection.createRangeByElem($linkelem);
                editor.selection.restoreSelection();
                this._createPanel($linkelem.text(), $linkelem.attr('href'));
            } else {
                if (editor.selection.isSelectionEmpty()) {
                    this._createPanel('', '');
                } else {
                    this._createPanel(editor.selection.getSelectionText(), '');
                }
            }
        },

        _createPanel: function _createPanel(text, link) {
            var _this = this;

            var inputLinkId = getRandom('input-link');
            var inputTextId = getRandom('input-text');
            var btnOkId = getRandom('btn-ok');
            var btnDelId = getRandom('btn-del');

            var delBtnDisplay = this._active ? 'inline-block' : 'none';

            var panel = new Panel(this, {
                width: 300,
                tabs: [{
                    title: 'Link',
                    tpl: '<div>\n<input id="' + inputTextId + '" type="text" class="block" value="' + text + '" placeholder="\u94FE\u63A5\u6587\u5B57"/></td>\n                            <input id="' + inputLinkId + '" type="text" class="block" value="' + link + '" placeholder="http://..."/></td>\n                            <div class="w-e-button-container">\n                                <button id="' + btnOkId + '" class="right">\u63D2\u5165</button>\n                                <button id="' + btnDelId + '" class="gray right" style="display:' + delBtnDisplay + '">\u5220\u9664\u94FE\u63A5</button>\n                            </div>\n                        </div>',
                    events: [{
                        selector: '#' + btnOkId,
                        type: 'click',
                        fn: function fn() {
                            var $link = $('#' + inputLinkId);
                            var $text = $('#' + inputTextId);
                            var link = $link.val();
                            var text = $text.val();
                            _this._insertLink(text, link);


                            return true;
                        }
                    }, {
                        selector: '#' + btnDelId,
                        type: 'click',
                        fn: function fn() {
                            _this._delLink();
                            return true;
                        }
                    }]
                }]
            });

            panel.show();
            this.panel = panel;
        },

        _delLink: function _delLink() {
            if (!this._active) {
                return;
            }
            var editor = this.editor;
            var $selectionELem = editor.selection.getSelectionContainerElem();
            if (!$selectionELem) {
                return;
            }
            var selectionText = editor.selection.getSelectionText();
            editor.cmd.do('insertHTML', '<span>' + selectionText + '</span>');
        },

        _insertLink: function _insertLink(text, link) {
            if (!text || !link) {
                return;
            }
            var editor = this.editor;
            var config = editor.config;
            var linkCheck = config.linkCheck;
            var checkResult = true;
            if (linkCheck && typeof linkCheck === 'function') {
                checkResult = linkCheck(text, link);
            }
            if (checkResult === true) {
                editor.cmd.do('insertHTML', '<a href="' + link + '" target="_blank">' + text + '</a>');
            } else {
                alert(checkResult);
            }
        },

        tryChangeActive: function tryChangeActive(e) {
            var editor = this.editor;
            var $elem = this.$elem;
            var $selectionELem = editor.selection.getSelectionContainerElem();
            if (!$selectionELem) {
                return;
            }
            if ($selectionELem.getNodeName() === 'A') {
                this._active = true;
                $elem.addClass('w-e-active');
            } else {
                this._active = false;
                $elem.removeClass('w-e-active');
            }
        }
    };

    /*
        italic-menu
    */

    function Italic(editor) {
        this.editor = editor;
        this.$elem = $('<div class="w-e-menu">\n            <i class="w-e-icon-italic"><i/>\n        </div>');
        this.type = 'click';
        this._active = false;
    }

    Italic.prototype = {
        constructor: Italic,

        // 点击事件
        onClick: function onClick(e) {
            // 点击菜单将触发这里

            var editor = this.editor;
            var isSeleEmpty = editor.selection.isSelectionEmpty();

            if (isSeleEmpty) {
                // 选区是空的，插入并选中一个“空白”
                editor.selection.createEmptyRange();
            }

            // 执行 italic 命令
            editor.cmd.do('italic');

            if (isSeleEmpty) {
                // 需要将选取折叠起来
                editor.selection.collapseRange();
                editor.selection.restoreSelection();
            }
        },

        // 试图改变 active 状态
        tryChangeActive: function tryChangeActive(e) {
            var editor = this.editor;
            var $elem = this.$elem;
            if (editor.cmd.queryCommandState('italic')) {
                this._active = true;
                $elem.addClass('w-e-active');
            } else {
                this._active = false;
                $elem.removeClass('w-e-active');
            }
        }
    };


    /*
        underline-menu
    */

    function Underline(editor) {
        this.editor = editor;
        this.$elem = $('<div class="w-e-menu">\n            <i class="w-e-icon-underline"><i/>\n        </div>');
        this.type = 'click';
        this._active = false;
    }

    Underline.prototype = {
        constructor: Underline,

        // 点击事件
        onClick: function onClick(e) {
            // 点击菜单将触发这里

            var editor = this.editor;
            var isSeleEmpty = editor.selection.isSelectionEmpty();

            if (isSeleEmpty) {
                // 选区是空的，插入并选中一个“空白”
                editor.selection.createEmptyRange();
            }

            // 执行 underline 命令
            editor.cmd.do('underline');

            if (isSeleEmpty) {
                // 需要将选取折叠起来
                editor.selection.collapseRange();
                editor.selection.restoreSelection();
            }
        },

        // 试图改变 active 状态
        tryChangeActive: function tryChangeActive(e) {
            var editor = this.editor;
            var $elem = this.$elem;
            if (editor.cmd.queryCommandState('underline')) {
                this._active = true;
                $elem.addClass('w-e-active');
            } else {
                this._active = false;
                $elem.removeClass('w-e-active');
            }
        }
    };


    /*
        menu - Forecolor
    */

    function ForeColor(editor) {
        var _this = this;

        this.editor = editor;
        this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-pencil2"><i/></div>');
        this.type = 'droplist';
        this._active = false;

        this.droplist = new DropList(this, {
            width: 120,
            $title: $('<p>Font Color</p>'),
            type: 'inline-block',
            list: [{
                $elem: $('<i style="color:#000000;" class="w-e-icon-pencil2"></i>'),
                value: '#000000'
            }, {
                $elem: $('<i style="color:#eeece0;" class="w-e-icon-pencil2"></i>'),
                value: '#eeece0'
            }, {
                $elem: $('<i style="color:#1c487f;" class="w-e-icon-pencil2"></i>'),
                value: '#1c487f'
            }, {
                $elem: $('<i style="color:#4d80bf;" class="w-e-icon-pencil2"></i>'),
                value: '#4d80bf'
            }, {
                $elem: $('<i style="color:#c24f4a;" class="w-e-icon-pencil2"></i>'),
                value: '#c24f4a'
            }, {
                $elem: $('<i style="color:#8baa4a;" class="w-e-icon-pencil2"></i>'),
                value: '#8baa4a'
            }, {
                $elem: $('<i style="color:#7b5ba1;" class="w-e-icon-pencil2"></i>'),
                value: '#7b5ba1'
            }, {
                $elem: $('<i style="color:#46acc8;" class="w-e-icon-pencil2"></i>'),
                value: '#46acc8'
            }, {
                $elem: $('<i style="color:#f9963b;" class="w-e-icon-pencil2"></i>'),
                value: '#f9963b'
            }, {
                $elem: $('<i style="color:#ffffff;" class="w-e-icon-pencil2"></i>'),
                value: '#ffffff'
            }],
            onClick: function onClick(value) {
                _this._command(value);
            }
        });
    }

    ForeColor.prototype = {
        constructor: ForeColor,
        _command: function _command(value) {
            var editor = this.editor;
            editor.cmd.do('foreColor', value);
        }
    };

    /*
        menu - video
    */

    function Video(editor) {
        this.editor = editor;
        this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-play"><i/></div>');
        this.type = 'panel';
        this._active = false;
    }

    Video.prototype = {
        constructor: Video,
        onClick: function onClick() {
            this._createPanel();
        },
        _createPanel: function _createPanel() {
            var _this = this;

            var textValId = getRandom('text-val');
            var btnId = getRandom('btn');

            var testVideo = "<iframe height=498 width=510 src='http://player.youku.com/embed/XMjcwMzc3MzM3Mg==' frameborder=0 'allowfullscreen'></iframe>"

            var panel = new Panel(this, {
                width: 350,
                tabs: [{
                    title: 'Insert Video',
                    tpl: [
                        '<div id="' + textValId + '">',
                        '   <label>Video</label>',
                        '   <input type="text" class="block" name="video" value="' + testVideo + '" />',
                        '   <label>Title</label>',
                        '   <input type="text" class="block" name="title" />',
                        '   <label>source</label>',
                        '   <input type="text" class="block" name="source" />',
                        '   <div class="w-e-button-container">',
                        '       <div id="' + btnId + '" class="right">Insert</div>',
                        '   </div>',
                        '</div>'
                    ].join(''),
                    events: [{
                        selector: '#' + btnId,
                        type: 'click',
                        fn: function fn() {
                            var _video = $('#' + textValId).find('input[name="video"]').val().trim();
                            var _title = $('#' + textValId).find('input[name="title"]').val().trim() || '';
                            var _source = $('#' + textValId).find('input[name="source"]').val().trim() || '';

                            if (_video) {
                                _this._insert(_video, _title, _source);
                                return true;
                            }
                        }
                    }]
                }]
            });
            panel.show();
            this.panel = panel;
        },

        _insert: function _insert(_video, _title, _source) {
            var editor = this.editor;

            var $video = [
                '<div class="gi-video">',
                '   <div class="video-item">' + _video + '</div>',
                '   <div class="title-item">' + _title + '</div>',
                '   <div class="source-item">' + _source + '</div>',
                '</div>'
            ].join('');

            editor.cmd.do('insertHTML', $video);
        }
    };


    /**
     * Menu - Product
     */

    function Product(editor) {
        this.editor = editor;
        this.$elem = $('<div class="w-e-menu"><i class="fa fa-shopping-cart"><i/></div>');
        this.type = 'panel';
        this._active = false;
    }

    Product.prototype = {
        constructor: Product,
        onClick: function onClick() {
            this._createPanel();
        },
        _createPanel: function _createPanel() {
            var _this = this;

            var textValId = getRandom('text-val');
            var btnId = getRandom('btn');

            var panel = new Panel(this, {
                width: 350,
                tabs: [{
                    title: 'Insert Product',
                    tpl: [
                        '<div id="' + textValId + '">',
                        '   <label>Search Product</label>',
                        '   <input type="text" class="block" pid="" name="product" placeholder="input to search product" />',
                        '   <div class="product-checking-list"></div>',
                        '</div>'
                    ].join(''),
                    events: []
                }]
            });

            panel.show();
            this.panel = panel;

            GI.Event.fireEvent('product.panel.show', {
                id: textValId
            });
            GI.Event.addListener('product.item.insert', function(_item) {
                _this._insert(_item);
            })
        },

        _insert: function _insert(_product) {
            var editor = this.editor;

            var $product = [
                '<p>',
                '   <br />',
                '   <div class="gi-editor-product row">',
                '      <div class="product-item col-sm-4">',
                '          <div class="cover-item" style="background:url(' + _product.cover + ') center center no-repeat;background-size:cover;"></div>',
                '      </div>',
                '      <div class="product-info col-sm-8">',
                '          <div class="title-item col-sm-12">' + _product.desc + '</div>',
                '          <div class="price-item col-sm-6">$ ' + _product.price + '</div>',
                '          <div class="source-item col-sm-6 text-right">' + _product.seller + '</div>',
                '      </div>',
                '   </div>',
                '   <br />',
                '</p>'
            ].join('');

            editor.cmd.do('insertHTML', $product);
        }
    };



    /*
        menu - img
    */

    function Image(editor) {
        this.editor = editor;
        var imgMenuId = getRandom('w-e-img');
        this.$elem = $('<div class="w-e-menu" id="' + imgMenuId + '"><i class="w-e-icon-image"><i/></div>');
        editor.imgMenuId = imgMenuId;
        this.type = 'panel';
        this._active = false;
    }

    // 原型
    Image.prototype = {
        constructor: Image,

        onClick: function onClick() {
            var editor = this.editor;
            var config = editor.config;

            if (this._active) {
                this._createEditPanel();
            } else {
                this._createInsertPanel();
            }
        },

        _createEditPanel: function _createEditPanel() {
            var editor = this.editor;

            // id
            var textValId = getRandom('text-val');
            var saveBtn = getRandom('save-btn');

            // tab 配置
            var tabsConfig = [{
                title: 'Edit Image',
                tpl: [
                    '<div id="' + textValId + '">',
                    '   <div class="w-e-button-container" style="border-bottom:1px solid #f1f1f1;padding-bottom:5px;margin-bottom:5px;">',
                    '       <div class="w-e-button-container">',
                    '           <label>Title</label>',
                    '           <input type="text" class="block" name="title" />',
                    '           <label>source</label>',
                    '           <input type="text" class="block" name="source" />',
                    '       </div>',
                    '       <div class="w-e-button-container">',
                    '           <div id="' + saveBtn + '" class="gray left">Save</div>',
                    '       </div>',
                    '   </div>',
                    '</div>'
                ].join(''),
                events: [{
                    selector: '#' + saveBtn,
                    type: 'click',
                    fn: function fn() {
                        var $img = editor._selectedImg;
                        if ($img) {
                            var $imgBlock = $img.parent();

                            $imgBlock.find('.img-title').html($('#' + textValId).find('input[name="title"]').val());
                            $imgBlock.find('.img-source').html($('#' + textValId).find('input[name="source"]').val());
                        }
                        return true;
                    }
                }]
            }];

            // 创建 panel 并显示
            var panel = new Panel(this, {
                width: 300,
                tabs: tabsConfig
            });
            panel.show();

            // 记录属性
            this.panel = panel;
        },

        _createInsertPanel: function _createInsertPanel() {
            var editor = this.editor;
            var uploadImg = editor.uploadImg;
            var config = editor.config;

            var upTriggerId = getRandom('up-trigger');
            var upFileId = getRandom('up-file');
            var linkUrlId = getRandom('link-url');
            var linkBtnId = getRandom('link-btn');

            var _tpl = [
                '<div class="w-e-up-img-container">',
                '   <div id="' + upTriggerId + '" class="w-e-up-btn">',
                '       <i class="w-e-icon-upload2"></i>',
                '   </div>',
                '   <div style="display:none;">',
                '       <input id="' + upFileId + '" type="file" multiple="multiple" accept="image/jpg,image/jpeg,image/png,image/gif"/>',
                '   </div>',
                '</div>'
            ].join('');

            var tabsConfig = [{
                title: 'Upload Image',
                tpl: _tpl,
                events: [{
                    selector: '#' + upTriggerId,
                    type: 'click',
                    fn: function fn() {
                        var $file = $('#' + upFileId);
                        var fileElem = $file[0];
                        if (fileElem) {
                            fileElem.click();
                        } else {
                            return true;
                        }
                    }
                }, {
                    selector: '#' + upFileId,
                    type: 'change',
                    fn: function fn() {
                        var $file = $('#' + upFileId);
                        var fileElem = $file[0];
                        if (!fileElem) {
                            return true;
                        }

                        var fileList = fileElem.files;
                        if (fileList.length) {
                            uploadImg.uploadImg(fileList);
                        }

                        return true;
                    }
                }]
            }];

            var tabsConfigResult = [];

            tabsConfigResult.push(tabsConfig[0]);
            var panel = new Panel(this, {
                width: 300,
                tabs: tabsConfigResult
            });
            panel.show();

            this.panel = panel;
        },

        tryChangeActive: function tryChangeActive(e) {
            var editor = this.editor;
            var $elem = this.$elem;
            if (editor._selectedImg) {
                this._active = true;
                $elem.addClass('w-e-active');
            } else {
                this._active = false;
                $elem.removeClass('w-e-active');
            }
        }
    };

    /**
     * 所有菜单的汇总
     */

    var MenuConstructors = {};
    MenuConstructors.bold = Bold;
    MenuConstructors.head = Head;
    MenuConstructors.link = Link;
    MenuConstructors.italic = Italic;
    MenuConstructors.underline = Underline;
    MenuConstructors.foreColor = ForeColor;
    MenuConstructors.video = Video;
    MenuConstructors.image = Image;
    MenuConstructors.product = Product;

    function Menus(editor) {
        this.editor = editor;
        this.menus = {};
    }

    Menus.prototype = {
        constructor: Menus,

        init: function init() {
            var _this = this;

            var editor = this.editor;
            var config = editor.config || {};
            var configMenus = config.menus || [];

            configMenus.forEach(function(menuKey) {
                var MenuConstructor = MenuConstructors[menuKey];
                if (MenuConstructor && typeof MenuConstructor === 'function') {
                    _this.menus[menuKey] = new MenuConstructor(editor);
                }
            });

            this._addToToolbar();
            this._bindEvent();
        },

        _addToToolbar: function _addToToolbar() {
            var editor = this.editor;
            var $toolbarElem = editor.$toolbarElem;
            var menus = this.menus;
            var config = editor.config;
            var zIndex = config.zIndex + 1;
            objForEach(menus, function(key, menu) {
                var $elem = menu.$elem;
                if ($elem) {
                    $elem.css('z-index', zIndex);
                    $toolbarElem.append($elem);
                }
            });
        },

        _bindEvent: function _bindEvent() {
            var menus = this.menus;
            var editor = this.editor;
            objForEach(menus, function(key, menu) {
                var type = menu.type;
                if (!type) {
                    return;
                }
                var $elem = menu.$elem;
                var droplist = menu.droplist;
                var panel = menu.panel;

                if (type === 'click' && menu.onClick) {
                    $elem.on('click', function(e) {
                        if (editor.selection.getRange() == null) {
                            return;
                        }
                        menu.onClick(e);
                    });
                }

                if (type === 'droplist' && droplist) {
                    $elem.on('mouseenter', function(e) {
                        if (editor.selection.getRange() == null) {
                            return;
                        }
                        droplist.showTimeoutId = setTimeout(function() {
                            droplist.show();
                        }, 200);
                    }).on('mouseleave', function(e) {
                        droplist.hideTimeoutId = setTimeout(function() {
                            droplist.hide();
                        }, 0);
                    });
                }

                if (type === 'panel' && menu.onClick) {
                    $elem.on('click', function(e) {
                        e.stopPropagation();
                        if (editor.selection.getRange() == null) {
                            return;
                        }
                        menu.onClick(e);
                    });
                }
            });
        },

        changeActive: function changeActive() {
            var menus = this.menus;
            objForEach(menus, function(key, menu) {
                if (menu.tryChangeActive) {
                    setTimeout(function() {
                        menu.tryChangeActive();
                    }, 100);
                }
            });
        }
    };


    /**
     * 粘贴信息的处理
     */

    function getPasteText(e) {
        var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData;
        var pasteText = void 0;
        if (clipboardData == null) {
            pasteText = window.clipboardData && window.clipboardData.getData('text');
        } else {
            pasteText = clipboardData.getData('text/plain');
        }

        return replaceHtmlSymbol(pasteText);
    }

    // 获取粘贴的html
    function getPasteHtml(e, filterStyle) {
        var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData;
        var pasteText = void 0,
            pasteHtml = void 0;
        if (clipboardData == null) {
            pasteText = window.clipboardData && window.clipboardData.getData('text');
        } else {
            pasteText = clipboardData.getData('text/plain');
            pasteHtml = clipboardData.getData('text/html');
        }
        if (!pasteHtml && pasteText) {
            pasteHtml = '<p>' + replaceHtmlSymbol(pasteText) + '</p>';
        }
        if (!pasteHtml) {
            return;
        }

        // 过滤word中状态过来的无用字符
        var docSplitHtml = pasteHtml.split('</html>');
        if (docSplitHtml.length === 2) {
            pasteHtml = docSplitHtml[0];
        }

        // 过滤无用标签
        pasteHtml = pasteHtml.replace(/<(meta|script|link).+?>/igm, '');
        // 去掉注释
        pasteHtml = pasteHtml.replace(/<!--.*?-->/mg, '');

        if (filterStyle) {
            // 过滤样式
            pasteHtml = pasteHtml.replace(/\s?(class|style)=('|").+?('|")/igm, '');
        } else {
            // 保留样式
            pasteHtml = pasteHtml.replace(/\s?class=('|").+?('|")/igm, '');
        }

        return pasteHtml;
    }

    // 获取粘贴的图片文件
    function getPasteImgs(e) {
        var result = [];
        var txt = getPasteText(e);
        if (txt) {
            // 有文字，就忽略图片
            return result;
        }

        var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData || {};
        var items = clipboardData.items;
        if (!items) {
            return result;
        }

        objForEach(items, function(key, value) {
            var type = value.type;
            if (/image/i.test(type)) {
                result.push(value.getAsFile());
            }
        });

        return result;
    }

    /*
        编辑区域
    */

    // 构造函数
    function Text(editor) {
        this.editor = editor;
    }

    // 修改原型
    Text.prototype = {
        constructor: Text,

        // 初始化
        init: function init() {
            // 绑定事件
            this._bindEvent();
        },

        // 清空内容
        clear: function clear() {
            this.html('<p><br></p>');
        },

        // 获取 设置 html
        html: function html(val) {
            var editor = this.editor;
            var $textElem = editor.$textElem;
            if (val == null) {
                return $textElem.html();
            } else {
                $textElem.html(val);

                // 初始化选取，将光标定位到内容尾部
                editor.initSelection();
            }
        },

        // 获取 设置 text
        text: function text(val) {
            var editor = this.editor;
            var $textElem = editor.$textElem;
            if (val == null) {
                return $textElem.text();
            } else {
                $textElem.text('<p>' + val + '</p>');

                // 初始化选取，将光标定位到内容尾部
                editor.initSelection();
            }
        },

        // 追加内容
        append: function append(html) {
            var editor = this.editor;
            var $textElem = editor.$textElem;
            $textElem.append($(html));

            // 初始化选取，将光标定位到内容尾部
            editor.initSelection();
        },

        // 绑定事件
        _bindEvent: function _bindEvent() {
            // 实时保存选取
            this._saveRangeRealTime();

            // 按回车建时的特殊处理
            this._enterKeyHandle();

            // 清空时保留 <p><br></p>
            this._clearHandle();

            // 粘贴事件（粘贴文字，粘贴图片）
            this._pasteHandle();

            // tab 特殊处理
            this._tabHandle();

            // img 点击
            this._imgHandle();

            // 拖拽事件
            this._dragHandle();
        },

        // 实时保存选取
        _saveRangeRealTime: function _saveRangeRealTime() {
            var editor = this.editor;
            var $textElem = editor.$textElem;

            // 保存当前的选区
            function saveRange(e) {
                // 随时保存选区
                editor.selection.saveRange();
                // 更新按钮 ative 状态
                editor.menus.changeActive();
            }
            // 按键后保存
            $textElem.on('keyup', saveRange);
            $textElem.on('mousedown', function(e) {
                // mousedown 状态下，鼠标滑动到编辑区域外面，也需要保存选区
                $textElem.on('mouseleave', saveRange);
            });
            $textElem.on('mouseup', function(e) {
                saveRange();
                // 在编辑器区域之内完成点击，取消鼠标滑动到编辑区外面的事件
                $textElem.off('mouseleave', saveRange);
            });
        },

        // 按回车键时的特殊处理
        _enterKeyHandle: function _enterKeyHandle() {
            var editor = this.editor;
            var $textElem = editor.$textElem;

            // 将回车之后生成的非 <p> 的顶级标签，改为 <p>
            function pHandle(e) {
                var $selectionElem = editor.selection.getSelectionContainerElem();
                var $parentElem = $selectionElem.parent();
                if (!$parentElem.equal($textElem)) {
                    // 不是顶级标签
                    return;
                }
                var nodeName = $selectionElem.getNodeName();
                if (nodeName === 'P') {
                    // 当前的标签是 P ，不用做处理
                    return;
                }

                if ($selectionElem.text()) {
                    // 有内容，不做处理
                    return;
                }

                // 插入 <p> ，并将选取定位到 <p>，删除当前标签
                var $p = $('<p><br></p>');
                $p.insertBefore($selectionElem);
                editor.selection.createRangeByElem($p, true);
                editor.selection.restoreSelection();
                $selectionElem.remove();
            }

            $textElem.on('keyup', function(e) {
                if (e.keyCode !== 13) {
                    // 不是回车键
                    return;
                }
                // 将回车之后生成的非 <p> 的顶级标签，改为 <p>
                pHandle(e);
            });

            // <pre><code></code></pre> 回车时 特殊处理
            function codeHandle(e) {
                var $selectionElem = editor.selection.getSelectionContainerElem();
                if (!$selectionElem) {
                    return;
                }
                var $parentElem = $selectionElem.parent();
                var selectionNodeName = $selectionElem.getNodeName();
                var parentNodeName = $parentElem.getNodeName();

                if (selectionNodeName !== 'CODE' || parentNodeName !== 'PRE') {
                    // 不符合要求 忽略
                    return;
                }

                if (!editor.cmd.queryCommandSupported('insertHTML')) {
                    // 必须原生支持 insertHTML 命令
                    return;
                }

                // 处理：光标定位到代码末尾，联系点击两次回车，即跳出代码块
                if (editor._willBreakCode === true) {
                    // 此时可以跳出代码块
                    // 插入 <p> ，并将选取定位到 <p>
                    var $p = $('<p><br></p>');
                    $p.insertAfter($parentElem);
                    editor.selection.createRangeByElem($p, true);
                    editor.selection.restoreSelection();

                    // 修改状态
                    editor._willBreakCode = false;

                    e.preventDefault();
                    return;
                }

                var _startOffset = editor.selection.getRange().startOffset;

                // 处理：回车时，不能插入 <br> 而是插入 \n ，因为是在 pre 标签里面
                editor.cmd.do('insertHTML', '\n');
                editor.selection.saveRange();
                if (editor.selection.getRange().startOffset === _startOffset) {
                    // 没起作用，再来一遍
                    editor.cmd.do('insertHTML', '\n');
                }

                var codeLength = $selectionElem.html().length;
                if (editor.selection.getRange().startOffset + 1 === codeLength) {
                    // 说明光标在代码最后的位置，执行了回车操作
                    // 记录下来，以便下次回车时候跳出 code
                    editor._willBreakCode = true;
                }

                // 阻止默认行为
                e.preventDefault();
            }

            $textElem.on('keydown', function(e) {
                if (e.keyCode !== 13) {
                    // 不是回车键
                    // 取消即将跳转代码块的记录
                    editor._willBreakCode = false;
                    return;
                }
                // <pre><code></code></pre> 回车时 特殊处理
                codeHandle(e);
            });
        },

        // 清空时保留 <p><br></p>
        _clearHandle: function _clearHandle() {
            var editor = this.editor;
            var $textElem = editor.$textElem;

            $textElem.on('keydown', function(e) {
                if (e.keyCode !== 8) {
                    return;
                }
                var txtHtml = $textElem.html().toLowerCase().trim();
                if (txtHtml === '<p><br></p>') {
                    // 最后剩下一个空行，就不再删除了
                    e.preventDefault();
                    return;
                }
            });

            $textElem.on('keyup', function(e) {
                if (e.keyCode !== 8) {
                    return;
                }
                var $p = void 0;
                var txtHtml = $textElem.html().toLowerCase().trim();

                // firefox 时用 txtHtml === '<br>' 判断，其他用 !txtHtml 判断
                if (!txtHtml || txtHtml === '<br>') {
                    // 内容空了
                    $p = $('<p><br/></p>');
                    $textElem.html(''); // 一定要先清空，否则在 firefox 下有问题
                    $textElem.append($p);
                    editor.selection.createRangeByElem($p, false, true);
                    editor.selection.restoreSelection();
                }
            });
        },

        // 粘贴事件（粘贴文字 粘贴图片）
        _pasteHandle: function _pasteHandle() {
            var editor = this.editor;
            var config = editor.config;
            var pasteFilterStyle = config.pasteFilterStyle;
            var pasteTextHandle = config.pasteTextHandle;
            var $textElem = editor.$textElem;

            // 粘贴图片、文本的事件，每次只能执行一个
            // 判断该次粘贴事件是否可以执行
            var pasteTime = 0;

            function canDo() {
                var now = Date.now();
                var flag = false;
                if (now - pasteTime >= 500) {
                    // 间隔大于 500 ms ，可以执行
                    flag = true;
                }
                pasteTime = now;
                return flag;
            }

            // 粘贴文字
            $textElem.on('paste', function(e) {
                if (UA.isIE()) {
                    return;
                } else {
                    // 阻止默认行为，使用 execCommand 的粘贴命令
                    e.preventDefault();
                }

                // 粘贴图片和文本，只能同时使用一个
                if (!canDo()) {
                    return;
                }

                // 获取粘贴的文字
                var pasteHtml = getPasteHtml(e, pasteFilterStyle);
                var pasteText = getPasteText(e);
                pasteText = pasteText.replace(/\n/gm, '<br>');

                // 自定义处理粘贴的内容
                if (pasteTextHandle && typeof pasteTextHandle === 'function') {
                    pasteHtml = '' + (pasteTextHandle(pasteHtml) || '');
                    pasteText = '' + (pasteTextHandle(pasteText) || '');
                }

                var $selectionElem = editor.selection.getSelectionContainerElem();
                if (!$selectionElem) {
                    return;
                }
                var nodeName = $selectionElem.getNodeName();

                // code 中只能粘贴纯文本
                if (nodeName === 'CODE' || nodeName === 'PRE') {
                    editor.cmd.do('insertHTML', '<p>' + pasteText + '</p>');
                    return;
                }

                // 先放开注释，有问题再追查 ————
                // // 表格中忽略，可能会出现异常问题
                // if (nodeName === 'TD' || nodeName === 'TH') {
                //     return
                // }

                if (!pasteHtml) {
                    return;
                }
                try {
                    // firefox 中，获取的 pasteHtml 可能是没有 <ul> 包裹的 <li>
                    // 因此执行 insertHTML 会报错
                    editor.cmd.do('insertHTML', pasteHtml);
                } catch (ex) {
                    // 此时使用 pasteText 来兼容一下
                    editor.cmd.do('insertHTML', '<p>' + pasteText + '</p>');
                }
            });

            // 粘贴图片
            $textElem.on('paste', function(e) {
                if (UA.isIE()) {
                    return;
                } else {
                    e.preventDefault();
                }

                // 粘贴图片和文本，只能同时使用一个
                if (!canDo()) {
                    return;
                }

                // 获取粘贴的图片
                var pasteFiles = getPasteImgs(e);
                if (!pasteFiles || !pasteFiles.length) {
                    return;
                }

                // 获取当前的元素
                var $selectionElem = editor.selection.getSelectionContainerElem();
                if (!$selectionElem) {
                    return;
                }
                var nodeName = $selectionElem.getNodeName();

                // code 中粘贴忽略
                if (nodeName === 'CODE' || nodeName === 'PRE') {
                    return;
                }

                // 上传图片
                var uploadImg = editor.uploadImg;
                uploadImg.uploadImg(pasteFiles);
            });
        },

        // tab 特殊处理
        _tabHandle: function _tabHandle() {
            var editor = this.editor;
            var $textElem = editor.$textElem;

            $textElem.on('keydown', function(e) {
                if (e.keyCode !== 9) {
                    return;
                }
                if (!editor.cmd.queryCommandSupported('insertHTML')) {
                    // 必须原生支持 insertHTML 命令
                    return;
                }
                var $selectionElem = editor.selection.getSelectionContainerElem();
                if (!$selectionElem) {
                    return;
                }
                var $parentElem = $selectionElem.parent();
                var selectionNodeName = $selectionElem.getNodeName();
                var parentNodeName = $parentElem.getNodeName();

                if (selectionNodeName === 'CODE' && parentNodeName === 'PRE') {
                    // <pre><code> 里面
                    editor.cmd.do('insertHTML', '    ');
                } else {
                    // 普通文字
                    editor.cmd.do('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
                }

                e.preventDefault();
            });
        },

        // img 点击
        _imgHandle: function _imgHandle() {
            var editor = this.editor;
            var $textElem = editor.$textElem;

            // 为图片增加 selected 样式
            $textElem.on('click', 'img', function(e) {
                var img = this;
                var $img = $(img);

                // 记录当前点击过的图片
                editor._selectedImg = $img;

                // 修改选区并 restore ，防止用户此时点击退格键，会删除其他内容
                editor.selection.createRangeByElem($img);
                editor.selection.restoreSelection();
            });

            // 去掉图片的 selected 样式
            $textElem.on('click  keyup', function(e) {
                if (e.target.matches('img')) {
                    // 点击的是图片，忽略
                    return;
                }
                // 删除记录
                editor._selectedImg = null;
            });
        },

        // 拖拽事件
        _dragHandle: function _dragHandle() {
            var editor = this.editor;

            // 禁用 document 拖拽事件
            var $document = $(document);
            $document.on('dragleave drop dragenter dragover', function(e) {
                e.preventDefault();
            });

            // 添加编辑区域拖拽事件
            var $textElem = editor.$textElem;
            $textElem.on('drop', function(e) {
                e.preventDefault();
                var files = e.dataTransfer && e.dataTransfer.files;
                if (!files || !files.length) {
                    return;
                }

                // 上传图片
                var uploadImg = editor.uploadImg;
                uploadImg.uploadImg(files);
            });
        }
    };

    /*
        命令，封装 document.execCommand
    */

    // 构造函数
    function Command(editor) {
        this.editor = editor;
    }

    // 修改原型
    Command.prototype = {
        constructor: Command,

        // 执行命令
        do: function _do(name, value) {
            var editor = this.editor;

            // 如果无选区，忽略
            if (!editor.selection.getRange()) {
                return;
            }

            // 恢复选取
            editor.selection.restoreSelection();

            // 执行
            var _name = '_' + name;
            if (this[_name]) {
                // 有自定义事件
                this[_name](value);
            } else {
                // 默认 command
                this._execCommand(name, value);
            }

            // 修改菜单状态
            editor.menus.changeActive();

            // 最后，恢复选取保证光标在原来的位置闪烁
            editor.selection.saveRange();
            editor.selection.restoreSelection();

            // 触发 onchange
            editor.change && editor.change();
        },

        // 自定义 insertHTML 事件
        _insertHTML: function _insertHTML(html) {
            var editor = this.editor;
            var range = editor.selection.getRange();

            if (this.queryCommandSupported('insertHTML')) {
                // W3C
                this._execCommand('insertHTML', html);
            } else if (range.insertNode) {
                // IE
                range.deleteContents();
                range.insertNode($(html)[0]);
            } else if (range.pasteHTML) {
                // IE <= 10
                range.pasteHTML(html);
            }
        },

        // 插入 elem
        _insertElem: function _insertElem($elem) {
            var editor = this.editor;
            var range = editor.selection.getRange();

            if (range.insertNode) {
                range.deleteContents();
                range.insertNode($elem[0]);
            }
        },

        // 封装 execCommand
        _execCommand: function _execCommand(name, value) {
            document.execCommand(name, false, value);
        },

        // 封装 document.queryCommandValue
        queryCommandValue: function queryCommandValue(name) {
            return document.queryCommandValue(name);
        },

        // 封装 document.queryCommandState
        queryCommandState: function queryCommandState(name) {
            return document.queryCommandState(name);
        },

        // 封装 document.queryCommandSupported
        queryCommandSupported: function queryCommandSupported(name) {
            return document.queryCommandSupported(name);
        }
    };

    /*
        selection range API
    */

    // 构造函数
    function API(editor) {
        this.editor = editor;
        this._currentRange = null;
    }

    // 修改原型
    API.prototype = {
        constructor: API,

        // 获取 range 对象
        getRange: function getRange() {
            return this._currentRange;
        },

        // 保存选区
        saveRange: function saveRange(_range) {
            if (_range) {
                // 保存已有选区
                this._currentRange = _range;
                return;
            }

            // 获取当前的选区
            var selection = window.getSelection();
            if (selection.rangeCount === 0) {
                return;
            }
            var range = selection.getRangeAt(0);

            // 判断选区内容是否在编辑内容之内
            var $containerElem = this.getSelectionContainerElem(range);
            if (!$containerElem) {
                return;
            }
            var editor = this.editor;
            var $textElem = editor.$textElem;
            if ($textElem.isContain($containerElem)) {
                // 是编辑内容之内的
                this._currentRange = range;
            }
        },

        // 折叠选区
        collapseRange: function collapseRange(toStart) {
            if (toStart == null) {
                // 默认为 false
                toStart = false;
            }
            var range = this._currentRange;
            if (range) {
                range.collapse(toStart);
            }
        },

        // 选中区域的文字
        getSelectionText: function getSelectionText() {
            var range = this._currentRange;
            if (range) {
                return this._currentRange.toString();
            } else {
                return '';
            }
        },

        // 选区的 $Elem
        getSelectionContainerElem: function getSelectionContainerElem(range) {
            range = range || this._currentRange;
            var elem = void 0;
            if (range) {
                elem = range.commonAncestorContainer;
                return $(elem.nodeType === 1 ? elem : elem.parentNode);
            }
        },
        getSelectionStartElem: function getSelectionStartElem(range) {
            range = range || this._currentRange;
            var elem = void 0;
            if (range) {
                elem = range.startContainer;
                return $(elem.nodeType === 1 ? elem : elem.parentNode);
            }
        },
        getSelectionEndElem: function getSelectionEndElem(range) {
            range = range || this._currentRange;
            var elem = void 0;
            if (range) {
                elem = range.endContainer;
                return $(elem.nodeType === 1 ? elem : elem.parentNode);
            }
        },

        // 选区是否为空
        isSelectionEmpty: function isSelectionEmpty() {
            var range = this._currentRange;
            if (range && range.startContainer) {
                if (range.startContainer === range.endContainer) {
                    if (range.startOffset === range.endOffset) {
                        return true;
                    }
                }
            }
            return false;
        },

        // 恢复选区
        restoreSelection: function restoreSelection() {
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this._currentRange);
        },

        // 创建一个空白（即 &#8203 字符）选区
        createEmptyRange: function createEmptyRange() {
            var editor = this.editor;
            var range = this.getRange();
            var $elem = void 0;

            if (!range) {
                // 当前无 range
                return;
            }
            if (!this.isSelectionEmpty()) {
                // 当前选区必须没有内容才可以
                return;
            }

            try {
                // 目前只支持 webkit 内核
                if (UA.isWebkit()) {
                    // 插入 &#8203
                    editor.cmd.do('insertHTML', '&#8203;');
                    // 修改 offset 位置
                    range.setEnd(range.endContainer, range.endOffset + 1);
                    // 存储
                    this.saveRange(range);
                } else {
                    $elem = $('<strong>&#8203;</strong>');
                    editor.cmd.do('insertElem', $elem);
                    this.createRangeByElem($elem, true);
                }
            } catch (ex) {
                // 部分情况下会报错，兼容一下
            }
        },

        // 根据 $Elem 设置选区
        createRangeByElem: function createRangeByElem($elem, toStart, isContent) {
            // $elem - 经过封装的 elem
            // toStart - true 开始位置，false 结束位置
            // isContent - 是否选中Elem的内容
            if (!$elem.length) {
                return;
            }

            var elem = $elem[0];
            var range = document.createRange();

            if (isContent) {
                range.selectNodeContents(elem);
            } else {
                range.selectNode(elem);
            }

            if (typeof toStart === 'boolean') {
                range.collapse(toStart);
            }

            // 存储 range
            this.saveRange(range);
        }
    };

    /*
        上传进度条
    */

    function Progress(editor) {
        this.editor = editor;
        this._time = 0;
        this._isShow = false;
        this._isRender = false;
        this._timeoutId = 0;
        this.$textContainer = editor.$textContainerElem;
        this.$bar = $('<div class="w-e-progress"></div>');
    }

    Progress.prototype = {
        constructor: Progress,

        show: function show(progress) {
            var _this = this;

            // 状态处理
            if (this._isShow) {
                return;
            }
            this._isShow = true;

            // 渲染
            var $bar = this.$bar;
            if (!this._isRender) {
                var $textContainer = this.$textContainer;
                $textContainer.append($bar);
            } else {
                this._isRender = true;
            }

            // 改变进度（节流，100ms 渲染一次）
            if (Date.now() - this._time > 100) {
                if (progress <= 1) {
                    $bar.css('width', progress * 100 + '%');
                    this._time = Date.now();
                }
            }

            // 隐藏
            var timeoutId = this._timeoutId;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(function() {
                _this._hide();
            }, 500);
        },

        _hide: function _hide() {
            var $bar = this.$bar;
            $bar.remove();

            // 修改状态
            this._time = 0;
            this._isShow = false;
            this._isRender = false;
        }
    };

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    /*
        上传图片
    */

    // 构造函数
    function UploadImg(editor) {
        this.editor = editor;
    }

    // 原型
    UploadImg.prototype = {
        constructor: UploadImg,

        // 根据 debug 弹出不同的信息
        _alert: function _alert(alertInfo, debugInfo) {
            var editor = this.editor;
            var debug = editor.config.debug;
            var customAlert = editor.config.customAlert;

            if (debug) {
                throw new Error('giEditor: ' + (debugInfo || alertInfo));
            } else {
                if (customAlert && typeof customAlert === 'function') {
                    customAlert(alertInfo);
                } else {
                    alert(alertInfo);
                }
            }
        },

        // 根据链接插入图片
        insertLinkImg: function insertLinkImg(link) {
            var _this2 = this;

            if (!link) {
                return;
            }
            var editor = this.editor;
            var config = editor.config;

            // 校验格式
            var linkImgCheck = config.linkImgCheck;
            var checkResult = void 0;
            if (linkImgCheck && typeof linkImgCheck === 'function') {
                checkResult = linkImgCheck(link);
                if (typeof checkResult === 'string') {
                    // 校验失败，提示信息
                    alert(checkResult);
                    return;
                }
            }

            var imgTpl = [
                '<div class="gi-editor-image">',
                '   <img src="' + link + '" style="max-width:100%;"/>',
                '   <div class="img-title"></div>',
                '   <div class="img-source"></div>',
                '</div>'
            ].join('');
            editor.cmd.do('insertHTML', imgTpl);

            // 验证图片 url 是否有效，无效的话给出提示
            var img = document.createElement('img');
            img.onload = function() {
                var callback = config.linkImgCallback;
                if (callback && typeof callback === 'function') {
                    callback(link);
                }

                img = null;
            };
            img.onerror = function() {
                img = null;
                // 无法成功下载图片
                _this2._alert('插入图片错误', 'giEditor: \u63D2\u5165\u56FE\u7247\u51FA\u9519\uFF0C\u56FE\u7247\u94FE\u63A5\u662F "' + link + '"\uFF0C\u4E0B\u8F7D\u8BE5\u94FE\u63A5\u5931\u8D25');
                return;
            };
            img.onabort = function() {
                img = null;
            };
            img.src = link;
        },

        // 上传图片
        uploadImg: function uploadImg(files) {
            var _this3 = this;

            if (!files || !files.length) {
                return;
            }

            // ------------------------------ 获取配置信息 ------------------------------
            var editor = this.editor;
            var config = editor.config;
            var uploadImgServer = config.uploadImgServer;
            var uploadImgShowBase64 = config.uploadImgShowBase64;

            var maxSize = config.uploadImgMaxSize;
            var maxSizeM = maxSize / 1000 / 1000;
            var maxLength = config.uploadImgMaxLength || 10000;
            var uploadFileName = config.uploadFileName || '';
            var uploadImgParams = config.uploadImgParams || {};
            var uploadImgParamsWithUrl = config.uploadImgParamsWithUrl;
            var uploadImgHeaders = config.uploadImgHeaders || {};
            var hooks = config.uploadImgHooks || {};
            var timeout = config.uploadImgTimeout || 30000;
            var withCredentials = config.withCredentials;
            if (withCredentials == null) {
                withCredentials = false;
            }
            var customUploadImg = config.customUploadImg;

            if (!customUploadImg) {
                // 没有 customUploadImg 的情况下，需要如下两个配置才能继续进行图片上传
                if (!uploadImgServer && !uploadImgShowBase64) {
                    return;
                }
            }

            // ------------------------------ 验证文件信息 ------------------------------
            var resultFiles = [];
            var errInfo = [];
            arrForEach(files, function(file) {
                var name = file.name;
                var size = file.size;

                // chrome 低版本 name === undefined
                if (!name || !size) {
                    return;
                }

                if (/\.(jpg|jpeg|png|gif)$/i.test(name) === false) {
                    // 后缀名不合法，不是图片
                    errInfo.push('\u3010' + name + '\u3011\u4E0D\u662F\u56FE\u7247');
                    return;
                }
                if (maxSize < size) {
                    // 上传图片过大
                    errInfo.push('\u3010' + name + '\u3011\u5927\u4E8E ' + maxSizeM + 'M');
                    return;
                }

                // 验证通过的加入结果列表
                resultFiles.push(file);
            });
            // 抛出验证信息
            if (errInfo.length) {
                this._alert('图片验证未通过: \n' + errInfo.join('\n'));
                return;
            }
            if (resultFiles.length > maxLength) {
                this._alert('一次最多上传' + maxLength + '张图片');
                return;
            }

            // ------------------------------ 自定义上传 ------------------------------
            if (customUploadImg && typeof customUploadImg === 'function') {
                customUploadImg(resultFiles, this.insertLinkImg.bind(this));

                // 阻止以下代码执行
                return;
            }

            // 添加图片数据
            var formdata = new FormData();
            arrForEach(resultFiles, function(file) {
                var name = uploadFileName || file.name;
                formdata.append('name', name);
                formdata.append('file', file);
            });

            // ------------------------------ 上传图片 ------------------------------
            if (uploadImgServer && typeof uploadImgServer === 'string') {
                // 添加参数
                var uploadImgServerArr = uploadImgServer.split('#');
                uploadImgServer = uploadImgServerArr[0];
                var uploadImgServerHash = uploadImgServerArr[1] || '';
                objForEach(uploadImgParams, function(key, val) {
                    val = encodeURIComponent(val);

                    // 第一，将参数拼接到 url 中
                    if (uploadImgParamsWithUrl) {
                        if (uploadImgServer.indexOf('?') > 0) {
                            uploadImgServer += '&';
                        } else {
                            uploadImgServer += '?';
                        }
                        uploadImgServer = uploadImgServer + key + '=' + val;
                    }

                    // 第二，将参数添加到 formdata 中
                    formdata.append(key, val);
                });
                if (uploadImgServerHash) {
                    uploadImgServer += '#' + uploadImgServerHash;
                }

                // 定义 xhr
                var xhr = new XMLHttpRequest();
                xhr.open('POST', uploadImgServer);

                // 设置超时
                xhr.timeout = timeout;
                xhr.ontimeout = function() {
                    // hook - timeout
                    if (hooks.timeout && typeof hooks.timeout === 'function') {
                        hooks.timeout(xhr, editor);
                    }

                    _this3._alert('上传图片超时');
                };

                // 监控 progress
                if (xhr.upload) {
                    xhr.upload.onprogress = function(e) {
                        var percent = void 0;
                        // 进度条
                        var progressBar = new Progress(editor);
                        if (e.lengthComputable) {
                            percent = e.loaded / e.total;
                            progressBar.show(percent);
                        }
                    };
                }

                // 返回数据
                xhr.onreadystatechange = function() {
                    var result = void 0;
                    if (xhr.readyState === 4) {
                        if (xhr.status < 200 || xhr.status >= 300) {
                            // hook - error
                            if (hooks.error && typeof hooks.error === 'function') {
                                hooks.error(xhr, editor);
                            }

                            // xhr 返回状态错误
                            _this3._alert('上传图片发生错误', '\u4E0A\u4F20\u56FE\u7247\u53D1\u751F\u9519\u8BEF\uFF0C\u670D\u52A1\u5668\u8FD4\u56DE\u72B6\u6001\u662F ' + xhr.status);
                            return;
                        }

                        result = xhr.responseText;
                        if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) !== 'object') {
                            try {
                                result = JSON.parse(result);
                            } catch (ex) {
                                // hook - fail
                                if (hooks.fail && typeof hooks.fail === 'function') {
                                    hooks.fail(xhr, editor, result);
                                }

                                _this3._alert('上传图片失败', '上传图片返回结果错误，返回结果是: ' + result);
                                return;
                            }
                        }
                        if (!hooks.customInsert && result.code != '0') {
                            // hook - fail
                            if (hooks.fail && typeof hooks.fail === 'function') {
                                hooks.fail(xhr, editor, result);
                            }

                            // 数据错误
                            _this3._alert('上传图片失败', '上传图片返回结果错误，返回结果 errno=' + result.errno);
                        } else {
                            if (hooks.customInsert && typeof hooks.customInsert === 'function') {
                                // 使用者自定义插入方法
                                hooks.customInsert(_this3.insertLinkImg.bind(_this3), result, editor);
                            } else {
                                // 将图片插入编辑器
                                var data = result.result || [];
                                data.forEach(function(link) {
                                    _this3.insertLinkImg(link);
                                });
                            }

                            // hook - success
                            if (hooks.success && typeof hooks.success === 'function') {
                                hooks.success(xhr, editor, result);
                            }
                        }
                    }
                };

                // hook - before
                if (hooks.before && typeof hooks.before === 'function') {
                    var beforeResult = hooks.before(xhr, editor, resultFiles);
                    if (beforeResult && (typeof beforeResult === 'undefined' ? 'undefined' : _typeof(beforeResult)) === 'object') {
                        if (beforeResult.prevent) {
                            // 如果返回的结果是 {prevent: true, msg: 'xxxx'} 则表示用户放弃上传
                            this._alert(beforeResult.msg);
                            return;
                        }
                    }
                }

                // 自定义 headers
                objForEach(uploadImgHeaders, function(key, val) {
                    xhr.setRequestHeader(key, val);
                });

                // 跨域传 cookie
                xhr.withCredentials = withCredentials;

                // 发送请求
                xhr.send(formdata);

                // 注意，要 return 。不去操作接下来的 base64 显示方式
                return;
            }

            // ------------------------------ 显示 base64 格式 ------------------------------
            if (uploadImgShowBase64) {
                arrForEach(files, function(file) {
                    var _this = _this3;
                    var reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function() {
                        _this.insertLinkImg(this.result);
                    };
                });
            }
        }
    };

    /*
        编辑器构造函数
    */

    // id，累加
    var editorId = 1;

    // 构造函数
    function Editor(toolbarSelector, textSelector) {
        if (toolbarSelector == null) {
            // 没有传入任何参数，报错
            throw new Error('错误：初始化编辑器时候未传入任何参数，请查阅文档');
        }
        // id，用以区分单个页面不同的编辑器对象
        this.id = 'giEditor-' + editorId++;

        this.toolbarSelector = toolbarSelector;
        this.textSelector = textSelector;

        // 自定义配置
        this.customConfig = {};
    }

    // 修改原型
    Editor.prototype = {
        constructor: Editor,

        // 初始化配置
        _initConfig: function _initConfig() {
            // _config 是默认配置，this.customConfig 是用户自定义配置，将它们 merge 之后再赋值
            var target = {};
            this.config = Object.assign(target, config, this.customConfig);

            // 将语言配置，生成正则表达式
            var langConfig = this.config.lang || {};
            var langArgs = [];
            objForEach(langConfig, function(key, val) {
                // key 即需要生成正则表达式的规则，如“插入链接”
                // val 即需要被替换成的语言，如“insert link”
                langArgs.push({
                    reg: new RegExp(key, 'img'),
                    val: val

                });
            });
            this.config.langArgs = langArgs;
        },

        // 初始化 DOM
        _initDom: function _initDom() {
            var _this = this;

            var toolbarSelector = this.toolbarSelector;
            var $toolbarSelector = $(toolbarSelector);
            var textSelector = this.textSelector;

            var config$$1 = this.config;
            var zIndex = config$$1.zIndex;

            // 定义变量
            var $toolbarElem = void 0,
                $textContainerElem = void 0,
                $textElem = void 0,
                $children = void 0;

            if (textSelector == null) {
                // 只传入一个参数，即是容器的选择器或元素，toolbar 和 text 的元素自行创建
                $toolbarElem = $('<div></div>');
                $textContainerElem = $('<div></div>');

                // 将编辑器区域原有的内容，暂存起来
                $children = $toolbarSelector.children();

                // 添加到 DOM 结构中
                $toolbarSelector.append($toolbarElem).append($textContainerElem);

                // 自行创建的，需要配置默认的样式
                $toolbarElem.css('background-color', '#f1f1f1').css('border', '1px solid #ccc');
                $textContainerElem.css('border', '1px solid #ccc').css('border-top', 'none').css('height', '300px');
            } else {
                // toolbar 和 text 的选择器都有值，记录属性
                $toolbarElem = $toolbarSelector;
                $textContainerElem = $(textSelector);
                // 将编辑器区域原有的内容，暂存起来
                $children = $textContainerElem.children();
            }

            // 编辑区域
            $textElem = $('<div></div>');
            $textElem.attr('contenteditable', 'true').css('width', '100%').css('height', '100%');

            // 初始化编辑区域内容
            if ($children && $children.length) {
                $textElem.append($children);
            } else {
                $textElem.append($('<p><br></p>'));
            }

            // 编辑区域加入DOM
            $textContainerElem.append($textElem);

            // 设置通用的 class
            $toolbarElem.addClass('w-e-toolbar');
            $textContainerElem.addClass('w-e-text-container');
            $textContainerElem.css('z-index', zIndex);
            $textElem.addClass('w-e-text');

            // 添加 ID
            var toolbarElemId = getRandom('toolbar-elem');
            $toolbarElem.attr('id', toolbarElemId);
            var textElemId = getRandom('text-elem');
            $textElem.attr('id', textElemId);

            // 记录属性
            this.$toolbarElem = $toolbarElem;
            this.$textContainerElem = $textContainerElem;
            this.$textElem = $textElem;
            this.toolbarElemId = toolbarElemId;
            this.textElemId = textElemId;

            // 绑定 onchange
            $textContainerElem.on('click keyup', function() {
                _this.change && _this.change();
            });
            $toolbarElem.on('click', function() {
                this.change && this.change();
            });

            //绑定 onfocus 与 onblur 事件
            if (config$$1.onfocus || config$$1.onblur) {
                // 当前编辑器是否是焦点状态
                this.isFocus = false;

                $(document).on('click', function(e) {
                    //判断当前点击元素是否在编辑器内
                    var isChild = $toolbarSelector.isContain($(e.target));

                    if (!isChild) {
                        if (_this.isFocus) {
                            _this.onblur && _this.onblur();
                        }
                        _this.isFocus = false;
                    } else {
                        if (!_this.isFocus) {
                            _this.onfocus && _this.onfocus();
                        }
                        _this.isFocus = true;
                    }
                });
            }
        },

        // 封装 command
        _initCommand: function _initCommand() {
            this.cmd = new Command(this);
        },

        // 封装 selection range API
        _initSelectionAPI: function _initSelectionAPI() {
            this.selection = new API(this);
        },

        // 添加图片上传
        _initUploadImg: function _initUploadImg() {
            this.uploadImg = new UploadImg(this);
        },

        // 初始化菜单
        _initMenus: function _initMenus() {
            this.menus = new Menus(this);
            this.menus.init();
        },

        // 添加 text 区域
        _initText: function _initText() {
            this.txt = new Text(this);
            this.txt.init();
        },

        // 初始化选区，将光标定位到内容尾部
        initSelection: function initSelection(newLine) {
            var $textElem = this.$textElem;
            var $children = $textElem.children();
            if (!$children.length) {
                // 如果编辑器区域无内容，添加一个空行，重新设置选区
                $textElem.append($('<p><br></p>'));
                this.initSelection();
                return;
            }

            var $last = $children.last();

            if (newLine) {
                // 新增一个空行
                var html = $last.html().toLowerCase();
                var nodeName = $last.getNodeName();
                if (html !== '<br>' && html !== '<br\/>' || nodeName !== 'P') {
                    // 最后一个元素不是 <p><br></p>，添加一个空行，重新设置选区
                    $textElem.append($('<p><br></p>'));
                    this.initSelection();
                    return;
                }
            }

            this.selection.createRangeByElem($last, false, true);
            this.selection.restoreSelection();
        },

        // 绑定事件
        _bindEvent: function _bindEvent() {
            // -------- 绑定 onchange 事件 --------
            var onChangeTimeoutId = 0;
            var beforeChangeHtml = this.txt.html();
            var config$$1 = this.config;

            // onchange 触发延迟时间
            var onchangeTimeout = config$$1.onchangeTimeout;
            onchangeTimeout = parseInt(onchangeTimeout, 10);
            if (!onchangeTimeout || onchangeTimeout <= 0) {
                onchangeTimeout = 200;
            }

            var onchange = config$$1.onchange;
            if (onchange && typeof onchange === 'function') {
                // 触发 change 的有三个场景：
                // 1. $textContainerElem.on('click keyup')
                // 2. $toolbarElem.on('click')
                // 3. editor.cmd.do()
                this.change = function() {
                    // 判断是否有变化
                    var currentHtml = this.txt.html();

                    if (currentHtml.length === beforeChangeHtml.length) {
                        // 需要比较每一个字符
                        if (currentHtml === beforeChangeHtml) {
                            return;
                        }
                    }

                    // 执行，使用节流
                    if (onChangeTimeoutId) {
                        clearTimeout(onChangeTimeoutId);
                    }
                    onChangeTimeoutId = setTimeout(function() {
                        // 触发配置的 onchange 函数
                        onchange(currentHtml);
                        beforeChangeHtml = currentHtml;
                    }, onchangeTimeout);
                };
            }

            // -------- 绑定 onblur 事件 --------
            var onblur = config$$1.onblur;
            if (onblur && typeof onblur === 'function') {
                this.onblur = function() {
                    var currentHtml = this.txt.html();
                    onblur(currentHtml);
                };
            }

            // -------- 绑定 onfocus 事件 --------
            var onfocus = config$$1.onfocus;
            if (onfocus && typeof onfocus === 'function') {
                this.onfocus = function() {
                    onfocus();
                };
            }
        },

        // 创建编辑器
        create: function create() {
            // 初始化配置信息
            this._initConfig();

            // 初始化 DOM
            this._initDom();

            // 封装 command API
            this._initCommand();

            // 封装 selection range API
            this._initSelectionAPI();

            // 添加 text
            this._initText();

            // 初始化菜单
            this._initMenus();

            // 添加 图片上传
            this._initUploadImg();

            // 初始化选区，将光标定位到内容尾部
            this.initSelection(true);

            // 绑定事件
            this._bindEvent();
        }
    };

    // 检验是否浏览器环境
    try {
        document;
    } catch (ex) {
        throw new Error('请在浏览器环境下运行');
    }

    // polyfill
    polyfill();

    // 返回
    var index = window.giEditor || Editor;

    return index;

})));