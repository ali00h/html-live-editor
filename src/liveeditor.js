$.fn.LiveEditor = function(config){
    this.each(function(index){
		let newLiveEditor = new LiveEditorClass($(this),index,config);
    });    
};

class LiveEditorClass{
	constructor(_obj,_index,_config){
		this.obj = _obj
		this.wrap_obj_name = 'lv' + _index + '-' + Math.floor(Math.random() * 10000);

		this.initConfig(_config);
		this.init();
	}

	initConfig(_config){
		const configDefault = {
			preview_head_additional_code: '',
			height:'300'
		};
		this.config = { ...configDefault, ..._config }
		//console.log(this.config);
	}
	
	init(){
		this.old = '';

		this.addCSS();
		this.obj.addClass("liveeditor");
		this.obj.wrap('<div class="liveeditor-wrap ' + this.wrap_obj_name + '"></div>');
		this.obj.parent().append("<iframe class='liveeditor-preview' id='p" + this.wrap_obj_name + "'></iframe>");	

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
		
		setTimeout(() => {this.update();}, 5000);
	}
	
	addCSS(){
		if($("style[data-n-head=25626548]")[0]) return;
		let cssCode = '';
		cssCode += '<style data-n-head="25626548">';
		cssCode += '.liveeditor-wrap{display: flex;width:100%;}';
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
	
}