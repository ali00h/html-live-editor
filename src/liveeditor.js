$( document ).ready(function() {
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

	$(document).on('click', 'button.tools-insert-code', function () {
		let mainObj = $(this).data("mainObj");
		let appendData = $(this).data("appendData");
		let le_config = $("." + mainObj + " .liveeditor").data('config');
		//console.log(le_config);
		//console.log($("." + mainObj + " .liveeditor").val());
		let your_img_url = $("." + mainObj + " .liveeditor-tools input[name='image']").val();
		if(your_img_url != undefined && your_img_url != ''){
			console.log(your_img_url);
			appendData = appendData.replace("your_img_url",le_config.image_url_prefix + your_img_url);
		}

		let your_url = $("." + mainObj + " .liveeditor-tools input[name='url']").val();
		if(your_url != undefined && your_url != ''){
			console.log(your_url);
			appendData = appendData.replace("your_url",your_url);
		}

		$("." + mainObj + " .liveeditor").insertAtCaret(appendData)
	});
	$(document).on('click', 'button.tools-change-direction', function () {
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

	$(document).on('click', 'button.tools-draft', function () {
		$(".restore-modal").remove();
		let mainObj = $(this).data("mainObj");
		let objText = $("." + mainObj + " .liveeditor");
		let draft_url = $("." + mainObj + " .liveeditor").attr('draft_url');
		//console.log(objText.val());
		let andPosition = draft_url.search("&");
		if(andPosition > 0)
			draft_url = draft_url + "&type=save"
		else
			draft_url = draft_url + "?type=save"

		let settings = {
			"url": draft_url,
			"method": "POST",
			"timeout": 0,
			"headers": {
				"Content-Type": "text/plain"
			},
			"data": objText.val(),
		};

		$.ajax(settings).done(function (response) {
			if(response['message'] != '')
				$.fn.toast(response['message']);
		}).fail(function() {
			$.fn.toast('Error in draft saving!');
		});
	});

	$(document).on('click', 'button.tools-restore', function () {
		$(".restore-modal").remove();
		let mainObj = $(this).data("mainObj");
		let objText = $("." + mainObj + " .liveeditor");
		let draft_url = $("." + mainObj + " .liveeditor").attr('draft_url');
		let andPosition = draft_url.search("&");
		if(andPosition > 0)
			draft_url = draft_url + "&type=load"
		else
			draft_url = draft_url + "?type=load"

		let parent_obj = $(this).parent();
		let settings = {
			"url": draft_url,
			"method": "GET",
			"timeout": 0,
			"headers": {
				"Content-Type": "text/plain"
			},
			"data": "",
		};

		$.ajax(settings).done(function (response) {
			let json_data = response;

			let modalHtml = '<div class="restore-modal"><ul>';
			for(let i=0;i<json_data.length;i++){
				modalHtml += '<li><button type="button" class="restore-action" data-main-obj="' + mainObj + '"  data-append-data="' + json_data[i].content + '">' + json_data[i].set_date + '</button></li>';
			}
			modalHtml += '</ul></div>';
			parent_obj.append(modalHtml);
		}).fail(function() {
			$.fn.toast('Error in draft loading!');
		});

	});

	$(document).on('click', 'button.restore-action', function () {
		let mainObj = $(this).data("mainObj");
		let appendData = $(this).data("appendData");
		$("." + mainObj + " .liveeditor").val(appendData);
	});

	$(document).on('mouseenter', 'button.tools-group-bt', function() {
		//console.log('enter');
		$('.tools-group').hide();
		$(this).next().show();
	});
	$(document).on('mouseleave', 'div.tools-group-panel', function() {
		//console.log('leave');
		$('.tools-group').hide();
	});

	$.fn.toast = function(msg) {
		$("#snackbar").remove();
		$("body").append('<div id="snackbar">' + msg + '</div>');
		$("#snackbar").addClass("show");
		setTimeout(function(){ $("#snackbar").removeClass("show"); }, 3000);
	}

	setInterval(function(){
		console.log('interval called!' + (new Date()));
		$("button.tools-draft").trigger('click');
	}, 300000);

});


class LiveEditorClass{
	constructor(_obj,_index,_config){

		this.obj = _obj
		this.keyword_input = null;
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
			additional_tools:[],
			image_url_prefix:'',
			keyword_separator:','
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

		let draft_url_temp = $("." + this.wrap_obj_name + " .liveeditor").attr("draft_url");
		if (typeof draft_url_temp !== 'undefined' && draft_url_temp !== false && draft_url_temp.length > 10) {
			this.draft_url = draft_url_temp;
		}else{
			this.draft_url = false;
		}

		$('.' + this.wrap_obj_name).prepend("<div class='liveeditor-tools'>" + this.getToolsBox() + "</div>");
		this.obj.data('config', this.config);
		//this.addIframeHead();
		let keyword_input_attr = this.obj.attr('keyword-input');
		if(keyword_input_attr){
			this.keyword_input = $(keyword_input_attr);
		}




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
			var obj_iframe = document.querySelector('#p' + this.wrap_obj_name);
			var obj_iframe_window = this.getIframeWindow(obj_iframe);//.getScrollPos();
			var scr_pos = "0";
			if(obj_iframe.srcdoc != ""){
				scr_pos = obj_iframe_window.getScrollPos();
				//console.log(scr_pos);
			}
			let keyword_report = this.getKeywordMetaInfo($oldVar);
			var html_string = "<!DOCTYPE html><html><head><meta data-n-head='1' data-hid='charset' charset='utf-8'><meta data-n-head='1' name='viewport' content='width=device-width, initial-scale=1'><script>function getScrollPos(){return (window.pageYOffset);}</script>" + this.config.preview_head_additional_code + "</head><body onLoad='window.scrollTo(0," + scr_pos + ")'>" + keyword_report + $oldVar  + "</body></html>";

			obj_iframe.srcdoc = html_string;


		}

		setTimeout(() => {this.update();}, this.config.preview_refresh_rate);
	}

	getIframeWindow(iframe_object) {
		var doc;

		if (iframe_object.contentWindow) {
			return iframe_object.contentWindow;
		}

		if (iframe_object.window) {
			return iframe_object.window;
		}

		if (!doc && iframe_object.contentDocument) {
			doc = iframe_object.contentDocument;
		}

		if (!doc && iframe_object.document) {
			doc = iframe_object.document;
		}

		if (doc && doc.defaultView) {
			return doc.defaultView;
		}

		if (doc && doc.parentWindow) {
			return doc.parentWindow;
		}

		return undefined;
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
		cssCode += `.liveeditor-wrap .liveeditor-tools a.bt {font-size:10pt;line-height:1.2;}`;
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
		cssCode += `.liveeditor-wrap .tools-group {
			display: none;
			position: absolute;
			background-color: #ffffff;
			border: 1px solid rgba(0, 0, 0, 0.2);
			box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
			border-radius: 0px 0px 5px 5px;
			margin: auto 5px;
			min-width: 100px;
			padding: 5px;
			z-index:12;
		}`;
		cssCode += `.liveeditor-wrap .tools-group-panel {
			display:inline-block;
		}`;
		cssCode += `.liveeditor-wrap .restore-modal ul {
			display: block;
			margin: 0;
			padding: 0;
			margin-top:10px;
		}
		.liveeditor-wrap .restore-modal li {
			display: block;
			margin: 0;
			padding: 0;
		}	
		.liveeditor-wrap .restore-modal button {
			border-width: 1px;
			color: #ffffff;
			cursor: pointer;
			justify-content: center;
			padding-bottom: calc(.5em - 1px);
			padding-left: 1em;
			padding-right: 1em;
			padding-top: calc(.5em - 1px);
			text-align: center;
			white-space: nowrap;
			background-color: #17a2b8;
			border-color: transparent;
			line-height: 1.5;
			position: relative;
			display: inline-flex;
			box-shadow: none;
			border-radius: .375em;
			border: 1px solid transparent;
			-webkit-appearance: none;	
			margin-left:5px;
			margin-top:5px;
		}				
		`;
		cssCode += `
			#snackbar {
			  visibility: hidden;
			  min-width: 250px;
			  background-color: #2196f3;
			  color: #fff;
			  text-align: center;
			  border-radius: 2px;
			  padding: 16px;
			  position: fixed;
			  z-index: 1000;
			  
			  bottom: 30px;
			  font-size: 17px;
			  border-radius: 5px;
			}
			
			#snackbar.show {
			  visibility: visible;
			  -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
			  animation: fadein 0.5s, fadeout 0.5s 2.5s;
			}
			
			@-webkit-keyframes fadein {
			  from {bottom: 0; opacity: 0;} 
			  to {bottom: 30px; opacity: 1;}
			}
			
			@keyframes fadein {
			  from {bottom: 0; opacity: 0;}
			  to {bottom: 30px; opacity: 1;}
			}
			
			@-webkit-keyframes fadeout {
			  from {bottom: 30px; opacity: 1;} 
			  to {bottom: 0; opacity: 0;}
			}
			
			@keyframes fadeout {
			  from {bottom: 30px; opacity: 1;}
			  to {bottom: 0; opacity: 0;}
			}		
		`;

		cssCode += '</style>';
		document.head.innerHTML += cssCode;
	}


	getToolsBox(){
		let component_arr = [];

		component_arr.push('<button type="button"  class="bt tools-change-direction" data-main-obj="' + this.wrap_obj_name + '">' + this.lang.get("change_dir") + '</button>');
		component_arr.push('<div class="tools-group-panel"><button type="button" class="bt tools-group-bt">' + this.lang.get("format") + '</button><div class="tools-group">' +
			'<button type="button"  class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<br>\n">' + this.lang.get("add_br") + '</button>' +
			'<button type="button"  class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<p>\nyour_text\n</p>\n">' + this.lang.get("add_p") + '</button>' +
			'<button type="button"  class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<b>\nyour_text\n</b>\n">' + this.lang.get("add_b") + '</button>' +
			'<button type="button"  class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<pre>\nyour_text\n</pre>\n">' + this.lang.get("add_pre") + '</button>' +
			'</div></div>');
		component_arr.push('<div class="tools-group-panel"><button type="button" class="bt tools-group-bt">' + this.lang.get("add_h") + '</button><div class="tools-group">' +
			'<button type="button"  class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<h1>\nyour_text\n</h1>\n">' + this.lang.get("add_h1") + '</button>' +
			'<button type="button"  class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<h2>\nyour_text\n</h2>\n">' + this.lang.get("add_h2") + '</button>' +
			'<button type="button"  class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<h3>\nyour_text\n</h3>\n">' + this.lang.get("add_h3") + '</button>' +
			'<button type="button"  class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<h4>\nyour_text\n</h4>\n">' + this.lang.get("add_h4") + '</button>' +
			'</div></div>');

		component_arr.push('<button type="button"  class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<ul>\n<li>\nyour_text\n</li>\n</ul>\n">' + this.lang.get("add_ul") + '</button>');
		component_arr.push('<button type="button"  class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<a href=\'your_url\'>\nyour_text\n</a>\n">' + this.lang.get("add_link") + '</button>');
		component_arr.push('<button type="button"  class="bt tools-insert-code" data-main-obj="' + this.wrap_obj_name + '" data-append-data="\n<img src=\'your_img_url\' width=\'200\' height=\'200\'>\n">' + this.lang.get("add_img") + '</button>');
		if(this.draft_url){
			component_arr.push('<div class="tools-group-panel"><button type="button" class="bt tools-group-bt">' + this.lang.get("draft") + '</button><div class="tools-group">' +
				'<button type="button"  class="bt tools-draft" data-main-obj="' + this.wrap_obj_name + '" >' + this.lang.get("draft") + '</button>' +
				'<button type="button"  class="bt tools-restore" data-main-obj="' + this.wrap_obj_name + '" >' + this.lang.get("restore") + '</button>' +
				'</div></div>');
		}



		for (let j = 0; j < this.config.additional_tools.length; j++) {
			let add_tool = this.config.additional_tools[j];
			let add_tool_obj = add_tool.obj;
			add_tool_obj = add_tool_obj.replace("wrap_obj_name",this.wrap_obj_name);
			component_arr.splice(add_tool.index, 0, add_tool_obj);
		}
		component_arr.push('<div class="tools-error"></div>');



		let html = '';
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

	getKeywordMetaInfo(content){
		let cleanText = content.replace(/<\/?[^>]+(>|$)/g, "");
		let wordCount = cleanText.split(" ").length

		let report = [];
		if(this.keyword_input != null) {
			let keywords = this.keyword_input.val().split(this.config.keyword_separator);

			for(let i=0 ; i < keywords.length ; i++){
				let keyword_count = content.split(keywords[i]).length-1;
				let item = new Object();
				item["keyword"] = keywords[i];
				item["count"] = keyword_count;
				report.push(item);
			}
		}
		let html = '';
		html += '<div style="position: fixed;background-color: rgba(255, 255, 0, 0.7);width: 100%;padding: 5px;bottom: 0;">';
		html += '<b>Characters: </b>' + cleanText.length;
		html += ' <b>Words: </b>' + wordCount;
		if(report.length > 0){
			html += '<br />';
			for(let p=0;p<report.length ; p++){
				html += ' <b>';
				html += report[p]["keyword"];
				html += ': </b>';
				html += report[p]["count"];
			}

		}

		html += '</div>';
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
		_l["change_dir"] = "Dir";
		_l["add_br"] = "Br";
		_l["add_h"] = "H";
		_l["add_h1"] = "H1";
		_l["add_h2"] = "H2";
		_l["add_h3"] = "H3";
		_l["add_h4"] = "H4";
		_l["add_p"] = "P";
		_l["add_b"] = "B";
		_l["add_img"] = "Add Img";
		_l["add_link"] = "link";
		_l["add_pre"] = "Pre";
		_l["add_ul"] = "Ul";
		_l["format"] = "Format";
		_l["draft"] = "Draft";
		_l["restore"] = "Restore";

		this.arr["en"] = _l;
	}

	init_fa(){
		const _l = [];
		_l["change_dir"] = "Dir";
		_l["add_br"] = "Br";
		_l["add_h"] = "H";
		_l["add_h1"] = "H1";
		_l["add_h2"] = "H2";
		_l["add_h3"] = "H3";
		_l["add_h4"] = "H4";
		_l["add_p"] = "P";
		_l["add_b"] = "B";
		_l["add_img"] = "Add Img";
		_l["add_link"] = "link";
		_l["add_pre"] = "Pre";
		_l["add_ul"] = "Ul";
		_l["format"] = "Format";
		_l["draft"] = "Draft";
		_l["restore"] = "Restore";

		this.arr["fa"] = _l;
	}
}

class LiveEditorValidator{
	constructor(){
		this.error = '';
	}

	validate(content){
		if(content.trim() == '' || !this.isHtml(content.trim())){
			this.error = '';
			return true;
		}

		let _validator = this.validHTML(content);

		if(_validator){
			let existEmptyTag = this.findEmptyTags(content);
			//console.log("existEmptyTag: " + existEmptyTag);
			_validator = !(existEmptyTag);
		}

		if(_validator) this.error = '';
		return _validator;
	}

	isHtml(input) {
		return /<[a-z]+\d?(\s+[\w-]+=("[^"]*"|'[^']*'))*\s*\/?>|&#?\w+;/i.test(input);
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
				//console.log(groupIndex + " " + match);
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