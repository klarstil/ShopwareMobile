<script type="text/javascript">
{literal}
/**
 * @file checkout_controller.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */
Ext.regController('checkout', {

	/**
	 * Checks if the necessary parameter are passed and creates the
	 * view.
	 *
	 * This method represents the constructor of the controller
	 *
	 * @param {obj} options - Option object from the Ext.dispatch()
	 * @return void
	 */
	show: function(options) {

		/* Checkout needs parent view */
		if(!Ext.isDefined(options.parentView)) {
			throw Error('Checkout Controller needs parentView to add checkout view');
		}

		/** Create the needed view and show it */
		this.initView(options.parentView);

	},

	/**
	 * Creates the needed view for the checkout section.
	 * If the user isn't logged in the user will be
	 * redirected to a login / register page to login
	 * in the section
	 *
	 * @param {obj} parentView
	 * @return {obj} view - the active view
	 */
	initView: function(parentView) {

		var view;
		isUserLoggedIn = ~~isUserLoggedIn;

		if(!isUserLoggedIn) {

			view = this.openAccountView(parentView);
		} else {

			view = this.openCheckoutView(parentView);
		}

		/** Set view as the active item */
		parentView.setActiveItem(view, 'slide');

		return view;
	},

	/**
	 * Creates the account view and modifies
	 * the parent view
	 *
	 * @param parentView
	 * @return view
	 */
	openAccountView: function(parentView) {
		/** Create login form - TODO: Transform to smarty snippet */
		var view = new App.views.Account.index;
		view.toolbar.setTitle('Checkout');

		/** Update the parent view */
		parentView.add(view);
		parentView.toolbar.hide();
		parentView.doComponentLayout();

		/** Update the back button handler */
		view.backBtn.setHandler(function() {
			parentView.setActiveItem(0, {
				type: 'slide',
				reverse: true,
				scope: this
			});
		});
		/** Modify the back button and show it. TODO: Transform to a smarty snippet */
		view.backBtn.setText('Warenkorb');
		view.backBtn.show();

		return view;
	},

	/**
	 * Creates the checkout view and modifies the
	 * parent view
	 *
	 * @param parentView
	 * @return view
	 */
	openCheckoutView: function(parentView) {
		/** Create the first checkout view */
		var view = new App.views.Checkout.index;

		/** Update the parent view */
		parentView.add(view);
		parentView.toolbar.hide();
		parentView.doComponentLayout();

		return view;
	},

	/**
	 * Deletes an articles from the basket and from
	 * the client side basket store
	 *
	 * @param options
	 * @return bool
	 */
	deleteItem: function(options) {
		var element = options.element, val;

		if(!Ext.isDefined(options.element)) {
			throw Error('Delete Item needs a element');
		}

		element = Ext.get(element);
		val = element.dom.attributes[1].nodeValue;
		App.stores.Cart.remove(val);

		return true;
	},

	/**
	 * Updates the summary display field
	 * in the cart list
	 *
	 * @param options
	 * @return bool
	 */
	updateSumDisplay: function(options) {
		var element, price;

		if(!Ext.isDefined(options.element)) {
			throw Error('UpdateSumDisplay needs the display element');
		}

		element = options.element;

		/** TODO: Use smarty snippet for the currency symbol */
		if(App.stores.Cart.amount && element) {
			price = App.Helpers.number_format((Math.round(App.stores.Cart.amount*100) / 100), 2, ',', '.') + '&nbsp;&euro;*';
			element.setHTML(price);
		}

		return true;
	}
});
{/literal}
</script>