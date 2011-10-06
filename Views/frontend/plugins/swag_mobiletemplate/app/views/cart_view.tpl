<script type="text/javascript">

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
			Ext.dispatch({
				controller: 'checkout',
				action: 'updateSumDisplay',
				element: Ext.get('amount-display')
			});
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
			}
		}
	},

	initComponent: function() {
		var $me = this;

		this.checkoutBtn = new Ext.Button({
			id: 'checkoutBtn',
			ui: 'forward action',
			text: '{s name="MobileCartCheckoutButton"}Zur Kasse{/s}',
			scope: this,
			handler: function() {

				Ext.dispatch({
					controller: 'checkout',
					action: 'show',
					parentView: $me
				});
			}
		});

		this.checkoutBtn2 = new Ext.Button({
			id: 'checkoutBtn2',
			ui: 'confirm',
			text: '{s name="MobileCartCheckoutButton"}Zur Kasse{/s}',
			style: 'margin: 1em',
			scope: this,
			handler: function() {
				Ext.dispatch({
					controller: 'checkout',
					action: 'show',
					parentView: $me
				});
			}
		})

		this.toolbar = new Ext.Toolbar({
			dock: 'top',
			title: this.title,
			items: [{ xtype: 'spacer' }, this.checkoutBtn]
		});

		this.pnl = new Ext.Panel({
			scroll: 'vertical',
			height: '100%',
			items: [new App.views.Cart.list, this.checkoutBtn2]
		});

		Ext.apply(this, {
			dockedItems: [this.toolbar],
			items: [this.pnl]
		});
		App.views.Cart.index.superclass.initComponent.call(this);

		if(App.stores.Cart.articleCount < 1) {
			this.checkoutBtn.hide();
		}
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
	tpl: Ext.XTemplate.from('CartitemTpl'),
	data: App.stores.Cart,
	store: App.stores.Cart,
	autoHeight: true,
	scroll: false,
	initComponent: function() {
		this.store.on({
			datachanged: this.onDataChanged,
			scope: this
		});
		App.views.Cart.list.superclass.initComponent.call(this);

		Ext.apply(this, {
			listeners: {
				el: {
					tap: this.onTap,
					delegate: '.x-button',
					scope: this
				},
				scope: this
			}
		});
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
			this.tpl = Ext.XTemplate.from('CartitemTpl');

			if(this.ownerCt && this.ownerCt.ownerCt && this.ownerCt.ownerCt.checkoutBtn) {
				this.ownerCt.ownerCt.checkoutBtn.show();
				this.ownerCt.ownerCt.checkoutBtn2.show();
			}

			this.hideCheckoutBtn(false);
		} else {
			this.tpl = Ext.XTemplate.from('CartemptyTpl');

			if(this.ownerCt && this.ownerCt.ownerCt && this.ownerCt.ownerCt.checkoutBtn) {
				this.ownerCt.ownerCt.checkoutBtn.hide();
				this.ownerCt.ownerCt.checkoutBtn2.hide();
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
	onTap: function(event, el) {

		Ext.dispatch({
			controller: 'checkout',
			action: 'deleteItem',
			element: el,
		});
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
</script>