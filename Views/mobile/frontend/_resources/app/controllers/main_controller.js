Ext.regController('main', {
	show: function(options) {

		Ext.getCmp('shop').setActiveItem('home', {
			type:  (Ext.isDefined(options.type)) ? options.type : 'slide',
			direction: (Ext.isDefined(options.direction)) ? options.direction : 'left'
		})
	}
})