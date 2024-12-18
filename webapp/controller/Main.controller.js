sap.ui.define([
    "sap/m/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Item",
    "sap/ui/model/json/JSONModel",
    "sap/m/upload/Uploader",
    "sap/ui/core/Element",
    "sap/ui/model/odata/type/DateTimeWithTimezone",
    "sap/m/MessageToast"
],
    function (MobileLibrary, Controller, Item, JSONModel, Uploader, Element, MessageToast) {
        "use strict";

        var prefixId;
        var oScanResultText;


        return Controller.extend("pmnotificationapp.controller.Main", {
            onInit: function () {

                var that = this;

                // Routing
                this.oOwnerComponent = this.getOwnerComponent();
                this.oRouter = this.oOwnerComponent.getRouter();
                this.oRouter.getRoute("RouteMain").attachPatternMatched(this.onRouteMatched, this);

                // //Init Uploader
                var oUploadSet = that.byId("UploadSet")

                // Modify "add file" button
                oUploadSet.getDefaultFileUploader().setButtonOnly(false)
                oUploadSet.getDefaultFileUploader().setTooltip("")
                oUploadSet.getDefaultFileUploader().setIconOnly(true)
                oUploadSet.getDefaultFileUploader().setIcon("sap-icon://attachment")
                oUploadSet.attachUploadCompleted(that.onUploadCompleted.bind(that));

                //Init Barcode Scanner
                prefixId = that.createId();
                if (prefixId) {
                    prefixId = prefixId.split("--")[0] + "--";
                } else {
                    prefixId = "";
                }
                oScanResultText = Element.getElementById(prefixId + '-Main--_IDTechOb');
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
                            properties: {
                                DeclarationDate: new Date(),
                                DeclarationTime: { "ms": today, "__edmType": "Edm.Time" },
                                Declarant: sap.ushell.Container.getService("UserInfo").getId()
                            }
                        });

                        that.byId("smartForm").setBindingContext(oContext)
                    })
            },

            onSave: function (oEvent) {
                /*create operation*/
                var oSmartForm = this.byId("smartForm");
                var oModel = this.getView().getModel();
                var oDataRes = oSmartForm.getBindingContext().getObject();

                // Messages
                var ssuccess = this.getView().getModel("i18n").getResourceBundle().getText("msgboxsuccess");
                var sfailure = this.getView().getModel("i18n").getResourceBundle().getText("msgboxfailure");

                // OData-Request an den CREATE-Entity senden
                oModel.create("/ZD4P_C_PM_NOTIF", oDataRes, {
                    success: function () {
                        sap.m.MessageBox.success(ssuccess);
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error(sfailure);
                    }
                });

            },
            onScanSuccess: function (oEvent) {
                if (oEvent.getParameter("cancelled")) {
                    MessageToast.show("Scan cancelled", { duration: 1000 });
                } else {
                    if (oEvent.getParameter("text")) {
                        // oScanResultText.setText(oEvent.getParameter("text"));
                        oScanResultText.setValue(oEvent.getParameter("text"));
                    } else {
                        // oScanResultText.setText('');
                        oScanResultText.setValue('');
                    }
                }
            },

            onScanError: function (oEvent) {
                MessageToast.show("Scan failed: " + oEvent, { duration: 1000 });
            },

            onScanLiveupdate: function (oEvent) {
                // User can implement the validation about inputing value
            },

            onAfterRendering: function () {
                // Reset the scan result
                var oScanButton = Element.getElementById(prefixId + 'BarcodeScannerButton');
                if (oScanButton) {
                    $(oScanButton.getDomRef()).on("click", function () {
                        // oScanResultText.setText('');
                        oScanResultText.setValue('');
                    });
                }
            },


            onUploadSelectedButton: function () {
                var oUploadSet = this.byId("UploadSet");
                oUploadSet.getItems().forEach(function (oItem) {
                    if (oItem.getListItem().getSelected()) {
                        oUploadSet.uploadItem(oItem);
                    }
                });
            },
            onUploadCompleted: function (oEvent) {
                this.oItemToUpdate = null;
                debugger
                var oUploadSet = this.byId("UploadSet");
                var oItem = oUploadSet.getItems();
                
                // this.byId("versionButton").setEnabled(false);
            }
        });
    });
