angular.module('starter.controllers').controller('usercontrol', function($scope, $ionicModal, $ionicPopup, $cordovaSQLite, $timeout, $state, UserService, GroupService) {
        $scope.$on('$ionicView.enter', function() {
            UserService.findallusers().then(function(users) {
                $scope.users = users;
            })
            GroupService.findallgroups().then(function(groups) {
                $scope.groups = groups;
            })
        })
        $scope.place_selectgroups = 'Select . .';
        $scope.userdata = {};
        $scope.formdata = {};
        $scope.shouldShowDelete = false;
        $scope.listCanSwipe = true;

        $scope.showaddUser = function() {
            $ionicModal.fromTemplateUrl('templates/addusermodal.html', function(modal) {
                $scope.addusermodal = modal;
                $scope.addusermodal.show();
            }, {
                scope: $scope
            });
        };
        $scope.hideaddusermodal = function() {
            $scope.addusermodal.hide();
        }
        
        $scope.getuserdetails = function(user) {
            console.log('Doing getuserdetails', user);
        };
        $scope.adduser = function(usr_data) {
            var p1 = UserService.addnewuser(usr_data);
            p1.then(function(val) {
                //clearup the form data
                $scope.userdata = {};
                $scope.formdata = {};
                $scope.place_selectgroups = 'Select . .';
                //show popup for successful addition of user
                var myPopup = $ionicPopup.show({
                    template: '',
                    title: 'Add User',
                    subTitle: 'User added successfully !'
                })
                myPopup.then(function(res) {

                });
                $timeout(function() {
                    myPopup.close(); //close the popup after a second
                }, 1000);
                // $state.go("app.listusers");
                $scope.hideaddusermodal();
                UserService.findallusers().then(function(users) {
                    $scope.users = users;
                })
            })

        }

        $scope.showselectgroups = function() {
            $ionicModal.fromTemplateUrl('selectgroups.html', function(modal) {
                $scope.selectgroupsmodal = modal;
                $scope.selectgroupsmodal.show();
            }, {
                scope: $scope
            });
        }

        $scope.hideselectgroups = function() {
            $scope.selectgroupsmodal.hide();
        }

        $scope.validateselectgroups = function() {
            $scope.userdata.groups = "";
            var groupstring = "";
            var len = 0;
            for (var c in $scope.formdata.selectgroups) {
                if ($scope.formdata.selectgroups.hasOwnProperty(c) && $scope.formdata.selectgroups[c] !== null && $scope.formdata.selectgroups[c] !== false && $scope.formdata.selectgroups[c] !== 0) {
                    len = len + 1;
                    $scope.userdata.groups = $scope.userdata.groups + ";" + c;
                }

            }
            //console.log($scope.groupdata.users )
            result = $scope.groups.filter(function(obj) {
                return obj.id == $scope.userdata.groups.split(";")[1];
            });
            if (len > 1)
                groupstring = result[0].name + " + " + (len - 1) + " more";
            else
                groupstring = result[0].name;
            $scope.hideselectgroups();
            $scope.place_selectgroups = groupstring;
            console.log($scope.userdata.groups)
        }
        $scope.showuserdetails = function(user) {
            console.log("displaying user details", user);
        }
    })
    .controller('userdetailcontroltrl', function($scope, $stateParams, $ionicActionSheet, $ionicPopup, $timeout, $ionicModal,$ionicHistory, $state, UserService, ExpenseService, GroupService) {
        $scope.$on('$ionicView.enter', function() {
            $scope.currentuser = $stateParams.userId;
            UserService.findbyid($stateParams.userId).then(function(user) {
                $scope.user = user;
            });
            UserService.findgroups($stateParams.userId).then(function(groups) {
                if (groups.length > 0) {
                    $scope.groups = groups;
                    $scope.groupstring = "";
                    for (i = 0; i < groups.length; i++) {
                        $scope.groupstring = $scope.groupstring + ", " + groups[i].name;
                    }
                    $scope.groupstring = $scope.groupstring.substring(1);
                }
            });
            $scope.getusergroupswithmembersandbalances();
            GroupService.getusergroupswithmembers($stateParams.userId).then(function(usergrp_members) {
                $scope.user_grp_members = usergrp_members;

            })

            UserService.findpayments($stateParams.userId).then(function(payments) {
                if (payments.length > 0) {
                    $scope.payments = payments;
                }

            });
            UserService.findspends($stateParams.userId).then(function(spends) {
                if (spends.length > 0) {
                    $scope.spends = spends;
                }

            });
            ExpenseService.findtotalpaymentsofuser($stateParams.userId).then(function(total_payments) {
                $scope.total_payments = total_payments;
            });
            ExpenseService.findtotalspendsofuser($stateParams.userId).then(function(total_spends) {
                $scope.total_spends = total_spends;
            });
            $scope.getusersettlements();
            $scope.getsettlementtotals();
            UserService.findsettlements($stateParams.userId).then(function(settlements) {
                $scope.settlements = settlements;
            });

        });
        $scope.SettlemetsmadeExpanded = true;
        $scope.formdata = {};
        $scope.getusersettlements = function() {
            UserService.findsettlements($stateParams.userId).then(function(settlements) {
                $scope.settlements_made = [];
                $scope.settlements_recieved = [];
                for (i = 0; i < settlements.length; i++) {
                    if (settlements[i].from.id == $stateParams.userId) {
                        $scope.settlements_made.push(settlements[i]);
                    } else {
                        $scope.settlements_recieved.push(settlements[i]);
                    }
                }
            });
        }
        $scope.getsettlementtotals = function() {
            UserService.findsettlementtotals($stateParams.userId).then(function(settlementstotal) {
                $scope.settlementstotal = settlementstotal;
            })
        }
        $scope.getusergroupswithmembersandbalances = function() {
            UserService.findgroups($stateParams.userId).then(function(groups) {
                $scope.groupbalances = [];
                angular.forEach(groups, function(group) {
                    ExpenseService.findtotalpaymentsofuser_grp($stateParams.userId, group.id).then(function(paymentsofuser) {
                        ExpenseService.findtotalspendsofuser_grp($stateParams.userId, group.id).then(function(spendsofuser) {
                            ExpenseService.findtotalsettlement_paidofuser_grp($stateParams.userId, group.id).then(function(settlementamont_paid) {
                                ExpenseService.findtotalsettlement_recievedofuser_grp($stateParams.userId, group.id).then(function(settlementamont_recieved) {
                                    grpbal = {}
                                    grpbal.name = group.name
                                    grpbal.id = group.id
                                    grpbal.balance = (paymentsofuser - spendsofuser + settlementamont_paid - settlementamont_recieved);
                                    if (Math.abs(grpbal.balance) < 0.01) {
                                        grpbal.balance = 0;
                                    }
                                    $scope.groupbalances.push(grpbal);
                                })
                            })
                        });
                    });

                });
            });
        }
        $scope.togglesearch = function() {
            if ($scope.isSearchbarShown()) {
                $scope.showsearchbar = null;
            } else {
                $scope.showsearchbar = true;
            }
        };
        $scope.isSearchbarShown = function() {
            return $scope.showsearchbar;
        };
        $scope.issettlementsshown = function(groupbalance) {
            return $scope.SettlemetsExpanded === groupbalance;
        };
        $scope.updateuserbalances = function() {
            $scope.SettlemetsmadeExpanded = true;
            angular.forEach($scope.user_grp_members, function(grp) {
                angular.forEach(grp.grp_users, function(user) {
                    ExpenseService.findtotalpaymentsofuser_grp(user.id, grp.grp_id).then(function(paymentsofuser) {
                        user.payments = paymentsofuser
                        ExpenseService.findtotalspendsofuser_grp(user.id, grp.grp_id).then(function(spendsofuser) {
                            user.spends = spendsofuser
                            ExpenseService.findtotalsettlement_paidofuser_grp(user.id, grp.grp_id).then(function(settlementamont_paid) {
                                user.settlemetnspaid = settlementamont_paid;
                                ExpenseService.findtotalsettlement_recievedofuser_grp(user.id, grp.grp_id).then(function(settlementamont_recieved) {
                                    user.settlemetnsrecieved = settlementamont_recieved;
                                    user.balance = (paymentsofuser - spendsofuser + settlementamont_paid - settlementamont_recieved);
                                })
                            })
                        });

                    });
                });
            });
        }
        $scope.showusersettlements = function(groupbalance) {
            if ($scope.issettlementsshown(groupbalance)) {
                $scope.SettlemetsExpanded = null;
            } else {
                $scope.SettlemetsExpanded = groupbalance;
            }
            $scope.users = $scope.user_grp_members[groupbalance.id].grp_users;
            $scope.balances = []
            $scope.suggestions = []
            for (i = 0; i < $scope.users.length; i++) {
                balance = {}
                balance.user_id = $scope.users[i].id;
                balance.user_name = $scope.users[i].name;
                balance.balance = $scope.users[i].balance;
                $scope.balances.push(balance);
            }
            $scope.balances.sort(function(a, b) {
                return a.balance - b.balance;
            })
            balances_temp = $scope.balances;

            while (balances_temp.length > 0) {
                txn = {}
                baltemp = balances_temp[0].balance + balances_temp[balances_temp.length - 1].balance
                if (Math.abs(balances_temp[0].balance) > Math.abs(balances_temp[balances_temp.length - 1].balance)) {
                    balances_temp[0].balance = balances_temp[0].balance + balances_temp[balances_temp.length - 1].balance;
                    txn.from = {
                        id: balances_temp[0].user_id,
                        name: balances_temp[0].user_name
                    }
                    txn.to = {
                        id: balances_temp[balances_temp.length - 1].user_id,
                        name: balances_temp[balances_temp.length - 1].user_name
                    }
                    txn.amt = Math.abs(balances_temp[balances_temp.length - 1].balance);
                    balances_temp[balances_temp.length - 1].balance = 0;
                    $scope.suggestions.push(txn)
                } else if (Math.abs(balances_temp[0].balance) < Math.abs(balances_temp[balances_temp.length - 1].balance)) {
                    balances_temp[balances_temp.length - 1].balance = balances_temp[0].balance + balances_temp[balances_temp.length - 1].balance;
                    txn.from = {
                        id: balances_temp[0].user_id,
                        name: balances_temp[0].user_name
                    }
                    txn.to = {
                        id: balances_temp[balances_temp.length - 1].user_id,
                        name: balances_temp[balances_temp.length - 1].user_name
                    }
                    txn.amt = Math.abs(balances_temp[0].balance);
                    balances_temp[0].balance = 0;
                    $scope.suggestions.push(txn)
                } else {
                    txn.from = {
                        id: balances_temp[0].user_id,
                        name: balances_temp[0].user_name
                    }
                    txn.to = {
                        id: balances_temp[balances_temp.length - 1].user_id,
                        name: balances_temp[balances_temp.length - 1].user_name
                    }
                    txn.amt = Math.abs(balances_temp[balances_temp.length - 1].balance);
                    balances_temp[balances_temp.length - 1].balance = 0;
                    balances_temp[0].balance = 0;
                    $scope.suggestions.push(txn)
                }
                balances_temp = balances_temp.filter(function(x) {
                    return !(Math.abs(x.balance) < 0.01)
                })
            }
            // show only settlements in which user is involved
            $scope.suggestions = $scope.suggestions.filter(function(suggestion) {
                return !(suggestion.to.id != $stateParams.userId && suggestion.from.id != $stateParams.userId)
            })
        }
        $scope.showActionsheet = function(suggestion) {
            $ionicActionSheet.show({
                titleText: 'Settle',
                buttons: [{
                    text: '<i class="icon ion-checkmark-circled"></i> Completely'
                }, {
                    text: '<i class="icon ion-ios-checkmark-outline"></i> partially'
                }, ],
                cancelText: 'Cancel',
                cancel: function() {
                    console.log('CANCELLED');
                },
                buttonClicked: function(index) {
                    if (index == 0) {
                        $scope.dataforsettlement = suggestion;
                        $scope.dataforsettlement.grp = $scope.SettlemetsExpanded;
                        console.log("settle completely" + $scope.dataforsettlement.amt)
                        $scope.addsettlement()
                    }
                    if (index == 1) {
                        $scope.showpartialsettlementPopup(suggestion);
                    }

                    return true;
                },
                destructiveButtonClicked: function() {
                    console.log('DESTRUCT');
                    return true;
                }
            });
        };
        $scope.showpartialsettlementPopup = function(suggestion) {
            $scope.popupdata = {}
            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="popupdata.amount">',
                title: 'Enter amount for settlement',
                scope: $scope,
                buttons: [{
                    text: '<button class="button-small"><p>cancel</p></button>'
                }, {
                    text: '<button class="button-small"><p>settle</p></i>',
                    type: 'button-positive',
                    onTap: function(e) {
                        if (!$scope.popupdata.amount) {
                            //don't allow the user to close unless he enters wifi password
                            e.preventDefault();
                        } else {
                            $scope.dataforsettlement = {};
                            $scope.dataforsettlement.from = suggestion.from;
                            $scope.dataforsettlement.to = suggestion.to;
                            $scope.dataforsettlement.amt = $scope.popupdata.amount;
                            $scope.dataforsettlement.grp = $scope.SettlemetsExpanded;
                            console.log("settle partially" + $scope.dataforsettlement.amt)
                            $scope.addsettlement()

                        }
                    }
                }]
            });
        }
        $scope.addsettlement = function() {
            ExpenseService.addsettlement($scope.dataforsettlement).then(function() {
                $scope.getusersettlements();
                $scope.getsettlementtotals();
                $scope.doRefresh();
            })
        }
        $scope.doRefresh = function() {
            $timeout(function() {
                $scope.getusergroupswithmembersandbalances();
                $scope.updateuserbalances();
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $scope.refresh = function() {
            $timeout(function() {
                $scope.getusergroupswithmembersandbalances();
                $scope.updateuserbalances();
                $scope.showusersettlements($scope.dataforsettlement.grp);
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };
        $scope.issettlements_madeshown = function() {
            return $scope.SettlemetsmadeExpanded;
        };
        $scope.togglesettlements_made = function() {
            if ($scope.issettlements_madeshown()) {
                $scope.SettlemetsmadeExpanded = null;
            } else {
                $scope.SettlemetsmadeExpanded = true;
            }
        };
        $scope.issettlements_recievedshown = function() {
            return $scope.SettlemetsrecievedExpanded;
        };
        $scope.togglesettlements_recieved = function() {
            if ($scope.issettlements_recievedshown()) {
                $scope.SettlemetsrecievedExpanded = null;
            } else {
                $scope.SettlemetsrecievedExpanded = true;
            }
        };
        $scope.showeditusermodal = function(user) {
            $ionicModal.fromTemplateUrl('templates/editusermodal.html', function(modal) {
                $scope.edituserdata = {}
                $scope.currentgroups = $scope.groups
                $scope.edituserdata.name = $scope.user.name;
                $scope.editusermodal = modal;
                $scope.editusermodal.show();
            }, {
                scope: $scope
            });
        };
        $scope.hideeditusermodal = function() {
            $scope.editusermodal.hide();
        }
        $scope.showselectgroups = function() {
            GroupService.findallgroups().then(function(groups) {
                $scope.moregroups = groups;
                for (var i = $scope.groups.length - 1; i >= 0; i--) {
                    for (var j = 0; j < $scope.currentgroups.length; j++) {
                        if ($scope.moregroups[i] && ($scope.moregroups[i].id === $scope.currentgroups[j].id)) {
                            $scope.moregroups.splice(i, 1);
                        }
                    }
                }

            })
            $ionicModal.fromTemplateUrl('selectgroups.html', function(modal) {
                $scope.selectgroupsmodal = modal;
                $scope.selectgroupsmodal.show();
            }, {
                scope: $scope
            });
        }

        $scope.hideselectgroups = function() {
            $scope.selectgroupsmodal.hide();
        }

        $scope.validateselectgroups = function() {
            $scope.edituserdata.groups = "";
            var groupstring = "";
            var len = 0;
            for (var c in $scope.formdata.selectgroups) {
                if ($scope.formdata.selectgroups.hasOwnProperty(c) && $scope.formdata.selectgroups[c] !== null && $scope.formdata.selectgroups[c] !== false && $scope.formdata.selectgroups[c] !== 0) {
                    len = len + 1;
                    $scope.edituserdata.groups = $scope.edituserdata.groups + ";" + c;
                }

            }
            //console.log($scope.groupdata.users )
            result = $scope.moregroups.filter(function(obj) {
                return obj.id == $scope.edituserdata.groups.split(";")[1];
            });
            if (len > 1)
                groupstring = result[0].name + " + " + (len - 1) + " more";
            else
                groupstring = result[0].name;
            $scope.hideselectgroups();
            $scope.place_selectgroups = groupstring;
            console.log($scope.edituserdata.groups)
        }
        $scope.deleteuser = function() {
            UserService.deleteuser($stateParams.userId).then(function(){
                 var myPopup = $ionicPopup.show({
                    template: '',
                    title: 'Delete User',
                    subTitle: 'User deleted successfully !'
                })
                 $timeout(function() {
                    myPopup.close(); //close the popup after a second
                }, 1000);
                $ionicHistory.nextViewOptions({
                    historyRoot: true
                })
                $scope.hideeditusermodal();
                $state.go("app.listusers");
            })
        };
        
        $scope.edituser = function(usr_data) {
            usr_data.id = $stateParams.userId;
            var p1 = UserService.edituser(usr_data);
            p1.then(function(val) {
                //clearup the form data
                $scope.edituserdata = {};
                $scope.formdata = {};
                $scope.place_selectgroups = 'Select . .';
                //show popup for successful addition of user
                var myPopup = $ionicPopup.show({
                    template: '',
                    title: 'Edit User',
                    subTitle: 'User edited successfully !'
                })
                $scope.currentuser = $stateParams.userId;
                UserService.findbyid($stateParams.userId).then(function(user) {
                    $scope.user = user;
                });
                UserService.findgroups($stateParams.userId).then(function(groups) {
                    if (groups.length > 0) {
                        $scope.groups = groups;
                        $scope.groupstring = "";
                        for (i = 0; i < groups.length; i++) {
                            $scope.groupstring = $scope.groupstring + ", " + groups[i].name;
                        }
                        $scope.groupstring = $scope.groupstring.substring(1);
                    }
                });
                $timeout(function() {
                    myPopup.close(); //close the popup after a second
                }, 1000);
                // $state.go("app.listusers");
                $scope.hideeditusermodal();
                $state.go("app.userdetail", {
                    userId: $stateParams.userId
                })
            })

        }

    })