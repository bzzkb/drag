/** 
 * 用于拖拽指定的标签，一般用于弹出层拖拽 ：
 *  $(".parent").myDrag({"handler":".son"});
 */

(function ($, win, doc) {

    var defaults = {
        // 是否仅在标题上面拖拽，默认是整个标签
        handler: "",
        cursor: "move",
        limit: true
    };

    var Drag = function (element, options) {
        this.element = element;

        this.options = $.extend({}, defaults, options || {}); // 直接获取handler不太好，在this.element里面寻找最好
        this.handler = this.options.handler ? $(options.handler, this.element) : $(this.element);
        this.startPoint = {}; // 按下去记录的固定位置值
        this.movedPoint = {}; // startPoint 一会也要从函数里面转移到这里
        this.init();
    };

    Drag.prototype = {
        Constructor: Drag,
        getStartPoint: function (event) {
            var $element = $(this.element);
            var position = $element.position();
            // 既然取了css(left)进行计算，那么说明，此元素肯定是已经进行定位了的，那么和用position().lefｔ
            // 是一样的，position().Left 在任何浏览器下，都一样，不带px
            this.startPoint = {
                // 不用 event.layerX 是因为，这个名称在不适合
                // 这里的被减数是，被移动的那个元素，需要注意一下
                //不用 css(left) 进行取值的原因是，因为ie9等 如果拖拽对象没有设置位置值，
                //那么默认为auto，这样计算就报错啦
                left: event.clientX - position.left,
                top: event.clientY - position.top
            };
        },
        down: function (event) {
            var that = this;
            var $handler = that.handler;
            // 记录按下的时候的固定值
            that.getStartPoint(event);
            // 鼠标刚按下时的回调：,event对象 有一个，参数只有一个：鼠标松开的值
            $(that.element).trigger({
                type: "dragstart",
                target: that.element // 哪个元素上面触发的， 释放后，的位置值
            }, [that.startPoint]);

            if ($handler[0].setCapture) {
                $handler.on("mousemove", $.proxy(that.move, that)).on("mouseup", $.proxy(that.up, that));
                $handler[0].setCapture();
            }
            else {
                $(doc).on("mousemove", $.proxy(that.move, that)).on("mouseup", $.proxy(that.up, that));
            }
            return false;
        },
        move: function (event) {
            var that = this;
            var $element = $(that.element);
            that.movedPoint = {
                left: event.clientX - that.startPoint.left,
                top: event.clientY - that.startPoint.top
            };
            // 移动的过程中，left的值，最大不超过 浏览器的宽度 - 自身的宽度
            // 待优化
            //console.log(that.movedPoint.top + parseInt($(that.elemnt).css("marginTop")));
            if (that.options.limit) {
                var marginLeft = parseInt($element.css("marginLeft"));
                var marginTop = parseInt($element.css("marginTop"));
                var maxLeft = $(win).width() - $element.outerWidth(true);
                var maxTop = $(win).height() - $element.outerHeight(true);

                if (that.movedPoint.left + (marginLeft ? marginLeft : 0) < 0) {
                    that.movedPoint.left = -(marginLeft ? marginLeft : 0);
                }
                if (that.movedPoint.top + (marginTop ? marginTop : 0) < 0) {
                    that.movedPoint.top = -(marginTop ? marginTop : 0);
                }
                if (that.movedPoint.left >= maxLeft) {
                    that.movedPoint.left = maxLeft;
                }
                if (that.movedPoint.top >= maxTop) {
                    that.movedPoint.top = maxTop;
                }
            }
            $(that.element).css({
                left: that.movedPoint.left,
                top: that.movedPoint.top
            });
            // 鼠标移动过程中的回调：,event对象 有一个，参数只有一个：鼠标松开的值
            $(that.element).trigger({
                type: "dragmove",
                target: that.element // 哪个元素上面触发的， 释放后，的位置值
            }, [that.movedPoint]);
        },
        up: function () {
            var that = this; // this 就是 绑定的那个
            var $handler = that.handler;

            if ($handler[0].releaseCapture) {
                $handler.off("mousemove", that.move).off("mouseup", that.up);
                $handler[0].releaseCapture();
            }
            else {
                $(doc).off("mousemove", that.move).off("mouseup", that.up);
            }
            // 鼠标松开的回调：,event对象 有一个，参数只有一个：鼠标松开的值
            $(that.element).trigger({
                type: "dragend",
                target: that.element // 哪个元素上面触发的， 释放后，的位置值
            }, [that.movedPoint]);
        },
        init: function () {
            var that = this; // 这里的this是Drag
            var $handler = that.handler;
            $handler.css({
                "cursor": that.options.cursor
            });
            $handler.on("mousedown", $.proxy(that.down, that));
        }
    };
    
    $.fn.myDrag = function (options) {
        return this.each(function () {
            if (!$(this).data("fnDrag")) {
                $(this).data("fnDrag", new Drag(this, options));
            }
        });

    };

})(jQuery, window, document, undefined);
