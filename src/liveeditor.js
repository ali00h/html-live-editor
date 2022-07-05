$.fn.LiveEditor = function(){
    this.each(function(){
		let newLiveEditor = new LiveEditorClass($(this));
		//https://htmledit.squarefree.com/

    });    
};

class LiveEditorClass{
	constructor(_obj){
		this.obj = _obj
		this.wrap_obj_name = 'lv' + (new Date()).getTime().toString() + Math.floor(Math.random() * 1000);
		this.init();
	}
	
	init(){
		this.addCSS();
		this.obj.addClass("liveeditor");
		this.obj.wrap('<div class="liveeditor-wrap ' + this.wrap_obj_name + '"></div>');
		this.obj.parent().append("<iframe class='liveeditor-preview' id='p" + this.wrap_obj_name + "'></iframe>");	

		this.old = '';
		this.update();
	}
	
	update(){
		
		
		if (this.old != this.obj.val()) {
			this.old = this.obj.val();
			//this.preview_obj.contents().append(this.old);
			var $iframe = $('#p' + this.wrap_obj_name);
			var $oldVar = this.old;
			$iframe.ready(function() {
				console.log($iframe);
				console.log($oldVar);
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
		cssCode += '.liveeditor{width:50%;height:500px}';
		cssCode += '.liveeditor-preview{width:50%;border:1px solid;}';
		cssCode += '</style>';
		document.head.innerHTML += cssCode;
	}
	
}