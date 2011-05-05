/**
 * ----------------------------------------------------------------------
 * checkout_controller.js
 *
 * Steuert den kompletten Checkout-Bereich
 * ----------------------------------------------------------------------
 */
Ext.regController('checkout', {
	
	show: function(options) {
		var view;

		if(!Ext.isDefined(options.parentView)) {
			throw Error('Checkout Controller needs parentView to add checkout view');
		}

		if(Ext.isEmpty(isUserLoggedIn)) {
			view = new App.views.Account.index;
			view.toolbar.setTitle('Checkout');

			options.parentView.add(view);
			options.parentView.toolbar.hide();
			options.parentView.doComponentLayout();

			view.backBtn.setHandler(function() {
				options.parentView.setActiveItem(0, {
					type: 'slide',
					reverse: true,
					scope: this
				});

				options.parentView.toolbar.show();
				options.parentView.doComponentLayout();
				//view.destroy();
			});
			view.backBtn.setText('Warenkorb');
			view.backBtn.show();

			options.parentView.setActiveItem(view, 'slide');
		} else {
			view = new App.views.Checkout.index;

			options.parentView.add(view);
			options.parentView.toolbar.hide();
			options.parentView.doComponentLayout();

			options.parentView.setActiveItem(view, 'slide');
			//alert('User is logged in, show order confirmation view ...but wait you need to create one yourself ;)');
		}
	}
});