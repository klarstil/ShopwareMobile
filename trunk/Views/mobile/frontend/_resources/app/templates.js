Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info', 'App.views.Checkout');

App.views.Shop.detailTpl = new Ext.XTemplate(
	'<tpl for=".">',
	
		// Image
		'<tpl if="image_url">',
			'<div class="image" style="background-image: url({image_url})">&nbsp;</div>',
		'</tpl>',
		
		// Article Informations
		'<tpl if="Ext.isEmpty(liveshoppingData)">',
		'<div class="info">',
			'<strong class="name">{articleName}</strong>',
			'<span class="supplier">von {supplierName}</span>',
			'<span class="ordernumber">Bestell-Nr.: {ordernumber}</span>',
			'<strong class="priceCon">',
				'<tpl if="this.isPseudoprice(pseudoprice)"><span class="pseudoprice">Statt: {pseudoprice} &euro;</span>',
				'<span class="pricePercent">({pseudopricePercent.float} % gespart)</span></tpl>',
				'<span class="price">{price} &euro;*</span>',
			'</strong>',
			'<span class="tax">Preise inkl. gesetzlicher MwSt. zzgl. Versandkosten</span>',
		'</div>',
		'<div class="clear">&nbsp;</div>',
		'</tpl>',

		// Liveshopping
		'<tpl if="!Ext.isEmpty(liveshoppingData)">',
			'<input type="hidden" id="priceHidden" value="{priceNumeric}" />',
			'<div class="info">',
			'<strong class="name">{articleName}</strong>',
			'<span class="supplier">von {supplierName}</span>',
			'<tpl for="liveshoppingData">',
			'<div class="liveshopping">',

				'<tpl if="typeID == 1">',
					'<span class="pastprice">Urspr&uuml;ngl. Preis: <strong>{parent.pseudoprice} &euro;*</strong></span>',
					'<span class="rabatt">Sie sparen: {[this.getPercent(parent.priceNumeric, parent.pseudoPriceNumeric)]} %</span>',
				'</tpl>',

				'<div class="top">',
					'<span class="endsin">Angebot endet in:</span>',
					'<div class="times">',
						'<span id="days_time">00</span>:',
						'<span id="hours_time">00</span>:',
						'<span id="minutes_time">00</span>:',
						'<span id="seconds_time">00</span>',
					'</div>',
				'</div>',

				'<tpl if="typeID == 2"><div class="decreaseIcn"></div></tpl>',
				'<tpl if="typeID == 3"><div class="increaseIcn"></div></tpl>',
		
				'<div class="display">',
					'<span class="actual_price">Aktueller Preis:</span>',
					'<strong id="price">{parent.price} &euro;*</strong>',
				'</div>',

				'<tpl if="typeID != 1">',
					'<div class="bottom">',

					'<span class="perminute">',
						'<tpl if="typeID == 2">Preis f&auml;llt um {minPrice} &euro;* pro Minute</tpl>',
						'<tpl if="typeID == 3">Preis steigt um {minPrice} &euro;* pro Minute</tpl>',
					'</span>',

					'<span class="startprice">Startpreis: {startprice} &euro;*</span>',
				'</tpl>',
			'</div>',
			'</tpl>',
			'</div>',
		'</tpl>',
	'</tpl>', {
	compiled: true,

	// Memberfunctions
	isPseudoprice: function(price) {
		var price = parseFloat(price);
		if(price > 0) { return true; } else { return false; }
	},
	
	getPercent: function(newPrice, oldPrice) {
		var percent = Math.round((100 - (newPrice * 100 / oldPrice)) * 100) / 100;
		return percent;
	},
	
	formatNumber: function(number) {
		return App.Helpers.number_format(number, 2, ',', ',', '.');
	}
});

App.views.Shop.bundleTpl = new Ext.XTemplate(
	// Bundles
	'<div class="bundleContainer">',
	'<h3>Sparen Sie jetzt mit unseren Bundle-Angeboten:</h3>',
	'<tpl for=".">',
	'<tpl for="sBundles">',
		'<div class="innerBundle">',
		'<div class="img main_article" style="background-image: url({parent.small_image})"></div>',
		'<tpl for="sBundleArticles">',
			'<span class="plus">+</span>',
			'<div class="img" style="background-image:url({sDetails.image_url})"></div>',
		'</tpl>', // !sBundleArticles
		'<div class="clear"></div>',
		'<div class="infoBundle">',
			'<ul>',
				'<li>{parent.articleName}</li>',
				'<tpl for="sBundleArticles">',
				'<li>{sDetails.articleName}</li>',
				'</tpl>',
			'</ul>',
		'</div>',
		'<div class="buyBundle">',
			'Preis f&uuml;r alle: <strong>{sBundlePrices.display} &euro;</strong>',
			'<div id="bundleBtn" class="x-button x-button-normal-small round">',
				'<span class="x-button-label">In den Warenkorb</span>',
			'</div>',
		'</div>',
		'</div>', // !innerBundle
	'</tpl>', // !sBundles
	'</tpl>',
	'</div>', // !bundleContainer
	{
		compiled: true
	}
);

App.views.Shop.descTpl = new Ext.XTemplate(
	'<tpl for=".">',
		'<div class="clear">&nbsp;</div>',
		// Description
		'<div class="desc">',
			'<h2>Artikelbeschreibung:</h2>',
			'<p>{description_long}</p>',
		'</div>',
	'</tpl>', {
		compiled: true
	}
);

App.views.Shop.emptyTpl = new Ext.XTemplate(
	'<div class="emptyComments">',
		'<p>',
			'Es liegen zur Zeit <strong>keine</strong> Kommentare f&uuml;r diesen Artikel vor. Geben Sie <strong>jetzt</strong> das erste Kommentar ab.',
		'</p>',
	'</div>', {
		compiled: true
	}
);

