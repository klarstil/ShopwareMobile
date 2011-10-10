<!DOCTYPE html>
<html lang="de" class="no-js">
<head>
    <meta charset="utf-8" />
    <title>{$sShopname}</title>
    
    {block name='frontend_index_header_meta_tags'}
	<meta name="author" content="{s name='IndexMetaAuthor'}{/s}" />
	<meta name="copyright" content="{s name='IndexMetaCopyright'}{/s}" />
	<meta name="robots" content="{block name='frontend_index_header_meta_robots'}{s name='IndexMetaRobots'}{/s}{/block}" />
	<meta name="revisit-after" content="{s name='IndexMetaRevisit'}{/s}" />
	<meta name="keywords" content="{block name='frontend_index_header_meta_keywords'}{s name='IndexMetaKeywordsStandard'}{/s}{/block}" />
	<meta name="description" content="{block name='frontend_index_header_meta_description'}{s name='IndexMetaDescriptionStandard'}{/s}{/block}" />
	<link rel="shortcut icon" href="{s name='IndexMetaShortcutIcon'}{link file='frontend/_resources/favicon.ico'}{/s}" type="image/x-icon" />{* Favicon *}
	{/block}
    
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0; maximum-scale=1.0; user-scalable=0;" />
    
    <link rel="stylesheet" href="{link file={$shopwareMobile.template} fullPath}" type="text/css">
    <link rel="stylesheet" href="{link file='frontend/_resources/styles/_app.css' fullPath}" type="text/css">

    {if $shopwareMobile.additionalCSS|| $shopwareMobile.logoPath}
        <style type="text/css">

            {* Add additional css properties *}
            {$shopwareMobile.additionalCSS}

            {* Custom logo *}
            {if $shopwareMobile.logoPath}
                #logo, #logo div { background: url({$shopwareMobile.logoPath}) no-repeat center center }
                #logo { height: {$shopwareMobile.logoHeight}px !important }
            {/if}
			{if $shopwareMobile.checkboxGreen}
				#orderPnl .x-field .x-input-radio:checked::after, #orderPnl .x-field .x-input-checkbox:checked::after {
					border-color: #456E00;
				}
			{/if}
        </style>
    {/if}

    <script type="text/javascript">
    //<![CDATA[
        var timeNow = {time() nocache};
        var shopName = '{$sShopname}';
    
        {* Loop through the available configuration options *}
        {foreach $shopwareMobile as $key => $value}
        var {$key} = '{$value}';
        {/foreach}
    //]]>
    </script>
