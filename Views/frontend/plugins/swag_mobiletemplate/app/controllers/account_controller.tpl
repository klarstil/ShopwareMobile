<script type="text/javascript">
{literal}
/**
 * @file account_controller.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */
Ext.regController('account', {

	accountView: Ext.getCmp('account'),

	/* Checks if the user is logged in and redirects the user */
	show: function() {

	},

	/**
	 * Process the whole login process and redirects
	 * the user after a successful user to either
	 * the basket view or the account center view.
	 *
	 * @return bool
	 */
	login: function() {
		var active = Ext.getCmp('viewport').getActiveItem(),
			view = 0;

		if(active.id == 'cart') {
			App.stores.UserData.load({
				scope: this,
				callback: function(){

					/* Set user is logged in */
					isUserLoggedIn = 1;

					view = new App.views.Checkout.index;
					view.update('');
					active.setActiveItem(view, {
						type: 'slide',
						reverse: true,
						scope: this
					});
				}
			});
		} else {
			/* Toolbar set up */
			active.backBtn.hide();
			active.logoutBtn.show();
			active.toolbar.setTitle(active.backBtn.text);
			active.toolbar.doLayout();

			/* Change active view */
			active.newPnl.hide();
			active.existingPnl.hide();

			App.stores.UserData.load({
				scope: this,
				callback: function() {
					active.createCustomerCenter(active.mainPnl);
					active.mainPnl.doComponentLayout();
					active.mainPnl.doLayout();

					/* Set user is logged in */
					isUserLoggedIn = 1;

					active.setActiveItem(view, {
						type: 'slide',
						reverse: true,
						scope: this
					});
				}
			})
		}
		return true;
	},

	/**
	 * Handles the complete logout process if the
	 * user wants to.
	 *
	 * @param options
	 * @return bool
	 */
	logout: function(options) {

		/* Checkout needs parent view */
		if(!Ext.isDefined(options.view)) {
			throw Error('Account controller needs view to process the logout successfully');
		}

		var view = options.view;
		App.Helpers.getRequest(App.RequestURL.logout, '', function(response) {
			if(response.success && response.msg) {
				Ext.Msg.alert('{/literal}{s name="MobileAccountLogoutSuccess"}Logout erfolgreich{/s}{literal}', response.msg);
			}
			isUserLoggedIn = 0;

			/* Change view. TODO - Fix the destroyed display if the user logs out */
			view.logoutBtn.hide();
			view.centerPnl.hide();
			view.existingPnl.show();
			view.newPnl.show();
			view.doComponentLayout();
		});

		return true;
	},

	/**
	 * Handles the whole register process
	 * 
	 * @return bool
	 */
	register: function() {
		var active = Ext.getCmp('viewport').getActiveItem(),
			view = 0;

		if(active.id == 'cart') {
			App.stores.UserData.load({
				scope: this,
				callback: function(){

					/* Set user is logged in */
					isUserLoggedIn = 1;

					view = new App.views.Checkout.index;
					view.update('');
					active.setActiveItem(view, {
						type: 'slide',
						reverse: true,
						scope: this
					});
				}
			});
		} else {

			/* Toolbar set up */
			active.backBtn.hide();
			active.logoutBtn.show();
			active.toolbar.setTitle(active.backBtn.text);
			active.toolbar.doLayout();

			/* Change active view */
			active.newPnl.hide();
			active.existingPnl.hide();

			App.stores.UserData.load({
				scope: this,
				callback: function() {
					active.createCustomerCenter(active.mainPnl);
					active.mainPnl.doComponentLayout();
					active.mainPnl.doLayout();

					/* Set user is logged in */
					isUserLoggedIn = 1;

					active.setActiveItem(view, {
						type: 'slide',
						reverse: true,
						scope: this
					});
				}
			})
		}

		return true;
	},

	/* Shows the registration */
	showRegister: function(options) {
		var view = Ext.getCmp('register'),
			accountView = Ext.getCmp('account');

		this.accountView = options.parentView;

		view = new App.views.Account.register;
		this.accountView.add(view);

		this.setToolbarTitle(view.title);
		this.accountView.backBtn.show();

		this.accountView.setActiveItem(view, 'slide');
	},

	/* Shows the login panel */
	showLogin: function(options) {
		var view = Ext.getCmp('login'),
			accountView = Ext.getCmp('account');

		this.accountView = options.parentView;

		view = new App.views.Account.login;
		this.accountView.add(view);

		this.setToolbarTitle(view.title);
		this.accountView.backBtn.show();

		this.accountView.setActiveItem(view, 'slide');

	},

	/**
	 * Sets a new toolbar title and shorten it if
	 * it's larger than 7 characters
	 *
	 * @param str
	 */
	setToolbarTitle: function(str) {
		this.accountView.toolbar.setTitle(App.Helpers.truncate(str, 7));
		return true;
	}
});
{/literal}
</script>