App.views.Shop.commentsTpl = new Ext.XTemplate(
	'<tpl for=".">',
		'<tpl for="sVoteComments">',
			'<div class="comment">',
				'<div class="stars star{points}"></div>',
				'<h2 class="headline"><strong>{headline}</strong></h2>',
				'<span class="name">von {name}</span>',
				'<div class="desc top"><div class="inner">{comment}</div>',
			'</div>',
		'</tpl>',
	'</tpl>', { compiled: true }
);

App.views.Shop.picturesTpl = new Ext.XTemplate(
	'<div class="tapImage">',
			'<img src="{data.big_picture}" width="75%" />',
	'</div>',
	'<tpl if="!Ext.isEmpty(data.desc)"><div class="description">{data.desc}</div></tpl>',
	{
		compiled: true
	}
);

App.views.Cart.indexTpl = new Ext.XTemplate(
	'<tpl for="items.items">',
		'<div class="item" rel="{ordernumber}">',
			'<div class="image" style="background-image: url({image_url})"></div>',
			'<div class="info">',
				'<span class="supplier">{supplierName}</span>',
				'<strong class="name">{articlename}</strong>',
				'<span class="ordernumber"><strong>Bestell-Nr.:</strong> {ordernumber}</span>',
				'<span class="quantity"><strong>Anzahl:</strong> {quantity}x {price} &euro;</span>',
				'<strong class="price">{amount} &euro;</strong>',
			'</div>',
			'<div class="clear">&nbsp;</div>',
			'<div class="action">',
				'<div class="x-button x-button-decline round x-iconalign-left deleteBtn" rel="{id}">',
					'<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAC8ElEQVR42u3aT0iTYRzA8XcztTaMdhihpYJYztRmhw4RHSU6FPbHg1JdKm9F4Emiuphk0CW6CF3aSuwf/REDMeiSRFCEIf7JbBc1kkZqkebm1vewwXh43mS97/a+i+cHn9vDeL97X/c++L5aPB43kxMlaMQRA46iHi5oZjLzwwpwGiHEYHRWcAvFdgx24izmYeZEcB9ldgouSMQuIhMTxQuzos2IbUMYmZwIHqHM6uDGNc7sD8ynKfqX6H54rQp24IHOAa5iAGdwDE1rYh2acRUzkM0vNFkV7MQIxFnCdXgMfO4ejOv8ct+Ew6rgYckt6KMJt5J8tGJRclnftVvwMxM2DA6UY1oSHLAoGPLgh4aDgSKEJMG3M/03nIdyVMGHqhRjEGcQflQZtEtyhqN4KllbCY8ZwSXoxghC+Cz4DXF+JtcaFEJEdquTrJ3ES5w0EuxGJxaRC7OKUfj/NbgBX5FLs4QeeNMNLkUfosi1mccpONIJbkcYuTrvUZ1O8D6cQxvOI4AFiPMdPQhmQQCPsQxxFtCHAIK4jNJ0gh0pNDRL9rcxXMImuLPABS96Jccxid1wwY3C9C5pkX7wcayDliWF6JIcxwRqxfWZCD4hBG/GNmyHR+dbLoYPlXDrXF1b4EMF8oXgazrBddkOrsNzfMIUelEsRO/A65TNQrfwheVhL4YTa8bQZdfgQ5hDcqZQIwQfEPbeH1AELWEDLgqbiTd2DT6ImZSgcUnwfuFX9i02Qktw4YoQ/Op/D+5QwSpYBatgFayCVbAKVsEqWAWrYBWsglWwClbBKlgFq2AVrILVP+LlwbNIzoRO8AqS804IXo8LQvCQXYNrMIRvCKNf8kaeH6MIJ9bdgVN4mNaAWYTxBTfsGQx4UIs6eHUel5ajHj7k67zhVwE/qqHZKbjFggfinZYEJ6YdBVkMdmPAyuA5PEEAwSwYxLIFwdaOCs5AcEsOBO80M/gwphGz8UulW80M9uAelmx4dufQASe0tfwBaKrLkw66AkcAAAAASUVORK5CYII=" />',
				'</div>',
			'</div>',
		'</div>',
	'</tpl>'
);

App.views.Cart.emptyTpl = new Ext.XTemplate(
	'<div class="emptyCart">',
		'<p>',
			'In Ihren Warenkorb befinden sich zur Zeit noch keine Artikel.',
		'</p>',
		'<p>',
			'Entdecken Sie Ihr Wunschprodukt im <strong>Shop</strong> oder finden Sie ein spezielles Produkt &uuml;ber die integrierte <strong>Suche</strong>.',
		'</p>',
	'</div>',
	{
		compiled: true
	}
);

App.views.Search.itemTpl = new Ext.XTemplate(
	'<div class="image" style="background-image:url({img})"></div>',
	'<div class="info">',
		'<strong class="name">{articleName}</strong><span class="price">{price} &euro;</span>',
		'<div class="desc">{description}</div>',
	'</div>'
);

App.views.Checkout.cartTpl = new Ext.XTemplate(
	'<tpl for="items.items">',
		'<div class="item" rel="{ordernumber}">',
			'<div class="image" style="background-image: url({image_url})"></div>',
			'<div class="info">',
				'<span class="supplier">{supplierName}</span>',
				'<strong class="name">{articlename}</strong>',
				'<span class="ordernumber"><strong>Bestell-Nr.:</strong> {ordernumber}</span>',
				'<span class="quantity"><strong>Anzahl:</strong> {quantity}x {price} &euro;</span>',
				'<strong class="price">{amount} &euro;</strong>',
			'</div>',
			'<div class="clear">&nbsp;</div>',
		'</div>',
	'</tpl>'
);