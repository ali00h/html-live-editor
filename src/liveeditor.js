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
		cssCode += '.liveeditor-wrap{display: block;width:100%;border:1px solid black;}';
		cssCode += '.liveeditor-tools{display: block;width:100%;margin:10px}';
		cssCode += '.liveeditor-box{display: flex;width:100%;}';
		cssCode += '.liveeditor{width:50%;height:' + this.config.height + 'px}';
		cssCode += '.liveeditor-preview{width:50%;border:1px solid;}';
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
		html += '<button class="tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<h1>\nnew\n</h1>\n">' + this.lang.get("addh1") + '</button>';
		html += '<button class="tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<h2>\nnew\n</h2>\n">' + this.lang.get("addh2") + '</button>';

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
		_l["addh1"] = "Add H1";
		_l["addh2"] = "Add H2";
		_l["addh3"] = "Add H3";
		_l["addb"] = "Add B";
		_l["addimg"] = "Add IMG";
		this.arr["en"] = _l;
	}	

	init_fa(){
		const _l = [];
		_l["addh1"] = "اضافه کردن H1";
		this.arr["fa"] = _l;
	}		
}