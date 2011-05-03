/**
 * ----------------------------------------------------------------------
 * checkout.js
 *
 * Views fuer die Checkoutseiten
 *
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * ----------------------------------------------------------------------
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info', 'App.views.Checkout');

App.views.Checkout.index = Ext.extend(Ext.Panel, {
	id: 'orderConfirmation',
	title: 'Bestellbest&auml;tigung',
	html: 'Ich bin die Bestellbest&auml;tigungsseite',
	initComponent: function() {
		App.views.Checkout.index.superclass.initComponent.call(this);
	}
});