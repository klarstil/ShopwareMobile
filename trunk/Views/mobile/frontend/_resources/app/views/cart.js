/*
 * ----------------------------------------------------------------------
 * cart.js
 *
 * Views fuer den Warenkorb
 * ----------------------------------------------------------------------
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info', 'App.views.Checkout');

App.views.Cart.index = Ext.extend(Ext.Panel, {
	id: 'cart',
	title: 'Warenkorb',
	iconCls: 'cart',
	layout: 'card',
	autoHeight: true,
	scroll: false,
	initComponent: function() {

		this.checkoutBtn = new Ext.Button({
			id: 'checkoutBtn',
			ui: 'forward action',
			text: 'Checkout',
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

	onCheckoutBtn: function() {
		var view = this;

		Ext.dispatch({
			controller: 'checkout',
			action: 'show',
			parentView: view
		});
	}
});

App.views.Cart.list = Ext.extend(Ext.Panel, {
	id: 'cartlist',
	scroll: 'vertical',
	layout: 'fit',
	autoHeight: true,
	flex: 1,
	initComponent: function() {

		Ext.apply(this, {
			tpl: App.views.Cart.indexTpl,
			data: App.stores.Cart,
			store: App.stores.Cart,
			autoHeight: true,
			scroll: false,
			listeners: {
				el: {
					tap: this.onDeleteBtn,
					delegate: '.deleteBtn',
					scope: this
				},
				scope: this
			}
		});

		this.store.on({
			datachanged: this.onDataChanged,
			scope: this
		});

		App.views.Cart.list.superclass.initComponent.call(this);
	},

	onDataChanged: function(store) {
		this.update(this.store);
	},

	update: function (store) {
		if (store.items.length) {
			this.tpl = App.views.Cart.indexTpl;
			this.ownerCt.ownerCt.checkoutBtn.show();
			this.hideCheckoutBtn(false);
		} else {
			this.tpl = App.views.Cart.emptyTpl;
			this.ownerCt.ownerCt.checkoutBtn.hide();
			this.hideCheckoutBtn(true);
		}
		App.views.Cart.list.superclass.update.apply(this, arguments);
	},

	onDeleteBtn: function(event, el) {
		var el = Ext.get(el), val;
		val = el.dom.attributes[1].nodeValue;
		App.stores.Cart.remove(val);
		return false;
	},

	hideCheckoutBtn: function(state) {
		var btn = Ext.getCmp('checkoutBtn');
		if (state === true) { btn.hide(); } else { btn.show(); }
	}
});