$.fn.LiveEditor = function(config){
    this.each(function(index){
		let newLiveEditor = new LiveEditorClass($(this),index,config);
    });    
};

$.fn.extend({
	insertAtCaret: function(myValue) {
	  this.each(function() {
		if (document.selection) {
		  this.focus();
		  var sel = document.selection.createRange();
		  sel.text = myValue;
		  this.focus();
		} else if (this.selectionStart || this.selectionStart == '0') {
		  var startPos = this.selectionStart;
		  var endPos = this.selectionEnd;
		  var scrollTop = this.scrollTop;
		  this.value = this.value.substring(0, startPos) +
			myValue + this.value.substring(endPos,this.value.length);
		  this.focus();
		  this.selectionStart = startPos + myValue.length;
		  this.selectionEnd = startPos + myValue.length;
		  this.scrollTop = scrollTop;
		} else {
		  this.value += myValue;
		  this.focus();
		}
	  });
	  return this;
	}
});

$( document ).ready(function() {
	$("button.tools-insert-code").on("click", function() {
		let mainObj = $(this).data("mainObj");
		let appendData = $(this).data("appendData");
		//console.log(mainObj);
		//console.log($("." + mainObj + " .liveeditor").val());
		$("." + mainObj + " .liveeditor").insertAtCaret(appendData)
	});			
});


class LiveEditorClass{
	constructor(_obj,_index,_config){
		
		this.obj = _obj
		this.wrap_obj_name = 'lv' + _index + '-' + Math.floor(Math.random() * 10000);

		this.initConfig(_config);
		this.lang = new LiveEditorLang(this.config.language)
		this.validator = new LiveEditorValidator()
		this.init();
	}

	initConfig(_config){
		const configDefault = {
			preview_head_additional_code: '',
			height:'300',
			preview_refresh_rate:5000,
			language:'en'
		};
		this.config = { ...configDefault, ..._config }
		//console.log(this.config);
	}
	
	init(){
		this.old = '';

		this.addCSS();
		this.obj.addClass("liveeditor");
		this.obj.wrap('<div class="liveeditor-wrap ' + this.wrap_obj_name + '"></div>');
		this.obj.wrap('<div class="liveeditor-box"></div>');
		this.obj.parent().append("<iframe class='liveeditor-preview' id='p" + this.wrap_obj_name + "'></iframe>");	
		$('.' + this.wrap_obj_name).prepend("<div class='liveeditor-tools'>" + this.getToolsBox() + "</div>");	

		this.addIframeHead();
		this.update();
	}
	
	update(){
		
		if (this.old != this.obj.val()) {
			this.old = this.obj.val();
			//this.preview_obj.contents().append(this.old);
			var $iframe = $('#p' + this.wrap_obj_name);
			var $oldVar = this.old;
			var checkValidate = this.validator.validate($oldVar);
			if(checkValidate)
				$iframe.removeClass("html-validate-error");
			else
				$iframe.addClass("html-validate-error");
			$("." + this.wrap_obj_name + " .tools-error").text(this.lang.get(this.validator.error));
			$iframe.ready(function() {
			    $iframe.contents().find("body").html($oldVar);
			});			
		}
		
		setTimeout(() => {this.update();}, this.config.preview_refresh_rate);
	}
	
