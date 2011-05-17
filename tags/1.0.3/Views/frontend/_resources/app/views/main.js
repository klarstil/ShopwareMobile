/**
 * @file main.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info', 'App.views.Checkout');

/**
 * Main Viewport

 * @access public
 * @class
 * @extends Ext.TabPanel
 */
App.views.Viewport = Ext.extend(Ext.TabPanel,
/** @lends App.views.Viewport# */
{
	fullscreen: true,
	id: 'viewport',
	cls: 'viewport',
	ui: 'dark',
	layout: 'card',
	cardSwitchAnimation: {
		type: 'slide',
		direction: 'left'
	},

	tabBar: {
		id: 'tabbar',
		dock: 'bottom',
		layout: {
			pack: 'center'
		}
	},

	initComponent: function () {
		Ext.apply(App.views, {
			shop:    new App.views.Shop.index,
			search:  new App.views.Search.index,
			cart:    new App.views.Cart.index,
			account: new App.views.Account.index,
			info:    new App.views.Info.index
		});

		Ext.apply(this, {
			items: [
				App.views.shop,
				App.views.search,
				App.views.cart,
				App.views.account,
				App.views.info
			]
		});
		this.constructor.superclass.initComponent.call(this);
	},

	/**
	 * Returns the cart button
	 */
	getCartButton: function () {
		return this.tabBar.items.getAt(2)
	}
});