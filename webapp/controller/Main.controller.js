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
        var oDocuments


        return Controller.extend("pmnotificationapp.controller.Main", {
            onInit: function () {

                var that = this;

                // Routing
                this.oOwnerComponent = this.getOwnerComponent();
                this.oRouter = this.oOwnerComponent.getRouter();
                this.oRouter.getRoute("RouteMain").attachPatternMatched(this.onRouteMatched, this);

                // //Init Uploader
                var oUploadSet = that.byId("UploadSet")
                oDocuments = [];

                // Modify "add file" button
                oUploadSet.getDefaultFileUploader().setButtonOnly(false)
                oUploadSet.getDefaultFileUploader().setTooltip("")
                oUploadSet.getDefaultFileUploader().setIconOnly(true)
                oUploadSet.getDefaultFileUploader().setIcon("sap-icon://attachment")

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

                // Send OData-Request to CREATE-Entity
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


            onUploadFileChange: function (oEvent) {
                //get file component
                this.oFileUploadComponent = oEvent.getParameters("items").item.getFileObject();
                if (this.oFileUploadComponent) {

                    //call function to build buffer
                    this._handleRawFile(this.oFileUploadComponent, this);
                }

                //get buffer
                this.uploadFileRaw; // this is raw file then you can do what ever you want

                var oDoc = this.uploadFileRaw
                var base64String = this._arrayBufferToBase64(oDoc)
                var DocName = this.uploadFileRaw.name
                var DocType = this.uploadFileRaw.mimetype
            },

            
            _handleRawFile: function (oFile, oController) {
                //handle file data
                var oFileRaw = {
                    name: oFile.name,
                    mimetype: oFile.type,
                    size: oFile.size,
                    data: []
                };
                //reader
                var reader = new FileReader();
                reader.onload = function (e) {
                    oFileRaw.data = e.target.result; //set buffer data
                    oController.uploadFileRaw = oFileRaw;
                }.bind(oController);
                reader.readAsArrayBuffer(oFile);
            },
            _arrayBufferToBase64: function (buffer) {
                var binary = '';
                var bytes = new Uint8Array(buffer);
                var len = bytes.byteLength;
                for (var i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return window.btoa(binary);
            }
        });
    });