	addCSS(){
		if($("style[data-n-head=25626548]")[0]) return;
		let cssCode = '';
		cssCode += '<style data-n-head="25626548">';
		cssCode += '.liveeditor-wrap{display: block;width:100%;	color: #555;background-color: #fff;background-image: none;border: 1px solid #ccc;border-radius: 3px;-webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);-webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;-o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;}';
		cssCode += '.liveeditor-tools{display: block;width:100%;margin:10px}';
		cssCode += '.liveeditor-box{display: flex;width:100%;}';
		cssCode += '.liveeditor{width:50%;margin:5px;height:' + this.config.height + 'px}';
		cssCode += '.liveeditor-preview{width:50%;margin:5px;border:1px solid;}';
		cssCode += '.html-validate-error{border:1px solid red;}';
		cssCode += `.liveeditor-wrap .tools-insert-code {
			background-color: #fff;
			border-width: 1px;
			color: #363636;
			cursor: pointer;
			justify-content: center;
			padding-bottom: calc(.5em - 1px);
			padding-left: 1em;
			padding-right: 1em;
			padding-top: calc(.5em - 1px);
			text-align: center;
			white-space: nowrap;
			background-color: #eff5fb;
			color: #296fa8;
			border-color: transparent;
			line-height: 1.5;
			position: relative;
			display: inline-flex;
			box-shadow: none;
			border-radius: .375em;
			border: 1px solid transparent;
			-webkit-appearance: none;	
			margin-left:5px;		
		}`;
		cssCode += `.liveeditor-wrap .tools-error {
			margin-right:10px;
			color: red;
		}`;		
		cssCode += '</style>';
		document.head.innerHTML += cssCode;
	}

	addIframeHead(){
		var $iframe = $('#p' + this.wrap_obj_name);
		var $iframeHead = this.config.preview_head_additional_code;
		$iframe.ready(function() {
			$iframe.contents().find("head").html($iframeHead);
		});				
	}

	getToolsBox(){
		var html = '';
		html += '<button class="tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<br>\n">' + this.lang.get("add_br") + '</button>';
		html += '<button class="tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<h1>\nyour_text\n</h1>\n">' + this.lang.get("add_h1") + '</button>';
		html += '<button class="tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<h2>\nyour_text\n</h2>\n">' + this.lang.get("add_h2") + '</button>';
		html += '<button class="tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<h3>\nyour_text\n</h3>\n">' + this.lang.get("add_h3") + '</button>';
		html += '<button class="tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<p>\nyour_text\n</p>\n">' + this.lang.get("add_p") + '</button>';
		html += '<button class="tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<b>\nyour_text\n</b>\n">' + this.lang.get("add_b") + '</button>';
		html += '<button class="tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<img src=\'your_url\' width=\'200\' height=\'200\'>\n">' + this.lang.get("add_img") + '</button>';
		html += '<button class="tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<a href=\'your_url\'>\nyour_text\n</a>\n">' + this.lang.get("add_link") + '</button>';
		html += '<span class="tools-error"></span>';
		return html;
	}
	
}

class LiveEditorLang{
	constructor(_lang){
		this.lang = _lang;
		this.arr = []
		this.init()
	}

	init(){
		this.init_en();
		this.init_fa();
	}

	get(key){
		let translated = this.arr[this.lang][key];
		if(translated != undefined)
			return translated;
		else 
			return key;
	}

	init_en(){
		const _l = [];
		_l["add_br"] = "New Line";
		_l["add_h1"] = "Add H1";
		_l["add_h2"] = "Add H2";
		_l["add_h3"] = "Add H3";
		_l["add_p"] = "Add P";
		_l["add_b"] = "Add B";
		_l["add_img"] = "Add IMG";
		_l["add_link"] = "Add LINK";
		_l["open_tags_are_not_closed"] = "Open tags are not closed.";
		this.arr["en"] = _l;
	}	

	init_fa(){
		const _l = [];
		_l["add_br"] = "اضافه کردن خط جدید";
		_l["add_h1"] = "اضافه کردن H1";
		_l["add_h2"] = "اضافه کردن H2";
		_l["add_h3"] = "اضافه کردن H3";
		_l["add_p"] = "پاراگراف جدید";
		_l["add_b"] = "اضافه کردن B";
		_l["add_img"] = "عکس جدید";	
		_l["add_link"] = "لینک جدید";
		_l["open_tags_are_not_closed"] = "تگ های باز شده بسته نشده اند.";	
		this.arr["fa"] = _l;
	}		
}

class LiveEditorValidator{
	constructor(){
		this.error = '';
	}	

	validate(content){
		if(content == ''){
			this.error = '';
			return true;
		}
		this.error = 'open_tags_are_not_closed';
		return false;
	}
}