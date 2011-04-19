{block name="frontend_index_header_javascript_jquery" append}
<script type="text/javascript">
var request = {$shopwareMobile.active};
{literal}
if(navigator.userAgent.match(/(Android|BlackBerry|iPhone|iPod)/i) && request) {
    var text = unescape("M%F6chten Sie die f%FCr mobile Endger%E4te optimierte Version dieser Seite aufrufen%3F");
    var quest = confirm(text);

    if(quest == true) {
		window.location.href = '/mobile';
	}
}
{/literal}
</script>
{/block}