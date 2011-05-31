/**
 * @file cart.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */

Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info', 'App.views.Checkout');

/**
 * Main cart view
 *
 * Contains all necessary cart components
 *
 * @access public
 * @class
 * @extends Ext.Panel
 */
App.views.Cart.index = Ext.extend(Ext.Panel,
/** @lends App.views.Cart.index# */
{
	id: 'cart',
	title: '{s name="MobileCartTitle"}Warenkorb{/s}',
	iconCls: 'cart',
	layout: 'card',
	autoHeight: true,
	scroll: false,
	listeners: {
		scope: this,
		
		activate: function() {
			var amountEl = Ext.get('amount-display');
			if(amountEl) {
				amountEl.setHTML(App.Helpers.number_format((Math.round(App.stores.Cart.amount*100) / 100), 2, ',', '.') + '&nbsp;&euro;*');
			}
		},

		deactivate: function(me) {
			var active = me.getActiveItem(), view;

			if(active && active.id == 'orderConfirmation') {

				if(me.toolbar) {
					me.toolbar.setTitle(me.title);
					me.toolbar.show();
				}

				if(active) {
					active.destroy();
				}
				me.doComponentLayout();
				me.pnl.show();
				//view.show();
			}
		}
	},
	
	initComponent: function() {

		this.checkoutBtn = new Ext.Button({
			id: 'checkoutBtn',
			ui: 'forward action',
			text: '{s name="MobileCartCheckoutButton"}Zur Kasse{/s}',
			scope: this,
			handler: this.onCheckoutBtn
		});

		this.toolbar = new Ext.Toolbar({
			dock: 'top',
			title: this.title,
			items: [{ xtype: 'spacer' }, this.checkoutBtn]
		});

		this.pnl = new Ext.Panel({
			scroll: 'vertical',
			height: '100%',
			items: [new App.views.Cart.list]
		});

		Ext.apply(this, {
			dockedItems: [this.toolbar],
			items: [this.pnl]
		});
		App.views.Cart.index.superclass.initComponent.call(this);

		if(App.stores.Cart.articleCount < 1) {
			this.checkoutBtn.hide();
		}
	},
    
    /**
     * Will be called when the checkout btn is tapped
     */
	onCheckoutBtn: function() {
		var view = this;

		Ext.dispatch({
			controller: 'checkout',
			action: 'show',
			parentView: view
		});
	}
});

/**
 * Cart list
 *
 * Displays the cart content
 *
 * @access public
 * @class
 * @extends Ext.Panel
 */
App.views.Cart.list = Ext.extend(Ext.Panel,
/** @lends App.views.Cart.list# */
{
	cls: 'cartlist',
	layout: 'fit',
	flex: 1,
	tpl: App.views.Cart.indexTpl,
	data: App.stores.Cart,
	store: App.stores.Cart,
	autoHeight: true,
	scroll: false,
	listeners: {
		scope: this,
		deactivate: function(me) {
			alert('cartlist deactivate');
		}
	},
	initComponent: function() {
		this.store.on({
			datachanged: this.onDataChanged,
			scope: this
		});
		App.views.Cart.list.superclass.initComponent.call(this);

		Ext.apply(this, {
			listeners: {
				el: {
					tap: this.onDeleteBtn,
					delegate: '.deleteBtn',
					scope: this
				},
				scope: this
			}
		})
	},

    /**
     * Calls when the store is changed
     *
     * @param store
     */
	onDataChanged: function(store) {
		this.update(this.store);
	},

    /**
     * Calls when the store is updated
     * @param store
     */
	update: function (store) {
		if (store.items.length) {
			this.tpl = App.views.Cart.indexTpl;

			if(this.ownerCt && this.ownerCt.ownerCt && this.ownerCt.ownerCt.checkoutBtn) {
				this.ownerCt.ownerCt.checkoutBtn.show();
			}

			this.hideCheckoutBtn(false);
		} else {
			this.tpl = App.views.Cart.emptyTpl;
			
			if(this.ownerCt && this.ownerCt.ownerCt && this.ownerCt.ownerCt.checkoutBtn) {
				this.ownerCt.ownerCt.checkoutBtn.hide();
			}
			this.hideCheckoutBtn(true);
		}
		App.views.Cart.list.superclass.update.apply(this, arguments);
	},

    /**
     * Calls when the delete button is tapped
     *
     * @param event
     * @param el
     */
	onDeleteBtn: function(event, el) {
		var el = Ext.get(el), val;
		val = el.dom.attributes[1].nodeValue;
		App.stores.Cart.remove(val);
		return false;
	},

    /**
     * Hides the checkout btn
     *
     * @param state
     */
	hideCheckoutBtn: function(state) {
		var btn = Ext.getCmp('checkoutBtn');
		if (state === true) { btn.hide(); } else { btn.show(); }
	}
});