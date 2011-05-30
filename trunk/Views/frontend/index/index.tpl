<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
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
    
    <link rel="stylesheet" href="{link file={$shopwareMobile.template}}" type="text/css">
    <link rel="stylesheet" href="{link file='frontend/_resources/styles/_app.css'}" type="text/css">

    {if $shopwareMobile.additionalCSS|| $shopwareMobile.logoPath}
        <style type="text/css">

            {* Add additional css properties *}
            {$shopwareMobile.additionalCSS}

            {* Custom logo *}
            {if $shopwareMobile.logoPath}
                #logo, #logo div { background: url({$shopwareMobile.logoPath}) no-repeat center center }
                #logo { height: {$shopwareMobile.logoHeight}px !important }
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
    <script type="text/javascript" src="{link file='frontend/_resources/app/_sencha/sencha-touch-debug.js'}"></script>
    <script type="text/javascript" src="{link file='frontend/_resources/app/_sencha/Ext.ux.touch.PagingToolbar.js'}"></script>

    <div id="sencha-app">

		<!-- Initialize Application -->
        <script type="text/javascript" src="{link file='frontend/_resources/app/app.js'}"></script>

		<!-- Locale -->
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='locale'}"></script>
        
        <!-- Application Helpers -->
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='helpers'}"></script>

        
        <!-- Models -->
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='models'}"></script>
        
        <!-- Stores -->
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='stores'}"></script>
        
        <!-- Templates -->
        <script type="text/javascript" src="{link file='frontend/_resources/app/templates.js'}"></script>
        
        <!-- Controllers -->
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='main_controller' type='con'}"></script>
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='category_controller' type='con'}"></script>
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='detail_controller' type='con'}"></script>
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='account_controller' type='con'}"></script>
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='checkout_controller' type='con'}"></script>
        
        <!-- Views -->
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='main' type='view'}"></script>
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='shop' type='view'}"></script>
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='detail' type='view'}"></script>
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='search' type='view'}"></script>
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='cart' type='view'}"></script>
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='account' type='view'}"></script>
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='info' type='view'}"></script>
        <script type="text/javascript" src="{url controller='MobileTemplate' action="loadFile" file='checkout' type='view'}"></script>
    </div>
</body>
</html>