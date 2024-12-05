sap.ui.define([
    "sap/m/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Item",
    "sap/ui/model/json/JSONModel",
    "sap/m/upload/Uploader",
    "sap/ui/core/Element",
    "sap/ui/model/odata/type/DateTimeWithTimezone"
],
    function (MobileLibrary, Controller, Item, JSONModel, Uploader, Element) {
        "use strict";

        var prefixId;
		var oScanResultText;


        return Controller.extend("pmnotificationapp.controller.Main", {
            onInit: function () {

                // Routing
                this.oOwnerComponent = this.getOwnerComponent();
                this.oRouter = this.oOwnerComponent.getRouter();
                this.oRouter.getRoute("RouteMain").attachPatternMatched(this.onRouteMatched, this);


                // //Init Uploader
                var oUploadSet = this.byId("UploadSet")

                // Modify "add file" button
                oUploadSet.getDefaultFileUploader().setButtonOnly(false)
                oUploadSet.getDefaultFileUploader().setTooltip("")
                oUploadSet.getDefaultFileUploader().setIconOnly(true)
                oUploadSet.getDefaultFileUploader().setIcon("sap-icon://attachment")
                
                //Init Barcode Scanner
                prefixId = this.createId();
				if (prefixId){
					prefixId = prefixId.split("--")[0] + "--";
				} else {
					prefixId = "";
				}

				oScanResultText = Element.getElementById(prefixId + '_IDTechOb');
            },



            onRouteMatched: function (oEvent) {
                var oModel = this.getView().getModel()
                var that = this

                // Create current date object
                const now = new Date();
                // Get current UTC time in milliseconds
                const utcMs = Date.UTC(
                    now.getUTCFullYear(),
                    now.getUTCMonth(),
                    now.getUTCDate(),
                    now.getUTCHours(),
                    now.getUTCMinutes(),
                    now.getUTCSeconds(),
                    now.getUTCMilliseconds()
                );
                // Calculate timezone offset for Germany (Winter = UTC+1, Summer = UTC+2)
                const tzOffsetMs = now.getTimezoneOffset() * 60 * 1000;
                const deMs = utcMs - tzOffsetMs;

                var todaydate = new Date().toISOString().substring(0, 10)
                var todayms = new Date(todaydate).getTime()
                var today = deMs - todayms

                //wait for metadata
                oModel.metadataLoaded(true).then(
                    function () {
                        var oContext = oModel.createEntry("/ZD4P_C_PM_NOTIF", {
                            properties: { DeclarationDate: new Date(), DeclarationTime: { "ms": today, "__edmType": "Edm.Time" }, Declarant: sap.ushell.Container.getService("UserInfo").getId() }
                        });

                        that.getView().setBindingContext(oContext);
                    })
            },

            // onScanSuccess: function(oEvent) {
			// 	if (oEvent.getParameter("cancelled")) {
			// 		MessageToast.show("Scan cancelled", { duration:1000 });
			// 	} else {
			// 		if (oEvent.getParameter("value")) {
			// 			oScanResultText.setText(oEvent.getParameter("text"));
			// 		} else {
			// 			oScanResultText.setText('');
			// 		}
			// 	}
			// },

			// onScanError: function(oEvent) {
			// 	MessageToast.show("Scan failed: " + oEvent, { duration:1000 });
			// },

			// onScanLiveupdate: function(oEvent) {
			// 	// User can implement the validation about inputting value
			// },

			// onAfterRendering: function() {
			// 	// Reset the scan result
			// 	var oScanButton = Element.getElementById(prefixId + '_IDEqui');
			// 	if (oScanButton) {
			// 		$(oScanButton.getDomRef()).on("click", function(){
			// 			oScanResultText.setText('');
			// 		});
			// 	}
			// }
            // // onUploadSelectedButton: function () {
            //     var oUploadSet = this.byId("UploadSet");

            //     oUploadSet.getItems().forEach(function (oItem) {
            //         if (oItem.getListItem().getSelected()) {
            //             oUploadSet.uploadItem(oItem);
            //         }
            //     });
            // },
            // onDownloadSelectedButton: function () {
            //     var oUploadSet = this.byId("UploadSet");

            //     oUploadSet.getItems().forEach(function (oItem) {
            //         if (oItem.getListItem().getSelected()) {
            //             oItem.download(true);
            //         }
            //     });
            // },
            // onUploadCompleted: function(oEvent) {
            //     this.oItemToUpdate = null;
            // }
        });
    });
