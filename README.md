# html-live-editor
A lite HTML editor with live preview, with custom css and js code for preview and support rtl languages!

# Usage

1-Add jquery in your page
```bash
<script src="http://code.jquery.com/jquery-latest.min.js"></script>
```
2-Add HtmlLiveEditor js file
```bash
<script src="../src/liveeditor.js"></script>
```
Or CDN:
```bash
<script src="https://cdn.jsdelivr.net/gh/ali00h/html-live-editor/src/liveeditor.js"></script>
```

3-Add a textarea in your body
```bash
<textarea class="myeditor"></textarea>
```
4-Mention your textarea to use LiveEditor
```bash
<script>
$( document ).ready(function() {	
	$('.myeditor').LiveEditor(); 
});
</script>
```

# Advance Usage
## Config
These configs are available:
```bash
<script>
$( document ).ready(function() {	
	$('.myeditor').LiveEditor({
			preview_head_additional_code: '',
			height:'300',
			preview_refresh_rate:5000,
			language:'en',
			additional_tools: [{index:8,obj: '<button type="button" class="bt tools-insert-code" data-append-data="\n<ul><li>\nyour_text\n</li></ul>\n">UL</button>'}],
			keyword_separator:','
	}); 
});		
</script>
```
## Keyword Counter
```bash
<textarea class="myeditor" keyword-input=".mykeyword"></textarea>
<input type="text" class="mykeyword" value="hi,test,about">
```
