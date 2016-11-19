(function($) {
    $.CUI = {
        defaultContext: {
            $element: null,
            name: '',
            defaultOpt: null,
            initBefore: null,
            init: null,
            exports: {},
            setOptionsBefore: null,
            setOptionsAfter: null,
            destroyBefore: null,
            initAfter: null,
        },
        plugin: function(pluginContext) {
            var name = pluginContext.name;
            if ($.fn[name]) {
                window.console.log('the plugin name is duplicate: ' + name);
                return null;
            }

            $.fn[name] = function(options) {
                var $this = $(this);
                if (name && $this.data(name)) {
                    if (options) {
                        $this.data(name).setOptions(options);
                    }
                    return $this.data(name);
                }

                //initial context of plugin
                var context = $.extend(true, {
                    $element: $this,
                }, $.CUI.defaultContext, pluginContext);

                context.options = options;
                context.$element = $this;

                var obj = $.proxy($.CUI.create, this)(context);

                $this.data(name, obj);

                return obj;
            };
        },
        create: function(context) {
            var that = this;
            //initial export options of plugin
            context.opt = $.extend(true, {}, context.defaultOpt, context.options);
            //handle the initial step
            $.proxy($.CUI.handleInit, that)(context);

            return context.exports;
        },
        handleOptions: function(context) {
            var that = this;
            return function(options) {
                //before set options
                context.setOptionsBefore && $.proxy(context.setOptionsBefore, that)(context, options);

                context.opt = $.extend(context.opt, options);

                //after set options
                context.setOptionsAfter && $.proxy(context.setOptionsAfter, that)(context, options);
            };
        },
        handleInit: function(context) {
            var that = this;
            var opt = context.opt;
            //before plugin initial event
            $.CUI.addEvent('cui.init.before.' + context.name, context);
            opt.initbefore && $.CUI.addEvent(opt.initbefore, context);

            //before plugin initial custom event
            context.initBefore && $.CUI.addEvent(context.initBefore, context);

            context.init && $.proxy(context.init, that)(context);

            //add exports for the plugin
            $.proxy($.CUI.handleExports, that)(context);

            //initial get options of plugin
            context.exports.getOptions = function() {
                return context.opt;
            };

            //initial set options of plugin
            context.exports.setOptions = $.proxy($.CUI.handleOptions, that)(context);

            //destroy export for the plugin
            context.exports.destroy = $.proxy($.CUI.handleDestroy, that)(context);

            //after plugin initial custom event
            context.initAfter && $.proxy(context.initAfter, that)(context);
            opt.initafter && $.CUI.addEvent(opt.initafter, context);

            //after plugin initial event
            $.CUI.addEvent('cui.init.after.' + context.name, context);
        },
        handleDestroy: function(context) {
            return function() {
                //before plugin destroy event
                $.CUI.addEvent('cui.before.destroy.' + context.name, context);
                //before plugin destroy custom event
                context.destroyBefore && $.CUI.addEvent(context.destroyBefore, context);
                context.$element.data(name, null);
            };
        },
        handleExports: function(context) {
            if (context.exports) {
                var obj = {};
                $.each(context.exports, function(key, value) {
                    if ($.isFunction(value)) {
                        //export method for the plugin
                        obj[key] = $.proxy(value, context);
                    }
                });
                context.exports = obj;
            }
        },
        addEvent: function(name, context) {
            if ($.isFunction(name)) {
                name.apply(this, [context.$element, context.exports]);
            } else {
                $(document).trigger(name, [context.$element, context.exports]);
            }
        }
    };
})(jQuery);