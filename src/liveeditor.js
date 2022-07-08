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
		let your_img_url = $("." + mainObj + " .liveeditor-tools input[name='image']").val();
		if(your_img_url != undefined && your_img_url != ''){
			console.log(your_img_url);
			appendData = appendData.replace("your_img_url",your_img_url);
		}

		let your_url = $("." + mainObj + " .liveeditor-tools input[name='url']").val();
		if(your_url != undefined && your_url != ''){
			console.log(your_url);
			appendData = appendData.replace("your_url",your_url);
		}		

		$("." + mainObj + " .liveeditor").insertAtCaret(appendData)
	});	
	$("button.tools-change-direction").on("click", function() {
		let mainObj = $(this).data("mainObj");
		let objText = $("." + mainObj + " .liveeditor");
		if(objText.hasClass("ltr-direction")){
			objText.addClass("rtl-direction");
			objText.removeClass("ltr-direction");
		}else{
			objText.addClass("ltr-direction");
			objText.removeClass("rtl-direction");			
		}
		
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
			height:'400',
			preview_refresh_rate:1000,
			language:'en',
			additional_tools:[]
		};
		this.config = { ...configDefault, ..._config }
		//console.log(this.config);
	}
	
	init(){
		this.old = '';

		this.addCSS();
		this.obj.val(this.getHtmlBeautifier(this.obj.val()));
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
			$("." + this.wrap_obj_name + " .tools-error").text(this.validator.error);
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
		cssCode += '.liveeditor{width:50%;color: #545454;border: 1px solid #a9a9a9;border-radius: 6px;margin:5px;height:' + this.config.height + 'px}';
		cssCode += '.ltr-direction{direction:ltr !important;}';
		cssCode += '.rtl-direction{direction:rtl !important;}';
		cssCode += `.liveeditor-preview{
			width:50%;
			margin:5px;
			border:0;
			border-radius: 6px;
			box-shadow: 0 .5em 1em 1px rgba(10,10,10,.1),0 0 0 1px rgba(10,10,10,.02);
		}`;
		cssCode += '.html-validate-error{border:1px solid red;}';
		cssCode += `.liveeditor-wrap .liveeditor-tools .bt {
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
			margin-left:10px;
			color: red;
			direction: ltr;
			display: inline;
			text-align: left;
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
		var component_arr = [];
		
		component_arr.push('<button type="button" class="bt tools-change-direction" data-main-obj="' + this.wrap_obj_name + '">' + this.lang.get("change_dir") + '</button>');
		component_arr.push('<button type="button" class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<br>\n">' + this.lang.get("add_br") + '</button>');
		component_arr.push('<button type="button" class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<h1>\nyour_text\n</h1>\n">' + this.lang.get("add_h1") + '</button>');
		component_arr.push('<button type="button" class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<h2>\nyour_text\n</h2>\n">' + this.lang.get("add_h2") + '</button>');
		component_arr.push('<button type="button" class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<h3>\nyour_text\n</h3>\n">' + this.lang.get("add_h3") + '</button>');
		component_arr.push('<button type="button" class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<p>\nyour_text\n</p>\n">' + this.lang.get("add_p") + '</button>');
		component_arr.push('<button type="button" class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<b>\nyour_text\n</b>\n">' + this.lang.get("add_b") + '</button>');		
		component_arr.push('<button type="button" class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<a href=\'your_url\'>\nyour_text\n</a>\n">' + this.lang.get("add_link") + '</button>');
		component_arr.push('<button type="button" class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<img src=\'your_img_url\' width=\'200\' height=\'200\'>\n">' + this.lang.get("add_img") + '</button>');
		component_arr.push('<div class="tools-error"></div>');
		
		
		for (let j = 0; j < this.config.additional_tools.length; j++) {
			let add_tool = this.config.additional_tools[j];
			component_arr.splice(add_tool.index, 0, add_tool.obj);
		}

		var html = '';
		for (let i = 0; i < component_arr.length; i++) {
			html += component_arr[i];
		}		
		return html;
	}

	getHtmlBeautifier(html) {
		var tab = '\t';
		var result = '';
		var indent= '';
	
		html.split(/>\s*</).forEach(function(element) {
			if (element.match( /^\/\w/ )) {
				indent = indent.substring(tab.length);
			}
	
			result += indent + '<' + element + '>\r\n';
	
			if (element.match( /^<?\w[^>]*[^\/]$/ ) && !element.startsWith("input")  ) { 
				indent += tab;              
			}
		});
	
		return result.substring(1, result.length-3);
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
		_l["change_dir"] = "Dir";
		_l["add_br"] = "Br";
		_l["add_h1"] = "H1";
		_l["add_h2"] = "H2";
		_l["add_h3"] = "H3";
		_l["add_p"] = "P";
		_l["add_b"] = "B";
		_l["add_img"] = "Add Img";
		_l["add_link"] = "link";
		this.arr["en"] = _l;
	}	

	init_fa(){
		const _l = [];
		_l["change_dir"] = "Dir";
		_l["add_br"] = "Br";
		_l["add_h1"] = "H1";
		_l["add_h2"] = "H2";
		_l["add_h3"] = "H3";
		_l["add_p"] = "P";
		_l["add_b"] = "B";
		_l["add_img"] = "Add Img";
		_l["add_link"] = "link";
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

		let _validator = this.validHTML(content);

		if(_validator){
			let existEmptyTag = this.findEmptyTags(content);
			console.log("existEmptyTag: " + existEmptyTag);
			_validator = !(existEmptyTag);
		}

		if(_validator) this.error = '';
		return _validator;
	}

	validHTML(html) { // checks the validity of html, requires all tags and property-names to only use alphabetical characters and numbers (and hyphens, underscore for properties)
		html = html.toLowerCase().replace(/(?<=<[^>]+?=\s*"[^"]*)[<>]/g,"").replace(/(?<=<[^>]+?=\s*'[^']*)[<>]/g,""); // remove all angle brackets from tag properties
		html = html.replace(/<script.*?<\/script>/g, '');  // Remove all script-elements
		html = html.replace(/<style.*?<\/style>/g, '');  // Remove all style elements tags
		html = html.toLowerCase().replace(/<[^>]*\/\s?>/g, '');      // Remove all self closing tags
		html = html.replace(/<(\!|br|hr|img).*?>/g, '');  // Remove all <br>, <hr>, and <img> tags
		//var tags=[...str.matchAll(/<.*?>/g)]; this would allow for unclosed initial and final tag to pass parsing
		html = html.replace(/^[^<>]+|[^<>]+$|(?<=>)[^<>]+(?=<)/gs,""); // remove all clean text nodes, note that < or > in text nodes will result in artefacts for which we check and return false
		var tags = html.split(/(?<=>)(?=<)/);
		if (tags.length%2==1) {
			this.error = ("uneven number of tags in "+html)
			return false;
		}
		var tagno=0;
		while (tags.length>0) {
			if (tagno==tags.length) {
				this.error = ("these tags are not closed: "+tags.slice(0,tagno).join());
				return false;
			}
			if (tags[tagno].slice(0,2)=="</") {
				if (tagno==0) {
					this.error = ("this tag has not been opened: "+tags[0]);
					return false;
				}
				var tagSearch=tags[tagno].match(/<\/\s*([\w\-\_]+)\s*>/);
				if (tagSearch===null) {
					this.error = ("could not identify closing tag "+tags[tagno]+" after "+tags.slice(0,tagno).join());
					return false;
				} else tags[tagno]=tagSearch[1];
				if (tags[tagno]==tags[tagno-1]) {
					tags.splice(tagno-1,2);
					tagno--;
				} else {
					this.error = ("tag '"+tags[tagno]+"' trying to close these tags: "+tags.slice(0,tagno).join());
					return false;
				}
			} else {
				tags[tagno]=tags[tagno].replace(/(?<=<\s*[\w_\-]+)(\s+[\w\_\-]+(\s*=\s*(".*?"|'.*?'|[^\s\="'<>`]+))?)*/g,""); // remove all correct properties from tag
				var tagSearch=tags[tagno].match(/<(\s*[\w\-\_]+)/);
				if ((tagSearch===null) || (tags[tagno]!="<"+tagSearch[1]+">")) {
					this.error = ("fragmented tag with the following remains: "+tags[tagno]);
					return false;
				}
				var tagSearch=tags[tagno].match(/<\s*([\w\-\_]+)/);
				if (tagSearch===null) {
					this.error = ("could not identify opening tag "+tags[tagno]+" after "+tags.slice(0,tagno).join());
					return false;
				} else tags[tagno]=tagSearch[1];
				tagno++;
			}
		}
		return true;
	}	

	checkHTML(html) {
		var doc = document.createElement('div');
		doc.innerHTML = html;
		return ( doc.innerHTML === html );
	}	

	findEmptyTags(str){
		const regex = /<([^>]+)\s*([^>]*)>\s*<\/\1\s*>/gm;

		let m;
		var $res_finded = false;
		var $res_error = '';

		while ((m = regex.exec(str)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			
			// The result can be accessed through the `m`-variable.
			m.forEach((match, groupIndex) => {
				console.log(groupIndex + " " + match);
				if(groupIndex == 0){
					$res_error = match;
					$res_finded = true;
				}  
			});
		}		

		this.error = "Empty Tag: " + $res_error;
		return $res_finded;
	}
}