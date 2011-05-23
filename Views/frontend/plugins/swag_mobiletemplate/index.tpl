{block name="frontend_index_no_script_message" prepend}
<script type="text/javascript">
var request    = {$shopwareMobile.active},
    useSubShop = {$shopwareMobile.useSubShop}
    subShopID  = {$shopwareMobile.subShopId};
if(navigator.userAgent.match(/{$shopwareMobile.userAgents}/i) && !request) {
    var text = unescape("M%F6chten Sie die f%FCr mobile Endger%E4te optimierte Version dieser Seite aufrufen%3F");
    var quest = confirm(text);

    if(quest == true && useSubShop == 0) {
		 document.body.innerHTML += '<form id="dynForm" action="" method="post"><input type="hidden" name="sMobile" value="1"></form>';
        document.getElementById("dynForm").submit();
	}

    if(quest == true && useSubShop == 1) {
        document.body.innerHTML += '<form id="dynForm" action="" method="post"><input type="hidden" name="sLanguage" value="'+ subShopID +'"></form>';
        document.getElementById("dynForm").submit();
    }
}
</script>
{/block}