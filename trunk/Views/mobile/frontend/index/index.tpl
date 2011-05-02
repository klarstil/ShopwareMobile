<!DOCTYPE html>
<html mainfest="{link file='frontend/_resources/cache.manifest'}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">	
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
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" />
    
    <link rel="stylesheet" href="{link file='frontend/_resources/styles/blackberry.css'}" type="text/css">
    <link rel="stylesheet" href="{link file='frontend/_resources/styles/app.css'}" type="text/css">

    <script type="text/javascript">
    //<![CDATA[
        var timeNow = {time() nocache};
    //]]>
    </script>
</head>
<body>
    <script type="text/javascript" src="{link file='frontend/_resources/app/_sencha/sencha-touch-debug.js'}"></script>
    <script type="text/javascript" src="{link file='frontend/_resources/app/_sencha/Ext.ux.touch.PagingToolbar.js'}"></script>
    
    <div id="sencha-app">
    
		<!-- Initialize Application -->
        <script type="text/javascript" src="{link file='frontend/_resources/app/app.js'}"></script>
        
        <!-- Application Helpers -->
        <script type="text/javascript" src="{link file='frontend/_resources/app/helpers.js'}"></script>
        
        <!-- Models -->
        <script type="text/javascript" src="{link file='frontend/_resources/app/models.js'}"></script>
        
        <!-- Stores -->
        <script type="text/javascript" src="{link file='frontend/_resources/app/stores.js'}"></script>
        
        <!-- Templates -->
        <script type="text/javascript" src="{link file='frontend/_resources/app/templates.js'}"></script>
        
        <!-- Controllers -->
        <script type="text/javascript" src="{link file='frontend/_resources/app/controllers/main_controller.js'}"></script>
        <script type="text/javascript" src="{link file='frontend/_resources/app/controllers/category_controller.js'}"></script>
        <script type="text/javascript" src="{link file='frontend/_resources/app/controllers/detail_controller.js'}"></script>
        
        <!-- Views -->
        <script type="text/javascript" src="{link file='frontend/_resources/app/views/main.js'}"></script>
        <script type="text/javascript" src="{link file='frontend/_resources/app/views/shop.js'}"></script>
        <script type="text/javascript" src="{link file='frontend/_resources/app/views/detail.js'}"></script>
        <script type="text/javascript" src="{link file='frontend/_resources/app/views/search.js'}"></script>
        <script type="text/javascript" src="{link file='frontend/_resources/app/views/cart.js'}"></script>
        <script type="text/javascript" src="{link file='frontend/_resources/app/views/account.js'}"></script>
        <script type="text/javascript" src="{link file='frontend/_resources/app/views/info.js'}"></script>
    </div>
</body>
</html>