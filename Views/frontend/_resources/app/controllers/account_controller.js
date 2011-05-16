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

	/* Shows the startup page, if the user isn't logged in */
	showStartup: function() {

	},

	/* Shows the registration */
	showRegister: function() {
		var view = Ext.getCmp('register'),
			accountView = Ext.getCmp('account');

		this.accountView = accountView;

		view = new App.views.Account.register;
		this.accountView.add(view);

		this.setToolbarTitle(view.title);
		this.accountView.backBtn.show();

		this.accountView.setActiveItem(view, 'slide');
	},

	/* Shows the login panel */
	showLogin: function() {
		var view = Ext.getCmp('login'),
			accountView = Ext.getCmp('account');

		this.accountView = accountView;

		view = new App.views.Account.login;
		this.accountView.add(view);

		this.setToolbarTitle(view.title);
		this.accountView.backBtn.show();

		this.accountView.setActiveItem(view, 'slide');

	},

	/* Shows the account informations */
	showAccountInfo: function() {
		
	},

	/* Sends the registration to the server */
	processRegister: function() {

	},

	/* Sends the login to the server */
	processLogin: function() {
		
	},

	setToolbarTitle: function(str) {
		this.accountView.toolbar.setTitle(App.Helpers.truncate(str, 7));
		return true;
	}

	
})