</head>
<body>

    <script type="text/javascript" src="{link file='frontend/_resources/app/_sencha/sencha-touch.js' fullPath}"></script>
    <script type="text/javascript" src="{link file='frontend/_resources/app/_sencha/Ext.ux.touch.PagingToolbar.js' fullPath}"></script>

	<div id="templates">
		{* Main categories list item template *}
		{block name="frontend_mobile_template_main_categories"}{literal}
		<textarea id="MainCategorylistTpl" class="hidden">
			<strong>{name}</strong>
		</textarea>
		{/literal}{/block}

		{* Categories list item template *}
		{block name="frontend_mobile_template_categories"}{literal}
		<textarea id="CategorieslistTpl" class="hidden">
			<div class="image"<tpl if="image_url"> style="background-image:url({image_url})"</tpl>></div><strong>{articleName}</strong><tpl if="!Ext.isEmpty(priceNumeric) && priceNumeric != 0"><span class="price"><tpl if="!Ext.isEmpty(priceStartingFrom)">ab </tpl>{price} &euro;*</span></tpl><div class="desc">{description_long}</div>
		</textarea>
		{/literal}{/block}

		{* Subcategories list item template *}
		{block name="frontend_mobile_template_subcategories"}{literal}
		<textarea id="SubCategorieslistTpl" class="hidden">
			<div class="info"><span class="title">{text}</span></div><tpl if="desc"><p class="desc">{desc}</p></tpl>
		</textarea>
		{/literal}{/block}

		{* Info list item template *}
		{block name="frontend_mobile_template_infolist"}{literal}
		<textarea id="InfolistTpl" class="hidden">
			<strong>{name}</strong>
		</textarea>
		{/literal}{/block}

		{block name="frontend_mobile_template_checkoutcarttpl"}{literal}
		<textarea id="CheckoutcartTpl" class="hidden">
			<tpl for="items.items">
				<div class="item" rel="{ordernumber}">
					<tpl if="!Ext.isEmpty(image_url)"><div class="image" style="background-image: url({image_url})"></div></tpl>
					<div class="info">
						<span class="supplier">{supplierName}</span>
						<strong class="name">{articlename}</strong>
						<span class="ordernumber"><strong>Bestell-Nr.:</strong> {ordernumber}</span>
						<span class="quantity"><strong>Anzahl:</strong> {quantity}x {price} &euro;*</span>
						<strong class="price">{amount} &euro;*</strong>
					</div>
					<div class="clear">&nbsp;</div>
				</div>
			</tpl>
		</textarea>
		{/literal}{/block}

		{block name="frontend_mobile_template_searchitemtpl"}{literal}
		<textarea id="Searchitemtpl" class="hidden">
			<div class="image" style="background-image:url({img})"></div>
			<div class="info">
				<strong class="name">{articleName}</strong>
				<span class="price"><tpl if="!Ext.isEmpty(priceStartingFrom)">ab </tpl>{price} &euro;*</span>
				<div class="desc">{description}</div>
			</div>
		</textarea>
		{/literal}{/block}

		{block name="frontend_mobile_template_cartemptytpl"}{literal}
		<textarea id="CartemptyTpl" class="hidden">
			<div class="emptyCart">
				<p>
					In Ihrem Warenkorb befinden sich zur Zeit noch keine Artikel.
				</p>
				<p>
					Entdecken Sie Ihr Wunschprodukt im <strong>Shop</strong> oder finden Sie ein spezielles Produkt &uuml;ber die integrierte <strong>Suche</strong>.
				</p>
			</div>
		</textarea>
		{/literal}{/block}

		{block name="frontend_mobile_template_cartitemtpl"}{literal}
		<textarea id="CartitemTpl" class="hidden">
			<tpl for="items.items">
				<div class="item" rel="{ordernumber}">
					<tpl if="!Ext.isEmpty(image_url)"><div class="image" style="background-image: url({image_url})"></div></tpl>
					<div class="info">
					<span class="supplier">{supplierName}</span>
						<strong class="name">{articlename}</strong>
						<span class="ordernumber"><strong>Bestell-Nr.:</strong> {ordernumber}</span>
						<span class="quantity"><strong>Anzahl:</strong> {quantity}x {price} &euro;*</span>
						<strong class="price">{amount} &euro;*</strong>
					</div>
					<div class="clear">&nbsp;</div>
					<tpl if="modus == 0"><div class="action">
						<div class="x-button x-button-decline round x-iconalign-left deleteBtn" rel="{id}">
							<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAC8ElEQVR42u3aT0iTYRzA8XcztTaMdhihpYJYztRmhw4RHSU6FPbHg1JdKm9F4Emiuphk0CW6CF3aSuwf/REDMeiSRFCEIf7JbBc1kkZqkebm1vewwXh43mS97/a+i+cHn9vDeL97X/c++L5aPB43kxMlaMQRA46iHi5oZjLzwwpwGiHEYHRWcAvFdgx24izmYeZEcB9ldgouSMQuIhMTxQuzos2IbUMYmZwIHqHM6uDGNc7sD8ynKfqX6H54rQp24IHOAa5iAGdwDE1rYh2acRUzkM0vNFkV7MQIxFnCdXgMfO4ejOv8ct+Ew6rgYckt6KMJt5J8tGJRclnftVvwMxM2DA6UY1oSHLAoGPLgh4aDgSKEJMG3M/03nIdyVMGHqhRjEGcQflQZtEtyhqN4KllbCY8ZwSXoxghC+Cz4DXF+JtcaFEJEdquTrJ3ES5w0EuxGJxaRC7OKUfj/NbgBX5FLs4QeeNMNLkUfosi1mccpONIJbkcYuTrvUZ1O8D6cQxvOI4AFiPMdPQhmQQCPsQxxFtCHAIK4jNJ0gh0pNDRL9rcxXMImuLPABS96Jccxid1wwY3C9C5pkX7wcayDliWF6JIcxwRqxfWZCD4hBG/GNmyHR+dbLoYPlXDrXF1b4EMF8oXgazrBddkOrsNzfMIUelEsRO/A65TNQrfwheVhL4YTa8bQZdfgQ5hDcqZQIwQfEPbeH1AELWEDLgqbiTd2DT6ImZSgcUnwfuFX9i02Qktw4YoQ/Op/D+5QwSpYBatgFayCVbAKVsEqWAWrYBWsglWwClbBKlgFq2AVrILVP+LlwbNIzoRO8AqS804IXo8LQvCQXYNrMIRvCKNf8kaeH6MIJ9bdgVN4mNaAWYTxBTfsGQx4UIs6eHUel5ajHj7k67zhVwE/qqHZKbjFggfinZYEJ6YdBVkMdmPAyuA5PEEAwSwYxLIFwdaOCs5AcEsOBO80M/gwphGz8UulW80M9uAelmx4dufQASe0tfwBaKrLkw66AkcAAAAASUVORK5CYII=" />
						</div>
					</div></tpl>
				</div>
			</tpl>
			<div class="amount">
				<strong>Gesamt:</strong>
				<span id="amount-display"></span>
			</div>
			<div class="price-notice x-form-fieldset-instructions">
				* Alle Preise inkl. gesetzl. Mehrwertsteuer zzgl. Versandkosten und ggf. Nachnahmegebühren wenn nicht anders beschrieben
			</div>
		</textarea>
		{/literal}{/block}

		{block name="frontend_mobile_template_shopcommenttpl"}{literal}
		<textarea id="Shopcommenttpl" class="hidden">
			<tpl for=".">
				<tpl for="sVoteComments">
					<div class="comment">
						<div class="stars star{points}"></div>
						<h2 class="headline"><strong>{headline}</strong></h2>
						<span class="name">von {name}</span>
						<div class="desc top"><div class="inner">{comment}</div>
					</div>
				</tpl>
			</tpl>
		</textarea>
		{/literal}{/block}

		{block name="frontend_mobile_template_shopemptycommenttpl"}{literal}
		<textarea id="Shopemptycommenttpl" class="hidden">
			<div class="emptyComments">
				<p>
					Es liegen zur Zeit <strong>keine</strong> Kommentare f&uuml;r diesen Artikel vor. Geben Sie <strong>jetzt</strong> das erste Kommentar ab.
				</p>
			</div>
		</textarea>
		{/literal}{/block}

		{block name="frontend_mobile_template_shopdesctpl"}{literal}
		<textarea id="Shopdesctpl" class="hidden">
			<tpl for=".">
				<div class="clear">&nbsp;</div>
				<div class="desc">
					<h2>Artikelbeschreibung:</h2>
					<p>{description_long}</p>
				</div>
			</tpl>
		</textarea>
		{/literal}{/block}

		{block name="frontend_mobile_template_shopbundleTpl"}{literal}
		<textarea id="ShopbundleTpl" class="hidden">
			<div class="bundleContainer">
			<h3>Sparen Sie jetzt mit unseren Bundle-Angeboten:</h3>
			<tpl for=".">
			<tpl for="sBundles">
				<div class="innerBundle">
				<div class="img main_article" style="background-image: url({parent.small_image})"></div>
				<tpl for="sBundleArticles">
					<span class="plus">+</span>
					<div class="img" style="background-image:url({sDetails.image_url})"></div>
				</tpl>
				<div class="clear"></div>
				<div class="infoBundle">
					<ul>
						<li>{parent.articleName}</li>
						<tpl for="sBundleArticles">
						<li>{sDetails.articleName}</li>
						</tpl>
					</ul>
				</div>
				<div class="buyBundle">
					Preis f&uuml;r alle: <strong>{sBundlePrices.display} &euro;*</strong>
					<div id="bundleBtn" class="x-button x-button-normal-small round">
						<span class="x-button-label">In den Warenkorb</span>
					</div>
				</div>
				</div>
			</tpl>
			</tpl>
			</div>
		</textarea>
		{/literal}{/block}
	</div>

    <div id="sencha-app">

		{* Initialize Application *}
		{include file="frontend/plugins/swag_mobiletemplate/app/app.tpl"}

		{* Locale *}
		{include file="frontend/plugins/swag_mobiletemplate/app/locale.tpl"}

		{* Application Helpers *}
        {include file="frontend/plugins/swag_mobiletemplate/app/helpers.tpl"}

        {* Models *}
        {include file="frontend/plugins/swag_mobiletemplate/app/models.tpl"}

        {* Stores *}
        {include file="frontend/plugins/swag_mobiletemplate/app/stores.tpl"}

        {* Templates *}
        {include file="frontend/plugins/swag_mobiletemplate/app/templates.tpl"}

        {* Controllers *}
        {include file="frontend/plugins/swag_mobiletemplate/app/controllers/main_controller.tpl"}
        {include file="frontend/plugins/swag_mobiletemplate/app/controllers/category_controller.tpl"}
        {include file="frontend/plugins/swag_mobiletemplate/app/controllers/detail_controller.tpl"}
        {include file="frontend/plugins/swag_mobiletemplate/app/controllers/account_controller.tpl"}
        {include file="frontend/plugins/swag_mobiletemplate/app/controllers/checkout_controller.tpl"}
        {include file="frontend/plugins/swag_mobiletemplate/app/controllers/info_controller.tpl"}

        {* Views *}
        {include file="frontend/plugins/swag_mobiletemplate/app/views/main_view.tpl"}
        {include file="frontend/plugins/swag_mobiletemplate/app/views/shop_view.tpl"}
        {include file="frontend/plugins/swag_mobiletemplate/app/views/detail_view.tpl"}
        {include file="frontend/plugins/swag_mobiletemplate/app/views/search_view.tpl"}
        {include file="frontend/plugins/swag_mobiletemplate/app/views/cart_view.tpl"}
        {include file="frontend/plugins/swag_mobiletemplate/app/views/account_view.tpl"}
        {include file="frontend/plugins/swag_mobiletemplate/app/views/info_view.tpl"}
        {include file="frontend/plugins/swag_mobiletemplate/app/views/checkout_view.tpl"}
    </div>
</body>
</html>