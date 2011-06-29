<script type="text/javascript">
/**
 * @file checkout_controller.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */
Ext.regController('checkout', {

	show: function(options) {
		var view;

		/* Checkout needs parent view */
		if(!Ext.isDefined(options.parentView)) {
			throw Error('Checkout Controller needs parentView to add checkout view');
		}

		/* Check if the user is logged in */
		if(!~~isUserLoggedIn) {
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
		}
	}
});
</script>