/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"pm_notification_app/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
