/**
 * 图片相册功能JS
 */
;(function(win,$){
	/**
	 * 相册对象构造器
	 * @param {Object} ele   原图片列表容器
	 * @param {Object} opts  可选参数 
	 */
	function myPhoto(ele,opts)
	{
		var _opts = $.extend(true,{},this.options);
		this.options = $.extend(true,_opts,opts);
		this.$ele = ele;
		this._init();
		return this;
	};
	var $pp = myPhoto.prototype;          // 原型
	$pp.options =                         // 可选参数 
	{
		imgSelector: 'img',               // img元素图片选择器
		urlAttrName: 'src',               // 获取图片url的属性
		titleAttrName: 'name',            // 获取图片名称的属性
		btns:[],                          // 按钮组，格式:[{id:'',iconCls:'','text':'',alt:'',hanlder:functioni(this,$img){}},{...}]
		singleEleMode: true,              // 元素模式，单元素模式和多元素模式，单元素模式：共享一份页面元素,多元素模式：根据实例数量生成对应的元素，默认：单元素模式
		onOpen: function(){},             // 当打开时回调
		onNext: function(){},             // 下一张时回调
		onPrevious: function(){},         // 上一张时回调 
		keys: {'close': 27,'previous': [37,65],'next': [39,68]}, // 键盘配置，close: 关闭的键盘码，默认：27 即ESC键、previous: 上一张的键盘码，默认：37,65 即A键、<-键。 next: 下一张的键盘码，默认：39,68 即D键、->键
	};
	$pp.config =                          // 默认配置
	{
		containerCls: 'myphoto',          
		closeBtnCls: 'close',
		prevBtnCls: 'previous',
		nextBtnCls: 'next',
		titleCls: 'title',
		contentCls: 'content',
		toolbarCls: 'toolbar',
		helpCls: 'help fa fa-info-circle fa-2x',
		helpContentCls: 'help-content',
		prevOrNextWidth: 50,
		titleHeight: 30,
		toolbarHeight: 35,
		downloadAlt: '下载图片',
		defaultContentCss:{'height':200,'width':200},
		helpContent:'<p>帮助：</>' +
//			'<p class="info">1.退出：键盘左上角的ESC(退出)键、页面右上角的<i class="icon icon-remove"></i>按钮</p>' + 
			'<p class="info">1.退出：键盘的C键、页面右上角的 X 按钮</p>' + 
			'<p class="info">2.上一张：键盘的A键、 <-(左方向)键、页面左侧的   < 按钮</p>' + 
			'<p class="info">3.下一张：键盘的D键、 ->(右方向)键、页面右侧的   > 按钮</p>' + 
			'<p class="info">4.图片名称：页面的最顶部居中位置</p>' + 
			'<p class="info">5.操作按钮：页面的最底部居中位置</p>',
	};
	
	/**
	 * 打开图片
	 * @param {Number} index 要打开的图片索引，即要打开第几个张图片，从0开始
	 */
	$pp.open = function(index)
	{
		this._showImage(index);
		this.options.onOpen.call(this);
	};
	/**
	 * 关闭窗口
	 */
	$pp.close = function()
	{
		this.$content.removeAttr('style')
			.css(this.config.defaultContentCss).children('img').attr('src','');
		this.$title.empty();
		this.$container.hide();
		this.isShow = false;
	};
	/**
	 * 初始化
	 */
	$pp._init = function()
	{
		this.created = this.$ele.data("created");
		// 如果没有被初始化
		if(!this.created)
		{
			this.$ele.data("created",true);
		}	
		this.imageIndex = 0;
		this._instanceId_ = new Date().getTime() + '_' + parseInt((Math.random() * 10000)); 
		this._create();
		this.$ele.data('_instanceId_',this._instanceId_);
		this.$ele.data("This",this);
	};
	/**
	 * 创建容器
	 */
	$pp._create = function()
	{
		this._check();
		var me = this,
			$div = $('<div/>').addClass(this.config.containerCls),
			$close = $('<a/>').addClass(this.config.closeBtnCls),
			$prev = $('<a/>').addClass(this.config.prevBtnCls),
			$next = $('<a/>').addClass(this.config.nextBtnCls),
			$title = $('<div/>').addClass(this.config.titleCls);
//			$content = $('<div/>').addClass(this.config.contentCls).append($('<img/>')),
			$content = $('<div/>').addClass(this.config.contentCls),
			$toolbar = $('<div/>').addClass(this.config.toolbarCls);
			$help = $('<i/>').addClass(this.config.helpCls);
			$helpContent = $('<div/>').addClass(this.config.helpContentCls),
			$div.append($close).append($close).append($prev).append($next)
				.append($title).append($content).append($toolbar)
				.append($help).append($helpContent)
				.appendTo($('body'));
		if(this.options.singleEleMode){
			$div.removeAttr('id');
		}else{
			$div.attr('id',this._instanceId_); // 增加ID属性
		}	
		// 按钮组
		if(this.options.btns && this.options.btns.length)
		{
			var btn,$btn;
			for(var i in this.options.btns)
			{
				btn = this.options.btns[i];
				$btn = $('<i id="' + (btn.id || '') + '" class="' + (btn.iconCls || '') 
					+ '" title="' + (btn.alt || '') + '">' + (btn.text || '') + '</i>');
				$btn.data('btnIndex',i);
				$toolbar.append($btn);
				$btn.bind('click',function(){
					var hanlder = me.options.btns[$(this).data('btnIndex')].hanlder;
					hanlder ? hanlder.call($(this),$(this).parent().siblings('.' + me.config.contentCls)
						.find('img'),me.imageIndex ) : null;
				});
			}
		}
		// 帮助信息
		$helpContent.html(this.config.helpContent);
		// 缓存当前元素信息
		this.$container = $div;
		this.$title = $title;
		this.$toolbar = $toolbar;
		this.$content = $content;
		// 关闭窗口事件
		$close.bind('click',function(){
			me.close();
		});
		// 上一张事件
		$prev.bind('click',function(){
			me._goPrevious();
		});
		// 下一张事件
		$next.bind('click',function(){
			me._goNext();
		});
		$(document).bind('keyup',function(evt){
			if(!me.isShow)
			{
				return false;
			}
			evt = evt || window.event;
			var code = evt.keyCode || evt.which;
			if(me._isOperatingKeys(code,'close'))               // 关闭键
			{
				me.close();                                     // 关闭
			}else if(me._isOperatingKeys(code,'previous'))               
			{
				me._goPrevious();                               // 上一张
			}else if(me._isOperatingKeys(code,'next'))              
			{
				me._goNext();                                   // 下一张
			}
		});
		$(window).resize(function(){
			me._calcPosition();
		});
		
	};
	// 是否是操作键
	$pp._isOperatingKeys = function(keyCode,type){
		var keys = this.options.keys || {},
			keyCodes = keys[type];
		keyCodes = typeof keyCodes === 'object' && keyCodes.constructor === Array ? keyCodes : [keyCodes];
		return $.inArray(keyCode,keyCodes) > -1;
	},
	$pp._check = function()
	{
		var $container = this.options.singleEleMode ? $('body').find('.' + this.config.containerCls).not('[id]') 
				: $('body').find('#' + this.$ele.data('_instanceId_'));
		if($container && $container.length)
		{
			$container.remove();
		}
	};
	/**
	 * 显示上一张
	 */
	$pp._goPrevious = function()
	{
		this._go('previous');
	};
	/**
	 * 显示下一张
	 */
	$pp._goNext = function()
	{
		this._go('next');
	};
	$pp._go = function(type)
	{
		if(!this.isShow)
		{
			return false;
		}
		var index = this._calcShowImageIndex(this.imageIndex,type);
		this._showImage(index);
		var callName = 'on' + type.substr(0,1).toUpperCase() + type.substr(1);
		if(typeof this.options[callName] == 'function'){
			this.options[callName].call(this);
		}
	};
	/**
	 * 显示指定url的图片
	 */
	$pp._showImage = function(index)
	{
		var me = this,
			info = this._getShowImageInfo(index),
			$img = this.$content.children('img');
		if(!$img.length)
		{
			$img = $('<img>'); 
			this.$content.append($img);
			this._calcFirstInitPosition();
			$img.attr('src',info.url);
		}else
		{
			$img.attr('src','').attr('src',info.url);
		}
		if($img.length && $img[0])
		{
			$img[0].onload = function(){
            	me._calcPosition();
        	}
		}
		this.$title.html(info.title);
		this.imageIndex = index;
		this.$container.show();
		this.isShow = true;
//		this._calcPosition();
	};
	/**
	 * 计算上一张或下一张的位置
	 * @param {Object} index
	 * @param {Object} type
	 */
	$pp._calcShowImageIndex = function(index,type)
	{
		var len = this.$ele.children('li').length,
			imgIndex = 0;
		// 上一张
		if(type == 'previous')
		{
			imgIndex = index == 0 ? len - 1 : index - 1;  // 如果当前是第一张，则上一张则是最后一张
		}else if(type == 'next')
		{
			imgIndex = index == len - 1 ? 0 : index + 1;  // 如果当前是最后一张，则下一张则是第一张
		}
		return imgIndex;
	};
	$pp._getShowImageInfo = function(index)
	{
		var $li = this.$ele.children('li').eq(index),
			$img = $li.find(this.options.imgSelector);
		return {url:$img.attr(this.options.urlAttrName),
				title:$img.attr(this.options.titleAttrName)};
	};
	$pp._calcPosition = function()
	{
		var $img = this.$content.children('img'),
			naW = $img[0] ? $img[0].naturalWidth : this.config.defaultContentCss.width,
			naH = $img[0] ? $img[0].naturalHeight : this.config.defaultContentCss.height,
			winW = this.$container.width() - this.config.prevOrNextWidth * 2,
			winH = this.$container.height() - this.config.titleHeight - this.config.toolbarHeight,
			whRatio = Number(Number(naW)/Number(naH)).toFixed(2),
			hwRatio = Number(Number(naH)/Number(naW)).toFixed(2),
			css = {'max-width': winW + 'px','max-height': winH + 'px'};
		$img.css($.extend({},css,{'width':'100%','height':'100%'}));
		// 宽度、高度取值
		$.extend(css,{'width': (naW > winW ? winW : naW),'height': (naH > winH ? winH : naH)});
		// 按比例缩放，解决图片不变形
		var w = css.width,h = css.height;
		$.extend(css,{'width': h * whRatio,'height': w * hwRatio});
		// 计算位置
		$.extend(css,{'left': (50 + ((winW - css.width) > 0 ?(winW - css.width)/2 : 0)),
			'top': (naH > winH ? this.config.titleHeight : this.config.titleHeight + ((winH - css.height) > 0 ? (winH - css.height)/2 : 0))});
		this.$content.css(css);
	};
	$pp._calcFirstInitPosition = function()
	{
		var cfg = this.config,
			configCss = cfg.defaultContentCss, 
			$img = this.$content.children('img');
		$img.css(configCss);
		this.$content.css({'top':(this.$container.height() - configCss.height)/2,'left':(this.$container.width() - configCss.width)/2});
	};
	/**
	 * 扩展Jquery插件
	 * @param {Object} args
	 */
	$.fn.myPhoto = function(args)
	{
		if(typeof args == 'string' 
			&& args.indexOf('_') != 0
			&& $pp[args] 
			&& typeof $pp[args] == 'function')
		{
			var THIS = this.data("This");
			if(!THIS)
			{
				return;
			}	
			return $pp[args].apply(THIS,Array.prototype.slice.call(arguments, 1));
		}else if(typeof args == 'object') 
		{
			return new myPhoto(this,args);
		}else
		{
			$.error("MyPhoto not support the arguments:" + args);
		}
	};
})(window,jQuery);
