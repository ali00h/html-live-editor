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
3-Add a textarea in your body
```bash
<textarea class="myeditor"></textarea>
```
4-Mention your textarea to use LiveEditor
```bash
<script>
$('.myeditor').LiveEditor(); 
</script>
```

# Advance Usage
thies configs are available:
```bash
<script>
$('.myeditor').LiveEditor({
			preview_head_additional_code: '',
			height:'300',
			preview_refresh_rate:5000,
			language:'en'
		}); 
</script>
```