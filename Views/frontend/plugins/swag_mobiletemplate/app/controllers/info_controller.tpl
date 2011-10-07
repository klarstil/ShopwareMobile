<script type="text/javascript">
{literal}
Ext.regController('info', {

	/**
	 * Event listener method which renders the
	 * detail view
	 *
	 * @param options
	 * @return bool
	 */
	detail: function(options) {
		var item = App.stores.Info.getAt(options.index), view = Ext.getCmp('infoDetail');

		if(!view) {
			view = new App.views.Info.Detail(item);
			Ext.getCmp('info').add(view);
		}

		Ext.getCmp('info').getToolbar().setTitle(App.Helpers.truncate(item.data.name, 12, '...'));
		Ext.getCmp('info').setActiveItem(view, { type: 'slide' });

		return true;
	}
});
{/literal}
</script>