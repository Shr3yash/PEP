define(["ojs/ojhtmlutils", "ojL10n!../js/resources/nls/lang", "text!../js/config.json"], function (HtmlUtils, LangBundle, paramBundle) {
    var topics = {};
    this.createDom = (key) => {
        let nodes = HtmlUtils.stringToNodeArray(`<oj-bind-text value=\"[[message]]\"></oj-bind-text>`);

        let data = { message: LangBundle[key] ? LangBundle[key] : key };

        return { view: nodes, data: data };
    };

    this.getTxnLabel = (key) => {
        return LangBundle[key] ? LangBundle[key] : key;
    };

    this.getConfigInfo = (key) => {
        let configData = JSON.parse(paramBundle);
        if (Array.isArray(configData[key])) {
            configData[key].forEach((entry) => {
                if (entry.hasOwnProperty("label")) {
                    entry.label = this.getTxnLabel(entry.label);
                }
            });
        }
        return configData[key] ? configData[key] : key;
    };
    /*  
      Purpose:  this method: genInputFlist generates the InputOpcode FList XML data per BRM standards for the given array
      
      Input Params:
      $array_data     --> Array of parameters that we need pass for Input Flist
      CamelCaseOpcode --> Simplified BRM opcode Name in CamelCase
      OpcodeName      --> OpcodeName that has been exposed by BRM WSDL to consume
    */
    this.genInputFlist = ($array_data, CamelCaseOpcode, OpcodeName) => {
        var userXML = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bus="http://xmlns.oracle.com/BRM/schemas/BusinessOpcodes/">';
        userXML = userXML + "<soapenv:Header/>";
        userXML = userXML + "<soapenv:Body>";
        userXML = userXML + "<bus:opcode" + CamelCaseOpcode + ">";
        userXML = userXML + "<opcodeName>" + OpcodeName + "</opcodeName>";
        userXML = userXML + "<inputXml>";
        userXML = userXML + "<![CDATA[";
        userXML = userXML + '<?xml version="1.0" encoding="UTF-8"?>';
        userXML = userXML + "<" + OpcodeName + "_inputFlist>";

        $.each($array_data, function (i) {
            if ($.isArray($array_data[i])) {
                // console.log($array_data[i]);
                userXML = userXML + writeArrayElem(userXML, $array_data[i], i);
                // userXML = userXML + '<' + i + '>' + $array_data[i] + '</' + i + '>';
            } else {
                userXML = userXML + "<" + i + ">" + $array_data[i] + "</" + i + ">";
            }
        });

        userXML = userXML + "</" + OpcodeName + "_inputFlist>";
        userXML = userXML + "]]></inputXml></bus:opcode" + CamelCaseOpcode + "></soapenv:Body></soapenv:Envelope>";

        return userXML;
    };

    this.oepIfGenInputFlist = (arrayData, CamelCaseOpcode, OpcodeName) => {
        var userXML = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://xmlns.oracle.com/OEP/IntegrationFramework/APIs/V1" xmlns:bus="http://xmlns.oracle.com/BRM/schemas/BusinessOpcodes" xmlns="http://xmlns.oracle.com/BRM/schemas/BusinessOpcodes">';
        userXML = userXML + "<soapenv:Header/>";
        userXML = userXML + "<soapenv:Body>";
        userXML = userXML + "<v1:IntegrationFrameworkSyncRequest>";
        userXML = userXML + "<v1:channelTrackingID>" + Date.now() + "</v1:channelTrackingID>";
        userXML = userXML + "<" + OpcodeName + "_inputFlist>";

        $.each(arrayData, function (key, val) {
            if ($.isArray(val) || $.isPlainObject(val)) {
                $.each(val, function (key1, val1) {
                    if ($.isArray(val1) || $.isPlainObject(val1)) {
                        userXML = userXML + oepWriteArrayElem(userXML, val1, key1);
                    } else {
                        userXML = userXML + "<" + key1 + ">" + val1 + "</" + key1 + ">";
                    }
                });
                // userXML = userXML + writeArrayElement(userXML, val, key);
            } else {
                userXML = userXML + "<" + key + ">" + val + "</" + key + ">";
            }
        });

        userXML = userXML + "</" + OpcodeName + "_inputFlist></v1:IntegrationFrameworkSyncRequest>";
        userXML = userXML + "</soapenv:Body></soapenv:Envelope>";

        return userXML;
    };

    this.oepWriteArrayElem = ($xml, $data, tagName) => {
        var attr = $data["attr"];
        var children = $data["children"];
        var ResultXML = "";
        var TagXML = "";
        var childXML = "";
        $.each(children, function (i) {
            if (typeof children[i] == "object") {
                childXML = childXML + writeArrayElem(childXML, children[i], i);
            } else childXML = childXML + "<" + i + ">" + children[i] + "</" + i + ">";
        });

        TagXML = TagXML + "<" + tagName;
        $.each(attr, function (i) {
            TagXML = TagXML + " " + i + '="' + attr[i] + '"';
        });
        TagXML = TagXML + ">" + childXML + "</" + tagName + ">";

        return TagXML;
    };

    this.buildXml = (arrayData, tagName) => {
        var xmlString = "<" + tagName + ">";

        $.each(arrayData, function (key, val) {
            if ($.isArray(val) || $.isPlainObject(val)) {
                $.each(val, function (key1, val1) {
                    if ($.isArray(val1) || $.isPlainObject(val1)) {
                        xmlString = xmlString + oepWriteArrayElem(xmlString, val1, key1);
                    } else {
                        xmlString = xmlString + "<" + key1 + ">" + val1 + "</" + key1 + ">";
                    }
                });
                // xmlString = xmlString + writeArrayElement(xmlString, val, key);
            } else {
                xmlString = xmlString + "<" + key + ">" + val + "</" + key + ">";
            }
        });
        xmlString += "</" + tagName + ">";

        return xmlString;
    };

    this.formatXml = (xmlString) => {
        return '<?xml version="1.0" encoding="UTF-8"?>' + xmlString;
    };

    this.formatBrmRequest = (xmlString, opCodeName) => {
        return '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bus="http://xmlns.oracle.com/BRM/schemas/BusinessOpcodes/"><soapenv:Header/><soapenv:Body><bus:opcode><opcodeName>' + opCodeName + "</opcodeName><inputXml><![CDATA[" + xmlString + "]]></inputXml></bus:opcode></soapenv:Body></soapenv:Envelope>";
    };

    this.formatOepRequest = (xmlString) => {
        return '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://xmlns.oracle.com/OEP/OrderManagement/Order/V1"><soapenv:Header/><soapenv:Body><OrderEntryRequest xmlns="http://xmlns.oracle.com/OEP/OrderManagement/Order/V1">' + xmlString + "</OrderEntryRequest></soapenv:Body></soapenv:Envelope>";
    };

    /** Vishal | Start | Created for Advance User Search  */
    this.genSearchInputFlist = (array_data, CamelCaseOpcode, OpcodeName) => {
        let prefix = "dbx:";
        let dbxName = "getDBXInfoRequest";

        let userXML = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:dbx="http://dbx.search.org">';
        userXML += "<soapenv:Header/>";
        userXML += "<soapenv:Body>";
        userXML += "<dbx:" + dbxName + ">";
        userXML += "<" + prefix + "searchID>" + OpcodeName + "</" + prefix + "searchID>";
        userXML += "<" + prefix + "outputType>0</" + prefix + "outputType>";

        $.each(array_data, function (i) {
            userXML = userXML + "<" + i + ">" + array_data[i] + "</" + i + ">";

            userXML +=
                "<" +
                prefix +
                "searchParams>\
                        <" +
                prefix +
                "param>" +
                i +
                "</" +
                prefix +
                "param>\
                        <" +
                prefix +
                "value>" +
                array_data[i] +
                "</" +
                prefix +
                "value>\
                      </" +
                prefix +
                "searchParams>";
        });

        userXML += "</dbx:" + dbxName + "></soapenv:Body></soapenv:Envelope>";

        return userXML;
    };


    this.writeArrayElem = ($xml, $data, tagName) => {
        var attr = $data["attr"];
        var children = $data["children"];
        var ResultXML = "";
        var TagXML = "";
        var childXML = "";
        $.each(children, function (i) {
            childXML = childXML + "<" + i + ">" + children[i] + "</" + i + ">";
        });

        TagXML = TagXML + "<" + tagName;
        $.each(attr, function (i) {
            TagXML = TagXML + " " + i + '="' + attr[i] + '"';
        });
        TagXML = TagXML + ">" + childXML + "</" + tagName + ">";

        return TagXML;
    };

    //This method: urlArgs provides the querystrings we pass from the URL
    this.urlArgs = () => {
        var args = {};
        var query = location.search.substring(1);
        var pairs = query.split("&");
        for (var i = 0; i < pairs.length; i++) {
            var pos = pairs[i].indexOf("=");
            if (pos == -1) {
                continue;
            }
            var name = pairs[i].substring(0, pos);
            var value = pairs[i].substring(pos + 1);
            args[name] = value;
        }
        return args;
    };

    this.getCustomerDetails = (flag, username) => {
        var PARAMS_array = [];
        PARAMS_array["attr"] = { elem: 0 };
        PARAMS_array["children"] = { VALUE: username };

        var xmlRawData = {
            PARAMS: PARAMS_array,
            POID: "0.0.0.1 /account -1 0",
            PROGRAM_NAME: "OAP",
            USER_NAME: JSON.parse(localStorage.getItem("csr_user_info")).LOGIN[0],
            FLAGS: flag,
        };

        var xmlRequest = genInputFlist(xmlRawData, "", "CUS_OP_SEARCH");
        var BRMUserArray = [];
        $.ajax({
            type: "POST",
            datatype: "XML",
            contentType: "application/xml",
            async: false,
            url: window.node_middleware_URL + "/csrdashboard/get",
            data: xmlRequest,
            // cache: false,
            error: function (error) {
                var ErrMsg = "Error occurred while fetching the Account Related Information";
                document.getElementById("UserAlertModalDialog_desc").innerHTML = ErrMsg;
                document.getElementById("UserAlertModalDialog").open();
            },
            success: function (response) {
                var key_index = "brm:" + "CUS_OP_SEARCH" + "_outputFlist";
                var key_index_1 = "brm:RESULTS";

                if (!response[key_index]) {
                    $("#login_error").attr("text", "Error in BRM while processing the request..");
                }

                BRMUserArray = response[key_index][key_index_1] ? response[key_index][key_index_1][0] : [];
            }.bind(this),
        });

        return BRMUserArray;
    };


    this.service_summary = (serviceid, actionURL) => {
        var username = localStorage.getItem("logged_in_csr_user");
        var PARAMS_array = [];
        PARAMS_array["attr"] = { elem: 0 };
        PARAMS_array["children"] = { VALUE: serviceid };

        var login_info = {
            PARAMS: PARAMS_array,
            POID: "0.0.0.1 /account -1 0",
            PROGRAM_NAME: "OAP",
            USER_NAME: username,
            FLAGS: "201",
        };
        var CamelCaseOpcode = "";
        var OpcodeName = "CUS_OP_SEARCH";
        var userXML = genInputFlist(login_info, CamelCaseOpcode, OpcodeName);

        $.ajax({
            type: "post",
            datatype: "XML",
            contentType: "application/xml",
            url: window.node_middleware_URL + "opcode-dbx/get",
            data: userXML,
            beforeSend: function (xhr, opts) {},
            error: function (error) {
                var ErrMsg = "Error occured while fetching The Service Summary Information";
                document.getElementById("UserAlertModalDialog_desc").innerHTML = ErrMsg;
                document.getElementById("UserAlertModalDialog").open();
            },
            success: function (response) {
                var key_index = "brm:" + OpcodeName + "_outputFlist";
                var key_index_1 = "brm:RESULTS";
                var CSRUser = [];

                if (!response[key_index]) {
                    $("#service_summary_error").attr("text", "Error in BRM while processing the request..");
                }

                var errFlag = false;
                if (response[0] && typeof response[0].err !== "undefined") {
                    errFlag = true;
                }
                if (errFlag) {
                    $("#service_summary_error").attr("text", response[0].err);
                } else if (response[key_index]["brm:ERROR_CODE"]) {
                    $("#service_summary_error").attr("text", response[key_index]["brm:ERROR_DESCR"]);
                } else {
                    var service_summary = response[key_index][key_index_1][0];
                    sessionStorage.setItem("service_summary_" + serviceid, JSON.stringify(service_summary));
                    if (actionURL) {
                        window.location = actionURL;
                    }
                }
            },
        });
    };

    this.ticketaccountsearch = (accountno, actionurl) => {
        // var detail = event.detail;
        // var eventTime = this._getCurrentTime();
        // this.searchTerm(detail.value);
        // this.searchItemContext(this._trimItemContext(detail.itemContext));
        // this.previousSearchTerm(detail.previousValue);
        // this.searchTimeStamp(eventTime);
        // this.errorMessageTimeout = ko.observable("3");

        /***  Quick Search for Accounts **/
        var self = this;
        var username = localStorage.getItem("logged_in_csr_user");
        var PARAMS_array = [];
        let data = {};
        data.$ = { elem: 0 };
        var HeaderSearchFlags = 5;
        data.value = accountno;

        if (HeaderSearchFlags === null) {
            var ErrMsg = "Invalid Search";
            document.getElementById("UserAlertModalDialog_desc").innerHTML = ErrMsg;
            document.getElementById("UserAlertModalDialog").open();
            return false;
        }

        PARAMS_array.push(data);
        var login_info = {
            PARAMS: PARAMS_array,
            POID: "0.0.0.1 /account -1 0",
            PROGRAM_NAME: "OAP",
            USER_NAME: username,
            FLAGS: HeaderSearchFlags,
            OpcodeName: "CUS_OP_SEARCH",
        };
        var CamelCaseOpcode = "";
        var OpcodeName = "CUS_OP_SEARCH";
        //var userXML = genInputFlist(login_info, CamelCaseOpcode, OpcodeName);

        $.ajax({
            type: "post",
            datatype: "XML",
            //        contentType: "application/xml",
            url: window.node_middleware_URL + "/opcode-dbx/CallOpcode",
            data: login_info,
            beforeSend: function (xhr, opts) {
                $("#quick-search-progress-circle").show();
                // $("#continue").attr("Label", "Logging in...");
                // $("#login_error").attr("text", "");
            },
            error: function (error) {
                $("#quick-search-progress-circle").hide();
                var ErrMsg = "Error occurred while fetching the Search Results";
                document.getElementById("UserAlertModalDialog_desc").innerHTML = ErrMsg;
                document.getElementById("UserAlertModalDialog").open();
            },
            success: function (response) {
                $("#quick-search-progress-circle").hide();
                var key_index = "brm:" + OpcodeName + "_outputFlist";
                var key_index_1 = "brm:RESULTS";

                if (!response[key_index]) {
                    // alert("Error in BRM while processing the request..");
                    //            this.messages([
                    //              {
                    //                severity: "warning",
                    //                autoTimeout: 3000,
                    //                summary: "Error in BRM while processing the request..",
                    //                // detail: 'Message timeout set to: ' + this.errorMessageTimeout(),
                    //                // autoTimeout: parseInt(this.errorMessageTimeout(), 3)
                    //              },
                    //            ]);
                    //            this.messagesDataprovider = new ArrayDataProvider(this.messages);
                    var ErrMsg = "Error in BRM while processing the request..";
                    document.getElementById("UserAlertModalDialog_desc").innerHTML = ErrMsg;
                    document.getElementById("UserAlertModalDialog").open();
                }
                if (response[key_index]["brm:ERROR_CODE"]) {
                    //            this.messages([
                    //              {
                    //                severity: "warning",
                    //                autoTimeout: 3000,
                    //                summary:
                    //                  response[key_index]["brm:ERROR_DESCR"][0] +
                    //                  " for given input",
                    //                // detail: 'Message timeout set to: ' + this.errorMessageTimeout(),
                    //                // autoTimeout: parseInt(this.errorMessageTimeout(), 3)
                    //              },
                    //            ]);
                    //            this.messagesDataprovider = new ArrayDataProvider(this.messages);
                    var ErrMsg = response[key_index]["brm:ERROR_DESCR"][0] + " for the Given Inputs";
                    document.getElementById("UserAlertModalDialog_desc").innerHTML = ErrMsg;
                    document.getElementById("UserAlertModalDialog").open();
                } else {
                    // this.messages([
                    //   {
                    //     severity: "info",
                    //     autoTimeout: 3000,
                    //     summary: "Account Number has been Found ",
                    //   },
                    // ]);
                    // this.messagesDataprovider = new ArrayDataProvider(this.messages);
                    var results = response[key_index][key_index_1];
                    var results_count = results.length;

                    if (results_count === 1) {
                        // if(this.searchType() === 'csr_search_username')
                        // {
                        //     var redirectURL =   window.Ojet_base_URL + "?ojr=my-dashboard&usertosearch="    +   searchText;
                        //     window.location =   redirectURL;
                        // }
                        // else
                        // {
                        var BRMUserArray = response[key_index][key_index_1][0];
                        var userAccNo = BRMUserArray["brm:ACCOUNT_NO"] ? BRMUserArray["brm:ACCOUNT_NO"][0] : false;
                        if (!userAccNo && BRMUserArray["brm:PROFILES"] && BRMUserArray["brm:PROFILES"][0]) {
                            var userAccNo = BRMUserArray["brm:PROFILES"][0]["brm:ACCOUNT_NO"] ? BRMUserArray["brm:PROFILES"][0]["brm:ACCOUNT_NO"][0] : "";
                        }
                        var AccValue = BRMUserArray["brm:VALUE"] ? BRMUserArray["brm:VALUE"][0] : userAccNo;
                        account_info = JSON.stringify(BRMUserArray);
                        //sessionStorage.setItem("account_info_" + userAccNo, account_info);
                        localStorage.setItem("account_info_" + userAccNo, account_info);

                        // var redirectURL =
                        //   window.Ojet_base_URL + "?ojr=account-mgmt&acc_id=" + userAccNo;
                        // if (AccValue && AccValue.search("CA") !== -1) {
                        //   var redirectURL =
                        //     window.Ojet_base_URL +
                        //     "?ojr=ca-dashboard-view&acc_id=" +
                        //     AccValue;
                        // }
                        if (!userAccNo && !AccValue) {
                            var ErrMsg = "Something went wrong, Error in fetching the Search Results";
                            document.getElementById("UserAlertModalDialog_desc").innerHTML = ErrMsg;
                            document.getElementById("UserAlertModalDialog").open();
                        } else {
                            // window.location = redirectURL;
                            window.location = actionurl;
                        }
                        // }
                    }
                }
            }.bind(this),
        });
    };

    //Helps us to validate all the paraneters are defines and valid
    this.validateParams = (DataObject) => {
        //        return true;
        for (key in DataObject) {
            // if(typeof DataObject.key  === "undefined" &&  DataObject.key  === undefined)
            console.log(DataObject.key);
            console.log(DataObject[key]);
            if (typeof DataObject[key] === "undefined" || DataObject[key] === null) {
                return false;
            }
        }
        return true;
    };
    /*-------------Surekha print pdf logic and export csv logic -----*/
    self.generatePrintableTable = function (tableColumns, data) {
        console.log("Printing data2....", data);
        const columnNames = tableColumns.map((column) => column.field);
        let printData = '<table border="1" style="width:100%;"><thead><tr>';

        for (let i = 0; i < tableColumns.length; i++) {
            printData += `<th>${tableColumns[i].headerText}</th>`;
        }

        printData += "</tr></thead><tbody>";

        for (let i = 0; i < data.length; i++) {
            printData += "<tr>";
            const rowData = data[i];

            for (let j = 0; j < columnNames.length; j++) {
                printData += "<td>";
                const columnName = columnNames[j];
                const cellValue = rowData[columnName] != null ? rowData[columnName].toString() : "&nbsp;";
                printData += cellValue + "</td>";
            }

            printData += "</tr>";
        }

        printData += "</tbody></table>";
        return printData;
    };
    self.generatePrintableTable1 = function (heading, tableColumns, data) {
        console.log("Printing data2....", data);
        console.log(tableColumns);
        const columnNames = tableColumns.map((column) => column.field);
        let printData = `<div style="width:30%; margin:2%"><h2>${heading}</h2>`;
        for (let i = 0; i < tableColumns.length; i++) {
            console.log(data[i]);
            printData += `<b>${tableColumns[i].headerText}</b>: ${data[i][tableColumns[i].field]}<br>`;
        }
        printData += "</div>";
        return printData;
    };
    /// Export CSV  logic start here
    self.generateCSV = function (tableColumns, data) {
        const headerColumnNames = tableColumns
            .filter(function (element) {
                return element.headerText.toLowerCase() !== "action";
            })
            .map(function (element) {
                return element.headerText;
            });

        const columnNames = tableColumns
            .filter(function (element) {
                return element.field !== undefined;
            })
            .map(function (element) {
                return element.field;
            });
        let csvData = "";

        // Add column headers
        csvData += headerColumnNames.map((headerColumnName) => `"${headerColumnName}"`).join(",") + "\n";

        // Add rows
        data.forEach((rowData) => {
            const rowValues = columnNames.map((columnName) => {
                const cellValue = rowData[columnName] != null ? rowData[columnName].toString() : "";
                return `"${cellValue}"`;
            });
            csvData += rowValues.join(",") + "\n";
        });

        return csvData;
    };

    self.showToast = (title, message, bgColor) => {

        document.getElementById("UserAlertModalDialog_desc").innerHTML  =  message ;
        document.getElementById("UserAlertModalDialog").setAttribute("dialog-title", title)
        document.getElementById("UserAlertModalDialog").open();

        return;
        const toastDiv = document.createElement("div");
        toastDiv.classList.add("toast");

        const iconElement = document.createElement("span");
        iconElement.innerHTML = "&#9888;";
        iconElement.style.fontSize = "32px";
        iconElement.style.verticalAlign = "middle";

        const titleElement = document.createElement("div");

        titleElement.textContent = title || "Alert!";
        titleElement.classList.add("toast-title");
        titleElement.style.backgroundColor = bgColor || "blue";
        titleElement.style.color = "white";
        titleElement.style.fontWeight = "bold";
        titleElement.style.fontSize = "20px";
        titleElement.style.marginBottom = "5px";
        titleElement.style.padding = "5px";

        iconElement.style.marginRight = "5px";
        titleElement.insertBefore(iconElement, titleElement.firstChild);

        const messageElement = document.createElement("div");
        messageElement.textContent = message || "";
        messageElement.classList.add("toast-message");
        messageElement.style.fontSize = "12px";
        messageElement.style.padding = "5px";
        messageElement.style.textAlign = "center";
        messageElement.style.backgroundColor = "white";
        messageElement.style.color = "black";
        messageElement.style.height = "60px";

        toastDiv.appendChild(titleElement);
        toastDiv.appendChild(messageElement);

        toastDiv.style.width = "350px";
        toastDiv.style.height = "80px";
        toastDiv.style.backgroundColor = "white";
        toastDiv.style.color = "black";
        toastDiv.style.position = "fixed";
        toastDiv.style.top = "50%";
        toastDiv.style.left = "50%";
        toastDiv.style.transform = "translate(-50%, -50%)";
        toastDiv.style.zIndex = "9999";
        toastDiv.style.borderRadius = "5px";
        toastDiv.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        toastDiv.style.overflow = "hidden";
        toastDiv.style.fontFamily = "Arial, sans-serif";

        document.body.appendChild(toastDiv);

        // setTimeout(function () {
        //     document.body.removeChild(toastDiv);
        // }, 3000);
    };

    this.hasPermissions = (objectNames) => {
        //return true;
        let permissionArray = JSON.parse(localStorage.getItem("permission")) || [];

        if (!Array.isArray(objectNames)) {
            objectNames = objectNames.split(",").map((objectName) => objectName.trim());
        }

        let result = objectNames.some((objectName) => {
            return permissionArray.some((permission) => permission.value == objectName);
        });

        return result;
    };

    this.hasTicketdashbaord = (dashboardName) => {
        var resp = 0;
        if (localStorage.getItem(dashboardName)) {
            resp = JSON.parse(localStorage.getItem(dashboardName));
        } else {
            var FlagVal = 1;
            if (dashboardName !== "codashbaord") {
                FlagVal = 2;
            }
            var user_info = {
                POID: "0.0.0.1 /team_member -1 0",
                PIN_FLD_FLAGS: FlagVal,
                OpcodeName: "CUS_OP_TKT_SEARCH_MEMBER",
            };
            var OpcodeName = "CUS_OP_TKT_SEARCH_MEMBER";
            $.ajax({
                type: "post",
                async: false,
                url: window.node_middleware_URL + "/opcode-dbx/CallOpcode",
                data: user_info,
                beforeSend: function (xhr, opts) {}.bind(this),
                error: function (error) {
                    var ErrMsg = "Error occurred while fetching the Mapping Data 1";
                    document.getElementById("UserAlertModalDialog_desc").innerHTML = ErrMsg;
                    // document.getElementById("UserAlertModalDialog").open();
                }.bind(this),
                success: function (result) {
                    var key_index = "brm:" + OpcodeName + "_outputFlist";
                    var key_index_1 = "brm:RESULTS";
                    var ErrMsg = "Error occurred while fetching the Mapping Data 2";
                    if (result.err && result.err !== "") {
                        ErrMsg = result.err;
                        document.getElementById("UserAlertModalDialog_desc").innerHTML = ErrMsg;
                        // document.getElementById("UserAlertModalDialog").open();
                    } else if (result[key_index]["brm:ERROR_CODE"]) {
                        var ErrMsg = result[key_index]["brm:ERROR_DESCR"][0];
                        document.getElementById("UserAlertModalDialog_desc").innerHTML = ErrMsg;
                        // document.getElementById("UserAlertModalDialog").open();
                    } else {
                        var results = result[key_index][key_index_1];
                        var loggeduser = JSON.parse(localStorage.getItem("csr_user_info"))["LOGIN"][0];
                        var j = 0;
                        var exist = 0;

                        for (j in results) {
                            if (results[j]["brm:USER_NAME"] && results[j]["brm:USER_NAME"][0] && results[j]["brm:USER_NAME"][0] == loggeduser) {
                                exist++;
                            }
                        }

                        if (exist > 0) {
                            localStorage.setItem(dashboardName, 1);
                            resp = 1;
                        } else {
                            localStorage.setItem(dashboardName, 0);
                        }
                    }
                },
            });
        }
        return resp;
    };


    this.formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return "0 Bytes";

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return "${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}";
    };

    async function postData(url = "", data = {}) {
        let jsonResponse;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error("Something went wrong");
            })
            .then((responseJson) => {
                jsonResponse = responseJson;
            })
            .catch((error) => {
                alert(error);
            });

        return jsonResponse;
    }

    //validation user Session as per Application Config (csr_user_session /  SessionTimeOut)
    this.UserSessionTimeOut = () => {
        var CSR_userID = localStorage.getItem("logged_in_csr_user");
        if (CSR_userID) {
            var UserSessionTime = localStorage.getItem("csr_user_timestamp") ? localStorage.getItem("csr_user_timestamp") : 0;
            var SessionTimeOut = getConfigInfo("csr_user_session").find(function (e) {
                return e.label === "SessionTimeOut";
            });
            var TimeStamp = parseInt(Date.now());
            var MaxTimeStamp = parseInt(SessionTimeOut.value) + parseInt(UserSessionTime);

            if (TimeStamp > MaxTimeStamp) {
                //                showToast('Your Session Time Out', getTxnLabel("Please Re-login.."), '#e14b4b');
                sessionStorage.clear();
                localStorage.clear();
                document.getElementById("UserSessionOutModalDialog").open();
                //                setTimeout(function () {
                ////                    window.location = window.Ojet_base_URL;
                //                }, 2000);
            } else {
                console.log("User Login Session is Valid");
                return true;
            }
        }
    };

    this.text_truncate = (str, length, ending) => {
        if (length === null) {
            length = 30;
        }
        if (ending === null) {
            ending = "...";
        }
        if (str.length > length) {
            return str.substring(0, length - ending.length) + ending;
        } else {
            return str;
        }
    };

    this.current_datetime = () => {
        const currentDate = new Date();

        const options = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            fractionalSecondDigits: 3,
            timeZoneName: "short", // This will add the timezone offset
            timeZone: 'EET',
        };

        const localDateTimeString = new Intl.DateTimeFormat("en-GB", options).format(currentDate);

        // Reformat the string to match the ISO 8601 format
        const [date, time] = localDateTimeString.split(/, | /);
        const formattedDate = date.split("/").reverse().join("-");
        
        //const formattedTime = time.replace(/\./g, ":");
        const formattedTime = time;

        const localISOString = `${formattedDate}T${formattedTime}Z`;

        return localISOString;
    };

    function subscribe(topic, listener) {
        if (!topics[topic]) {
            topics[topic] = [];
        }
        return topics[topic].push({ listener: listener });
    }

    function publish(topic, data) {
        if (topics[topic]) {
            topics[topic].forEach(function (subscription) {
                return subscription.listener(data);
            });
        }
    }

    function unsubscribe(topic, listener) {
        if (topics[topic]) {
            topics[topic] = topics[topic].filter(function (subscription) {
                return subscription.listener !== listener;
            });
        }
    }

    return {
        postData: postData,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        publish: publish,
    };
});
