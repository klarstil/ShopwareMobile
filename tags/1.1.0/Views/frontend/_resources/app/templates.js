/**
 * @file templates.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */

Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info', 'App.views.Checkout');

App.views.Shop.detailTpl = new Ext.XTemplate(
	'<tpl for=".">',
		'<tpl if="mode == 1"><div class="blog_article"></tpl>',

		// Image
		'<tpl if="image_url">',
			'<div class="image" style="background-image: url({image_url})">&nbsp;</div>',
		'</tpl>',
		
		// Article Informations
		'<tpl if="Ext.isEmpty(liveshoppingData)">',
		'<div class="info">',
			'<input type="hidden" name="priceNumeric" value="{priceNumeric}" id="priceNumericDetail" />',
			'<strong class="name">{articleName}</strong>',
			'<span class="supplier">von {supplierName}</span>',
			'<span class="ordernumber">Bestell-Nr.: <span id="ordernumberDetail">{ordernumber}</span></span>',
			'<strong class="priceCon">',
				'<tpl if="this.isPseudoprice(pseudoprice)"><span class="pseudoprice">Statt: {pseudoprice} &euro;*</span>',
				'<span class="pricePercent">({pseudopricePercent.float} % gespart)</span></tpl>',
				'<span class="price"><span id="priceDetail">{price}</span> &euro;*</span>',
			'</strong>',
			// Base price
			'<tpl if="!Ext.isEmpty(purchaseunit)">',
				'<span class="tax">Inhalt: {purchaseunit} {sUnit.description}</span>',
				'<tpl if="purchaseunit != referenceunit">',
					'<span class="tax">Grundpreis:<br/> {referenceunit} {sUnit.description} = {referenceprice} &euro;*</span><br />',
				'</tpl>',
			'</tpl>',
			'<span class="tax">Preise inkl. gesetzlicher MwSt. zzgl. Versandkosten</span>',
		'</div>',
		'<div class="clear clearfloat">&nbsp;</div>',
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
		'<tpl if="mode == 1"></div></tpl>',
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

App.views.Shop.blogTpl = new Ext.XTemplate(
	'<tpl for=".">',
		'<div class="blog_article_details">',
			'<tpl if="image_url">',
				'<div class="image" style="background-image: url({image_url})">&nbsp;</div>',
			'</tpl>',
			'<div class="info">',
				'<strong class="name">{articleName}</strong>',
				'<span class="supplier"><strong>Autor:</strong> {supplierName}</span>',
			'</div>',
		'</div>',
	'</tpl>', { compiled: true }
);