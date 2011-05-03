{block name="frontend_index_header_javascript_jquery" append}
<script type="text/javascript">
var request    = {$shopwareMobile.active},
    useSubShop = {$shopwareMobile.useSubShop}
    subShopID  = {$shopwareMobile.subShopId};
if(navigator.userAgent.match(/{$shopwareMobile.userAgents}/i) && !request) {
    var text = unescape("M%F6chten Sie die f%FCr mobile Endger%E4te optimierte Version dieser Seite aufrufen%3F");
    var quest = confirm(text);

    if(quest == true && useSubShop == 0) {
		window.location.href = '/mobile';
        return;
	}

    if(quest == true && useSubShop == 1) {
        $.post('/', { 'sLanguage': subShopID }, function(data) {
            window.location.href = '/mobile';
        });
    }
}
</script>
{/block}